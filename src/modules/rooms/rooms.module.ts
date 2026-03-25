import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditModule } from '../audit/audit.module';
import { Room } from './entities/room.entity';
import { RoomsController } from './rooms.controller';
import { RoomsService } from './rooms.service';

@Module({
  imports: [TypeOrmModule.forFeature([Room]), AuditModule],
  controllers: [RoomsController],
  providers: [RoomsService],
  exports: [TypeOrmModule, RoomsService],
})
export class RoomsModule {}
