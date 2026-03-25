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
import { CreateRoomDto } from './dto/create-room.dto';
import { RoomResponseDto } from './dto/room-response.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { RoomsService } from './rooms.service';

interface AuthUser {
  id: string;
  email: string;
  role: string;
}

@Controller('v1/rooms')
export class RoomsController {
  public constructor(private readonly roomsService: RoomsService) {}

  @Get()
  public getRooms(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<{ items: RoomResponseDto[]; total: number }> {
    return this.roomsService.getRooms(Number(page ?? 1), Number(limit ?? 25));
  }

  @Get(':id')
  public getRoomById(@Param('id') id: string): Promise<RoomResponseDto> {
    return this.roomsService.getRoomById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  public createRoom(
    @Body() dto: CreateRoomDto,
    @CurrentUser() user: AuthUser | null,
    @Req() request: Request,
  ): Promise<RoomResponseDto> {
    this.roomsService._assertAdmin(user?.role ?? 'guest');
    return this.roomsService.createRoom(dto, user?.id ?? '', request.ip ?? null, request.headers['user-agent'] as string | null);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  public updateRoom(
    @Param('id') id: string,
    @Body() dto: UpdateRoomDto,
    @CurrentUser() user: AuthUser | null,
    @Req() request: Request,
  ): Promise<RoomResponseDto> {
    this.roomsService._assertAdmin(user?.role ?? 'guest');
    return this.roomsService.updateRoom(id, dto, user?.id ?? '', request.ip ?? null, request.headers['user-agent'] as string | null);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  public deleteRoom(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser | null,
    @Req() request: Request,
  ): Promise<{ success: true }> {
    this.roomsService._assertAdmin(user?.role ?? 'guest');
    return this.roomsService.deleteRoom(id, user?.id ?? '', request.ip ?? null, request.headers['user-agent'] as string | null);
  }
}
