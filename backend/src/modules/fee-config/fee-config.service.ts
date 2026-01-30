import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { FeeConfig, FeeConfigData } from './entities/fee-config.entity';

const DEFAULT_CONFIG: FeeConfigData = {
  pixPercent: 3.99,
  pixFixedCents: 199,
  withdrawalFeeCents: 0,
  withdrawalPercent: 0,
  boletoPercent: 6.99,
  boletoFixedCents: 299,
  cardPercent: 7.99,
  cardFixedCents: 299,
};

@Injectable()
export class FeeConfigService {
  constructor(
    @InjectRepository(FeeConfig)
    private repo: Repository<FeeConfig>,
  ) {}

  async getGlobalConfig(): Promise<FeeConfigData> {
    const row = await this.repo.findOne({ where: { scope: 'global', merchantId: IsNull() } });
    if (!row || !row.config) return DEFAULT_CONFIG;
    return { ...DEFAULT_CONFIG, ...row.config } as FeeConfigData;
  }

  async updateGlobalConfig(config: Partial<FeeConfigData>): Promise<FeeConfigData> {
    let row = await this.repo.findOne({ where: { scope: 'global', merchantId: IsNull() } });
    if (!row) {
      row = this.repo.create({ scope: 'global', config: DEFAULT_CONFIG });
      await this.repo.save(row);
    }
    row.config = { ...DEFAULT_CONFIG, ...row.config, ...config } as FeeConfigData;
    await this.repo.save(row);
    return row.config;
  }
}
