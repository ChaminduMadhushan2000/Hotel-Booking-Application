import { Expose } from 'class-transformer';

export class RoomResponseDto {
  @Expose()
  public id!: string;

  @Expose()
  public name!: string;

  @Expose()
  public roomNumber!: string;

  @Expose()
  public type!: string;

  @Expose()
  public pricePerNight!: number;

  @Expose()
  public capacity!: number;

  @Expose()
  public description!: string | null;

  @Expose()
  public amenities!: Record<string, unknown> | null;

  @Expose()
  public isAvailable!: boolean;

  @Expose()
  public status!: string;

  @Expose()
  public createdAt!: Date;
}
