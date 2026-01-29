import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';
import { ApiKey } from './entities/api-key.entity';
import { Merchant } from '../merchants/entities/merchant.entity';

const SALT_ROUNDS = 12;
const PUBLIC_PREFIX = 'pk_';
const SECRET_PREFIX = 'sk_';

@Injectable()
export class ApiKeysService {
  constructor(
    @InjectRepository(ApiKey)
    private apiKeyRepo: Repository<ApiKey>,
  ) {}

  async validateKey(publicKey: string, secretKey: string): Promise<{ merchantId: string } | null> {
    if (!publicKey?.startsWith(PUBLIC_PREFIX) || !secretKey?.startsWith(SECRET_PREFIX)) return null;
    const key = await this.apiKeyRepo.findOne({
      where: { publicKey, active: true },
      relations: ['merchant'],
    });
    if (!key?.merchant?.active) return null;
    const match = await bcrypt.compare(secretKey, key.secretKeyHash);
    if (!match) return null;
    await this.apiKeyRepo.update(key.id, { lastUsedAt: new Date() });
    return { merchantId: key.merchantId };
  }

  async create(merchantId: string, name?: string): Promise<{ publicKey: string; secretKey: string; id: string }> {
    const publicKey = PUBLIC_PREFIX + crypto.randomBytes(24).toString('hex');
    const secretKey = SECRET_PREFIX + crypto.randomBytes(32).toString('hex');
    const secretKeyHash = await bcrypt.hash(secretKey, SALT_ROUNDS);
    const entity = this.apiKeyRepo.create({
      merchantId,
      publicKey,
      secretKeyHash,
      name: name || 'API Key',
      active: true,
    });
    const saved = await this.apiKeyRepo.save(entity);
    return { id: saved.id, publicKey, secretKey };
  }

  async listByMerchant(merchantId: string): Promise<ApiKey[]> {
    return this.apiKeyRepo.find({
      where: { merchantId },
      order: { createdAt: 'DESC' },
    });
  }

  async revoke(id: string, merchantId?: string): Promise<void> {
    const key = await this.apiKeyRepo.findOne({ where: { id } });
    if (!key) throw new NotFoundException('API Key não encontrada');
    if (merchantId && key.merchantId !== merchantId) throw new ForbiddenException();
    key.active = false;
    await this.apiKeyRepo.save(key);
  }

  async findOne(id: string, merchantId?: string): Promise<ApiKey> {
    const key = await this.apiKeyRepo.findOne({ where: { id }, relations: ['merchant'] });
    if (!key) throw new NotFoundException('API Key não encontrada');
    if (merchantId && key.merchantId !== merchantId) throw new ForbiddenException();
    return key;
  }
}
