import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { BookingResponseDto } from './dto/booking-response.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';

interface AuthUser {
  id: string;
  email: string;
  role: string;
}

@Controller('v1/bookings')
@UseGuards(JwtAuthGuard)
export class BookingsController {
  public constructor(private readonly bookingsService: BookingsService) {}

  @Get()
  public getBookings(
    @CurrentUser() user: AuthUser | null,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<{ items: BookingResponseDto[]; total: number }> {
    return this.bookingsService.getBookings(user?.id ?? '', user?.role ?? 'guest', Number(page ?? 1), Number(limit ?? 25));
  }

  @Get(':id')
  public getBookingById(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser | null,
  ): Promise<BookingResponseDto> {
    return this.bookingsService.getBookingById(id, user?.id ?? '', user?.role ?? 'guest');
  }

  @Post()
  public createBooking(
    @Body() dto: CreateBookingDto,
    @CurrentUser() user: AuthUser | null,
    @Req() request: Request,
  ): Promise<BookingResponseDto> {
    return this.bookingsService.createBooking(
      dto,
      user?.id ?? '',
      request.ip ?? null,
      (request.headers['user-agent'] as string | undefined) ?? null,
    );
  }

  @Patch(':id')
  public updateBooking(
    @Param('id') id: string,
    @Body() dto: UpdateBookingDto,
    @CurrentUser() user: AuthUser | null,
    @Req() request: Request,
  ): Promise<BookingResponseDto> {
    return this.bookingsService.updateBooking(
      id,
      dto,
      user?.id ?? '',
      user?.role ?? 'guest',
      request.ip ?? null,
      (request.headers['user-agent'] as string | undefined) ?? null,
    );
  }

  @Delete(':id')
  public cancelBooking(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser | null,
    @Req() request: Request,
  ): Promise<{ success: true }> {
    return this.bookingsService.cancelBooking(
      id,
      user?.id ?? '',
      user?.role ?? 'guest',
      request.ip ?? null,
      (request.headers['user-agent'] as string | undefined) ?? null,
    );
  }
}
