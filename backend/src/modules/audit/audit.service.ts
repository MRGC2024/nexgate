import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private auditRepo: Repository<AuditLog>,
  ) {}

  async log(data: {
    userId?: string;
    merchantId?: string;
    action: string;
    resource?: string;
    resourceId?: string;
    metadata?: Record<string, unknown>;
    ip?: string;
    userAgent?: string;
  }): Promise<AuditLog> {
    const log = this.auditRepo.create(data);
    return this.auditRepo.save(log);
  }

  async list(filters?: { userId?: string; merchantId?: string; action?: string; limit?: number }): Promise<AuditLog[]> {
    const qb = this.auditRepo
      .createQueryBuilder('a')
      .orderBy('a.createdAt', 'DESC')
      .take(filters?.limit ?? 100);
    if (filters?.userId) qb.andWhere('a.userId = :userId', { userId: filters.userId });
    if (filters?.merchantId) qb.andWhere('a.merchantId = :merchantId', { merchantId: filters.merchantId });
    if (filters?.action) qb.andWhere('a.action = :action', { action: filters.action });
    return qb.getMany();
  }
}
