import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { createHash } from 'crypto';
import Redis from 'ioredis';
import { IsNull, Repository } from 'typeorm';
import { AuditService } from '../audit/audit.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { RoomResponseDto } from './dto/room-response.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { Room } from './entities/room.entity';

@Injectable()
export class RoomsService {
  private readonly redis = new Redis({
    host: process.env.REDIS_HOST ?? 'localhost',
    port: Number(process.env.REDIS_PORT ?? 6379),
  });

  public constructor(
    @InjectRepository(Room) private readonly roomRepo: Repository<Room>,
    private readonly auditService: AuditService,
  ) {}

  public async getRooms(page = 1, limit = 25): Promise<{ items: RoomResponseDto[]; total: number }> {
    const safeLimit = Math.min(Math.max(limit, 1), 100);
    const safePage = Math.max(page, 1);
    const cacheKey = this._buildCacheKey({ page: safePage, limit: safeLimit });
    const cached = await this.redis.get(cacheKey);
    if (cached !== null) {
      return JSON.parse(cached) as { items: RoomResponseDto[]; total: number };
    }
    const [items, total] = await this.roomRepo.findAndCount({
      where: { deletedAt: IsNull() },
      skip: (safePage - 1) * safeLimit,
      take: safeLimit,
      order: { createdAt: 'DESC' },
    });
    const mapped = items.map((item) => plainToInstance(RoomResponseDto, item, { excludeExtraneousValues: true }));
    const result = { items: mapped, total };
    await this.redis.set(cacheKey, JSON.stringify(result), 'EX', 60);
    return result;
  }

  public async getRoomById(id: string): Promise<RoomResponseDto> {
    const cacheKey = `hotel:room:${id}`;
    const cached = await this.redis.get(cacheKey);
    if (cached !== null) return JSON.parse(cached) as RoomResponseDto;
    const room = await this._findRoomOrThrow(id);
    const result = plainToInstance(RoomResponseDto, room, { excludeExtraneousValues: true });
    await this.redis.set(cacheKey, JSON.stringify(result), 'EX', 120);
    return result;
  }

  public async createRoom(
    dto: CreateRoomDto,
    operatorId: string,
    ipAddress: string | null,
    userAgent: string | null,
  ): Promise<RoomResponseDto> {
    const existing = await this.roomRepo.findOne({ where: { roomNumber: dto.roomNumber, deletedAt: IsNull() } });
    if (existing !== null) throw new ConflictException('Room number already exists');
    const entity = this.roomRepo.create({
      name: dto.name,
      roomNumber: dto.roomNumber,
      type: dto.type,
      pricePerNight: dto.pricePerNight,
      capacity: dto.capacity,
      description: dto.description ?? null,
      amenities: dto.amenities ?? null,
      isAvailable: dto.isAvailable ?? true,
      status: dto.status,
    });
    const saved = await this.roomRepo.save(entity);
    await this._invalidateRoomCache(saved.id);
    await this.auditService.log({ entityType: 'Room', entityId: saved.id, action: 'CREATE', operatorId, ipAddress: ipAddress ?? undefined, userAgent: userAgent ?? undefined, newValues: saved });
    return plainToInstance(RoomResponseDto, saved, { excludeExtraneousValues: true });
  }

  public async updateRoom(
    id: string,
    dto: UpdateRoomDto,
    operatorId: string,
    ipAddress: string | null,
    userAgent: string | null,
  ): Promise<RoomResponseDto> {
    const room = await this._findRoomOrThrow(id);
    const oldValues = { ...room };
    Object.assign(room, {
      ...dto,
      description: dto.description ?? room.description,
      amenities: dto.amenities ?? room.amenities,
    });
    const saved = await this.roomRepo.save(room);
    await this._invalidateRoomCache(id);
    await this.auditService.log({ entityType: 'Room', entityId: id, action: 'UPDATE', operatorId, ipAddress: ipAddress ?? undefined, userAgent: userAgent ?? undefined, oldValues, newValues: saved });
    return plainToInstance(RoomResponseDto, saved, { excludeExtraneousValues: true });
  }

  public async deleteRoom(
    id: string,
    operatorId: string,
    ipAddress: string | null,
    userAgent: string | null,
  ): Promise<{ success: true }> {
    const room = await this._findRoomOrThrow(id);
    await this.roomRepo.softDelete({ id });
    await this._invalidateRoomCache(id);
    await this.auditService.log({ entityType: 'Room', entityId: id, action: 'DELETE', operatorId, ipAddress: ipAddress ?? undefined, userAgent: userAgent ?? undefined, oldValues: room });
    return { success: true };
  }

  private async _findRoomOrThrow(id: string): Promise<Room> {
    const room = await this.roomRepo.findOne({ where: { id, deletedAt: IsNull() } });
    if (room === null) throw new NotFoundException('Room not found');
    return room;
  }

  private async _invalidateRoomCache(id: string): Promise<void> {
    await this.redis.del(`hotel:room:${id}`);
    const keys = await this.redis.keys('hotel:rooms:list:*');
    if (keys.length > 0) await this.redis.del(...keys);
  }

  private _buildCacheKey(query: { page: number; limit: number }): string {
    const hash = createHash('sha256').update(JSON.stringify(query)).digest('hex');
    return `hotel:rooms:list:${hash}`;
  }

  public _assertAdmin(role: string): void {
    if (role !== 'admin') throw new ForbiddenException('Admin role required');
  }
}
