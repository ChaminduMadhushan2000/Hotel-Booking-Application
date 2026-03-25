import {
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateRoomDto {
  @IsString()
  @MaxLength(100)
  public name!: string;

  @IsString()
  @MaxLength(50)
  public roomNumber!: string;

  @IsString()
  @IsIn(['single', 'double', 'suite', 'deluxe'])
  @MaxLength(50)
  public type!: string;

  @IsInt()
  @Min(1)
  public pricePerNight!: number;

  @IsInt()
  @Min(1)
  public capacity!: number;

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

  @IsString()
  @MaxLength(50)
  public status!: string;
}
