import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateAuditLogDto {
  @IsString()
  @MaxLength(100)
  public entityType!: string;

  @IsString()
  @MaxLength(255)
  public entityId!: string;

  @IsString()
  @IsIn(['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGIN_FAILED', 'LOGOUT'])
  @MaxLength(50)
  public action!: string;

  @IsOptional()
  public oldValues?: unknown;

  @IsOptional()
  public newValues?: unknown;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  public operatorId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(45)
  public ipAddress?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  public userAgent?: string;
}
