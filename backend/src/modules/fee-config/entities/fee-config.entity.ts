import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export interface FeeConfigData {
  pixPercent: number;
  pixFixedCents: number;
  withdrawalFeeCents: number;
  withdrawalPercent: number;
  boletoPercent: number;
  boletoFixedCents: number;
  cardPercent: number;
  cardFixedCents: number;
}

@Entity('fee_config')
export class FeeConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Scope: 'global' = configuração global da plataforma */
  @Column({ default: 'global' })
  scope: string;

  @Column({ type: 'uuid', nullable: true })
  merchantId: string | null;

  @Column({ type: 'jsonb', default: {} })
  config: FeeConfigData;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
