import {
  IsBoolean,
  IsIn,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class UpdateRoomDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  public name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  public roomNumber?: string;

  @IsOptional()
  @IsString()
  @IsIn(['single', 'double', 'suite', 'deluxe'])
  @MaxLength(50)
  public type?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  public pricePerNight?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  public capacity?: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  public description?: string;

  @IsOptional()
  @IsObject()
  public amenities?: Record<string, unknown>;

  @IsOptional()
  @IsBoolean()
  public isAvailable?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  public status?: string;
}
