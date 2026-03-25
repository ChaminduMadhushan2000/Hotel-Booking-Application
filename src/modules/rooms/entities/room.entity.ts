import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryColumn,
  Index,
  UpdateDateColumn,
} from 'typeorm';

@Entity('rooms')
export class Room {
  @PrimaryColumn({ type: 'uuid', name: 'id', default: () => 'gen_random_uuid()' })
  public id!: string;

  @Column({ type: 'varchar', name: 'name', length: 100, nullable: false })
  public name!: string;

  @Column({
    type: 'varchar',
    name: 'room_number',
    length: 50,
    nullable: false,
    unique: true,
  })
  public roomNumber!: string;

  @Column({ type: 'varchar', name: 'type', length: 50, nullable: false })
  public type!: string;

  @Column({ type: 'int', name: 'price_per_night', nullable: false })
  public pricePerNight!: number;

  @Column({ type: 'int', name: 'capacity', nullable: false })
  public capacity!: number;

  @Column({ type: 'varchar', name: 'description', length: 500, nullable: true })
  public description!: string | null;

  @Column({ type: 'jsonb', name: 'amenities', nullable: true })
  public amenities!: Record<string, unknown> | null;

  @Column({
    type: 'boolean',
    name: 'is_available',
    nullable: false,
    default: true,
  })
  public isAvailable!: boolean;

  @Index('idx_rooms_status')
  @Column({ type: 'varchar', name: 'status', length: 50, nullable: false })
  public status!: string;

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
