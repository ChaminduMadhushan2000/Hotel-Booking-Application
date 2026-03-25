import { IsDateString, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class UpdateBookingDto {
  @IsOptional()
  @IsDateString()
  public checkInDate?: string;

  @IsOptional()
  @IsDateString()
  public checkOutDate?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  public guestCount?: number;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  public specialRequests?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  public status?: string;
}
