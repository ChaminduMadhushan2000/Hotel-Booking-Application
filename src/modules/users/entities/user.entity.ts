import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  public id!: string;

  @Column({
    type: 'varchar',
    name: 'email',
    length: 255,
    unique: true,
    nullable: false,
  })
  public email!: string;

  @Column({
    type: 'varchar',
    name: 'password_hash',
    length: 255,
    nullable: false,
  })
  public passwordHash!: string;

  @Column({
    type: 'varchar',
    name: 'first_name',
    length: 100,
    nullable: false,
  })
  public firstName!: string;

  @Column({
    type: 'varchar',
    name: 'last_name',
    length: 100,
    nullable: false,
  })
  public lastName!: string;

  @Column({
    type: 'varchar',
    name: 'role',
    length: 50,
    nullable: false,
    default: 'guest',
  })
  public role!: string;

  @Column({
    type: 'int',
    name: 'failed_login_attempts',
    nullable: false,
    default: 0,
  })
  public failedLoginAttempts!: number;

  @Column({
    type: 'timestamptz',
    name: 'locked_until',
    nullable: true,
  })
  public lockedUntil!: Date | null;

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
