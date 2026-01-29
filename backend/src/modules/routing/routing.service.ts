import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoutingRule } from './entities/routing-rule.entity';
import { ConnectorsService } from '../connectors/connectors.service';

export interface RoutingContext {
  merchantId: string;
  paymentMethod: string;
  amountCents: number;
  currency?: string;
  merchantTags?: string[];
}

@Injectable()
export class RoutingService {
  constructor(
    @InjectRepository(RoutingRule)
    private ruleRepo: Repository<RoutingRule>,
    private connectorsService: ConnectorsService,
  ) {}

  async selectConnector(ctx: RoutingContext): Promise<{ connectorCode: string; config: Record<string, unknown> } | null> {
    const rules = await this.ruleRepo.find({
      where: { merchantId: ctx.merchantId, paymentMethod: ctx.paymentMethod, active: true },
      relations: ['connectorDefinition'],
      order: { priority: 'DESC', createdAt: 'ASC' },
    });

    const amount = ctx.amountCents;
    const currency = ctx.currency || 'BRL';
    const tags = ctx.merchantTags || [];

    const primary = rules.filter((r) => !r.isFallback);
    const fallbacks = rules.filter((r) => r.isFallback);

    for (const r of primary) {
      if (r.amountMinCents != null && amount < r.amountMinCents) continue;
      if (r.amountMaxCents != null && amount > r.amountMaxCents) continue;
      if (r.currency && r.currency !== currency) continue;
      if (r.merchantTags?.length && !r.merchantTags.some((t) => tags.includes(t))) continue;
      const config = await this.connectorsService.getMerchantConfig(ctx.merchantId, r.connectorDefinition.code);
      if (config) return { connectorCode: r.connectorDefinition.code, config };
    }

    for (const r of fallbacks) {
      const config = await this.connectorsService.getMerchantConfig(ctx.merchantId, r.connectorDefinition.code);
      if (config) return { connectorCode: r.connectorDefinition.code, config };
    }

    return null;
  }

  async listRules(merchantId: string): Promise<RoutingRule[]> {
    return this.ruleRepo.find({
      where: { merchantId },
      relations: ['connectorDefinition'],
      order: { priority: 'DESC', createdAt: 'ASC' },
    });
  }

  async createRule(data: Partial<RoutingRule>): Promise<RoutingRule> {
    const rule = this.ruleRepo.create(data);
    return this.ruleRepo.save(rule);
  }

  async updateRule(id: string, data: Partial<RoutingRule>): Promise<RoutingRule> {
    const rule = await this.ruleRepo.findOne({ where: { id } });
    if (!rule) throw new Error('Regra não encontrada');
    Object.assign(rule, data);
    return this.ruleRepo.save(rule);
  }

  async deleteRule(id: string): Promise<void> {
    await this.ruleRepo.delete(id);
  }
}
