import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { Queue } from 'bullmq';
import { IsNull, Repository } from 'typeorm';
import { EMAIL_QUEUE } from '../../common/constants/queue.constants';
import { AuditService } from '../audit/audit.service';
import { Room } from '../rooms/entities/room.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { BookingResponseDto } from './dto/booking-response.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { Booking } from './entities/booking.entity';

@Injectable()
export class BookingsService {
  public constructor(
    @InjectRepository(Booking) private readonly bookingRepo: Repository<Booking>,
    @InjectRepository(Room) private readonly roomRepo: Repository<Room>,
    @InjectQueue(EMAIL_QUEUE) private readonly emailQueue: Queue,
    private readonly auditService: AuditService,
  ) {}

  public async getBookings(userId: string, role: string, page = 1, limit = 25): Promise<{ items: BookingResponseDto[]; total: number }> {
    const safeLimit = Math.min(Math.max(limit, 1), 100);
    const safePage = Math.max(page, 1);
    const where = role === 'admin' ? { deletedAt: IsNull() } : { userId, deletedAt: IsNull() };
    const [items, total] = await this.bookingRepo.findAndCount({ where, skip: (safePage - 1) * safeLimit, take: safeLimit, order: { createdAt: 'DESC' } });
    return {
      items: items.map((item) => plainToInstance(BookingResponseDto, item, { excludeExtraneousValues: true })),
      total,
    };
  }

  public async getBookingById(id: string, userId: string, role: string): Promise<BookingResponseDto> {
    const booking = await this.bookingRepo.findOne({ where: { id, deletedAt: IsNull() } });
    if (booking === null) throw new NotFoundException('Booking not found');
    await this._validateBookingOwnership(booking, userId, role);
    return plainToInstance(BookingResponseDto, booking, { excludeExtraneousValues: true });
  }

  public async createBooking(dto: CreateBookingDto, userId: string, ipAddress: string | null, userAgent: string | null): Promise<BookingResponseDto> {
    await this._checkRoomAvailability(dto.roomId, dto.checkInDate, dto.checkOutDate);
    const totalAmount = await this._calculateTotalAmount(dto.roomId, dto.checkInDate, dto.checkOutDate);
    const booking = this.bookingRepo.create({
      roomId: dto.roomId,
      userId,
      checkInDate: new Date(dto.checkInDate),
      checkOutDate: new Date(dto.checkOutDate),
      guestCount: dto.guestCount,
      totalAmount,
      status: 'pending',
      specialRequests: dto.specialRequests ?? null,
    });
    const saved = await this.bookingRepo.save(booking);
    void this._queueConfirmationEmail(saved.id, saved.userId, saved.roomId);
    await this.auditService.log({ entityType: 'Booking', entityId: saved.id, action: 'CREATE', operatorId: userId, ipAddress: ipAddress ?? undefined, userAgent: userAgent ?? undefined, newValues: saved });
    return plainToInstance(BookingResponseDto, saved, { excludeExtraneousValues: true });
  }

  public async updateBooking(id: string, dto: UpdateBookingDto, userId: string, role: string, ipAddress: string | null, userAgent: string | null): Promise<BookingResponseDto> {
    const booking = await this.bookingRepo.findOne({ where: { id, deletedAt: IsNull() } });
    if (booking === null) throw new NotFoundException('Booking not found');
    await this._validateBookingOwnership(booking, userId, role);
    const oldValues = { ...booking };
    Object.assign(booking, {
      ...dto,
      checkInDate: dto.checkInDate ? new Date(dto.checkInDate) : booking.checkInDate,
      checkOutDate: dto.checkOutDate ? new Date(dto.checkOutDate) : booking.checkOutDate,
      specialRequests: dto.specialRequests ?? booking.specialRequests,
    });
    if (dto.checkInDate !== undefined || dto.checkOutDate !== undefined) {
      booking.totalAmount = await this._calculateTotalAmount(booking.roomId, booking.checkInDate.toISOString(), booking.checkOutDate.toISOString());
    }
    const saved = await this.bookingRepo.save(booking);
    await this.auditService.log({ entityType: 'Booking', entityId: saved.id, action: 'UPDATE', operatorId: userId, ipAddress: ipAddress ?? undefined, userAgent: userAgent ?? undefined, oldValues, newValues: saved });
    return plainToInstance(BookingResponseDto, saved, { excludeExtraneousValues: true });
  }

  public async cancelBooking(id: string, userId: string, role: string, ipAddress: string | null, userAgent: string | null): Promise<{ success: true }> {
    const booking = await this.bookingRepo.findOne({ where: { id, deletedAt: IsNull() } });
    if (booking === null) throw new NotFoundException('Booking not found');
    await this._validateBookingOwnership(booking, userId, role);
    booking.status = 'cancelled';
    await this.bookingRepo.save(booking);
    await this.bookingRepo.softDelete({ id });
    await this.auditService.log({ entityType: 'Booking', entityId: id, action: 'DELETE', operatorId: userId, ipAddress: ipAddress ?? undefined, userAgent: userAgent ?? undefined, oldValues: booking });
    return { success: true };
  }

  private async _checkRoomAvailability(roomId: string, checkInDate: string, checkOutDate: string): Promise<void> {
    const overlap = await this.bookingRepo
      .createQueryBuilder('booking')
      .where('booking.room_id = :roomId', { roomId })
      .andWhere('booking.deleted_at IS NULL')
      .andWhere("booking.status != 'cancelled'")
      .andWhere('booking.check_in_date < :newCheckOutDate', {
        newCheckOutDate: new Date(checkOutDate).toISOString(),
      })
      .andWhere('booking.check_out_date > :newCheckInDate', {
        newCheckInDate: new Date(checkInDate).toISOString(),
      })
      .getOne();
    if (overlap !== null) {
      throw new ConflictException('Room is already booked for this period');
    }
  }

  private async _calculateTotalAmount(roomId: string, checkInDate: string, checkOutDate: string): Promise<number> {
    const room = await this.roomRepo.findOne({ where: { id: roomId, deletedAt: IsNull() } });
    if (room === null) throw new NotFoundException('Room not found');
    const start = new Date(checkInDate).getTime();
    const end = new Date(checkOutDate).getTime();
    const dayCount = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
    return room.pricePerNight * dayCount;
  }

  private async _validateBookingOwnership(booking: Booking, userId: string, role: string): Promise<void> {
    if (role === 'admin') return;
    if (booking.userId !== userId) throw new ForbiddenException('Not allowed to access this booking');
  }

  private _queueConfirmationEmail(bookingId: string, userId: string, roomId: string): void {
    void this.emailQueue.add('send-booking-confirmation', { bookingId, userId, roomId });
  }
}
