import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('bookings')
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  public id!: string;

  @Index('idx_bookings_room_id')
  @Column({ type: 'uuid', name: 'room_id' })
  public roomId!: string;

  @Index('idx_bookings_user_id')
  @Column({ type: 'uuid', name: 'user_id' })
  public userId!: string;

  @Column({ type: 'timestamptz', name: 'check_in_date', nullable: false })
  public checkInDate!: Date;

  @Column({ type: 'timestamptz', name: 'check_out_date', nullable: false })
  public checkOutDate!: Date;

  @Column({ type: 'int', name: 'guest_count', nullable: false })
  public guestCount!: number;

  @Column({ type: 'int', name: 'total_amount', nullable: false })
  public totalAmount!: number;

  @Column({
    type: 'varchar',
    name: 'status',
    length: 50,
    nullable: false,
    default: 'pending',
  })
  public status!: string;

  @Column({ type: 'varchar', name: 'special_requests', length: 1000, nullable: true })
  public specialRequests!: string | null;

  @CreateDateColumn({
    type: 'timestamptz',
    name: 'created_at',
    default: () => 'NOW()',
    nullable: false,
  })
  public createdAt!: Date;

  @UpdateDateColumn({
    type: 'timestamptz',
    name: 'updated_at',
    default: () => 'NOW()',
    nullable: false,
  })
  public updatedAt!: Date;

  @DeleteDateColumn({
    type: 'timestamptz',
    name: 'deleted_at',
    nullable: true,
  })
  public deletedAt!: Date | null;
}
