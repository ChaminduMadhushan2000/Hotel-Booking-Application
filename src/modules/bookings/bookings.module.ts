import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EMAIL_QUEUE } from '../../common/constants/queue.constants';
import { AuditModule } from '../audit/audit.module';
import { Room } from '../rooms/entities/room.entity';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { Booking } from './entities/booking.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Booking, Room]),
    BullModule.registerQueue({ name: EMAIL_QUEUE }),
    AuditModule,
  ],
  controllers: [BookingsController],
  providers: [BookingsService],
  exports: [TypeOrmModule, BookingsService],
})
export class BookingsModule {}
