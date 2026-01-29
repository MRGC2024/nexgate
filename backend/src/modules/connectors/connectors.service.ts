import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConnectorDefinition } from './entities/connector-definition.entity';
import { MerchantConnector } from './entities/merchant-connector.entity';
import { EncryptionService } from './encryption.service';
import { MockPixConnector } from './connectors/mock-pix.connector';
import { MockPixBConnector } from './connectors/mock-pix-b.connector';
import type { PaymentConnector } from './interfaces/payment-connector.interface';

const REGISTRY: Map<string, PaymentConnector> = new Map();
function register(c: PaymentConnector) {
  REGISTRY.set(c.code, c);
}
register(new MockPixConnector());
register(new MockPixBConnector());

@Injectable()
export class ConnectorsService {
  constructor(
    @InjectRepository(ConnectorDefinition)
    private defRepo: Repository<ConnectorDefinition>,
    @InjectRepository(MerchantConnector)
    private merchantConnectorRepo: Repository<MerchantConnector>,
    private encryption: EncryptionService,
  ) {}

  getConnector(code: string): PaymentConnector | null {
    return REGISTRY.get(code) ?? null;
  }

  getAllConnectors(): PaymentConnector[] {
    return Array.from(REGISTRY.values());
  }

  async getDefinitionByCode(code: string): Promise<ConnectorDefinition> {
    const d = await this.defRepo.findOne({ where: { code, enabled: true } });
    if (!d) throw new NotFoundException('Conector não encontrado');
    return d;
  }

  async getMerchantConfig(merchantId: string, connectorCode: string): Promise<Record<string, unknown> | null> {
    const def = await this.defRepo.findOne({ where: { code: connectorCode } });
    if (!def) return null;
    const mc = await this.merchantConnectorRepo.findOne({
      where: { merchantId, connectorDefinitionId: def.id, active: true },
    });
    if (!mc) return null;
    try {
      return JSON.parse(this.encryption.decrypt(mc.encryptedConfig)) as Record<string, unknown>;
    } catch {
      return null;
    }
  }

  async setMerchantConfig(merchantId: string, connectorDefinitionId: string, config: Record<string, unknown>): Promise<MerchantConnector> {
    const encrypted = this.encryption.encrypt(JSON.stringify(config));
    let mc = await this.merchantConnectorRepo.findOne({
      where: { merchantId, connectorDefinitionId },
    });
    if (mc) {
      mc.encryptedConfig = encrypted;
      mc.active = true;
      return this.merchantConnectorRepo.save(mc);
    }
    mc = this.merchantConnectorRepo.create({
      merchantId,
      connectorDefinitionId,
      encryptedConfig: encrypted,
      active: true,
    });
    return this.merchantConnectorRepo.save(mc);
  }

  async listDefinitions(): Promise<ConnectorDefinition[]> {
    return this.defRepo.find({ where: { enabled: true }, order: { code: 'ASC' } });
  }

  async listMerchantConnectors(merchantId: string): Promise<MerchantConnector[]> {
    return this.merchantConnectorRepo.find({
      where: { merchantId },
      relations: ['connectorDefinition'],
      order: { createdAt: 'DESC' },
    });
  }

  async getDecryptedConfig(merchantConnectorId: string, merchantId?: string): Promise<Record<string, unknown>> {
    const mc = await this.merchantConnectorRepo.findOne({
      where: { id: merchantConnectorId },
      relations: ['connectorDefinition'],
    });
    if (!mc) throw new NotFoundException('Merchant connector não encontrado');
    if (merchantId && mc.merchantId !== merchantId) throw new NotFoundException('Merchant connector não encontrado');
    return JSON.parse(this.encryption.decrypt(mc.encryptedConfig)) as Record<string, unknown>;
  }
}
