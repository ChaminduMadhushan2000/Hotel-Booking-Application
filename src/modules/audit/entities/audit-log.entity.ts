import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  public id!: string;

  @Column({ type: 'varchar', name: 'entity_type', length: 100, nullable: false })
  public entityType!: string;

  @Column({ type: 'varchar', name: 'entity_id', length: 255, nullable: false })
  public entityId!: string;

  @Column({ type: 'varchar', name: 'action', length: 50, nullable: false })
  public action!: string;

  @Column({ type: 'jsonb', name: 'old_values', nullable: true })
  public oldValues!: unknown | null;

  @Column({ type: 'jsonb', name: 'new_values', nullable: true })
  public newValues!: unknown | null;

  @Column({ type: 'varchar', name: 'operator_id', length: 255, nullable: true })
  public operatorId!: string | null;

  @Column({ type: 'varchar', name: 'ip_address', length: 45, nullable: true })
  public ipAddress!: string | null;

  @Column({ type: 'varchar', name: 'user_agent', length: 500, nullable: true })
  public userAgent!: string | null;

  @CreateDateColumn({
    type: 'timestamptz',
    name: 'created_at',
    default: () => 'NOW()',
    nullable: false,
  })
  public createdAt!: Date;
}
