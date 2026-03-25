import { Expose } from 'class-transformer';

export class BookingResponseDto {
  @Expose()
  public id!: string;

  @Expose()
  public roomId!: string;

  @Expose()
  public userId!: string;

  @Expose()
  public checkInDate!: Date;

  @Expose()
  public checkOutDate!: Date;

  @Expose()
  public guestCount!: number;

  @Expose()
  public totalAmount!: number;

  @Expose()
  public status!: string;

  @Expose()
  public specialRequests!: string | null;

  @Expose()
  public createdAt!: Date;
}
