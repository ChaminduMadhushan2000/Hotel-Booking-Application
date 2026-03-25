import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';
import { AuditLog } from './entities/audit-log.entity';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  public constructor(
    @InjectRepository(AuditLog) private readonly auditRepo: Repository<AuditLog>,
  ) {}

  public async log(dto: CreateAuditLogDto): Promise<void> {
    try {
      const entity = this.auditRepo.create({
        entityType: dto.entityType,
        entityId: dto.entityId,
        action: dto.action,
        oldValues: dto.oldValues ?? null,
        newValues: dto.newValues ?? null,
        operatorId: dto.operatorId ?? null,
        ipAddress: dto.ipAddress ?? null,
        userAgent: dto.userAgent ?? null,
      });
      await this.auditRepo.save(entity);
    } catch (_error: unknown) {
      this.logger.warn('Audit log write failed');
    }
  }
}
