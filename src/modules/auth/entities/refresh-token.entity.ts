import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('refresh_tokens')
export class RefreshToken {
  @PrimaryGeneratedColumn('uuid')
  public id!: string;

  @Column({
    type: 'varchar',
    name: 'token_hash',
    length: 255,
    nullable: false,
  })
  public tokenHash!: string;

  @Index('idx_refresh_tokens_user_id')
  @Column({
    type: 'uuid',
    name: 'user_id',
    nullable: false,
  })
  public userId!: string;

  @Column({
    type: 'varchar',
    name: 'family',
    length: 255,
    nullable: false,
  })
  public family!: string;

  @Column({
    type: 'boolean',
    name: 'is_revoked',
    nullable: false,
    default: false,
  })
  public isRevoked!: boolean;

  @Column({
    type: 'timestamptz',
    name: 'expires_at',
    nullable: false,
  })
  public expiresAt!: Date;

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
