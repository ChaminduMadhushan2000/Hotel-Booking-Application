import { IsDateString, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateBookingDto {
  @IsString()
  @MaxLength(36)
  public roomId!: string;

  @IsDateString()
  public checkInDate!: string;

  @IsDateString()
  public checkOutDate!: string;

  @IsInt()
  @Min(1)
  public guestCount!: number;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  public specialRequests?: string;
}
