import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Transaction } from '../../transactions/entities/transaction.entity';
import { ApiKey } from '../../api-keys/entities/api-key.entity';
import { MerchantConnector } from '../../connectors/entities/merchant-connector.entity';
import { RoutingRule } from '../../routing/entities/routing-rule.entity';
import { WebhookEndpoint } from '../../webhooks/entities/webhook-endpoint.entity';

@Entity('merchants')
export class Merchant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  slug: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  document: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ default: '#2563eb' })
  accentColor: string;

  @Column({ default: true })
  active: boolean;

  /** pending_approval | approved | rejected */
  @Column({ type: 'varchar', default: 'approved', length: 32 })
  registrationStatus: string;

  /** Limite máximo de saque em centavos (ex.: 500000 = R$ 5.000) */
  @Column({ type: 'int', nullable: true })
  withdrawalLimitCents: number | null;

  /** Taxa de saque: percentual */
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  withdrawalFeePercent: number;

  /** Taxa de saque: valor fixo em centavos */
  @Column({ type: 'int', default: 0 })
  withdrawalFeeFixedCents: number;

  /** Código do adquirente/subadquirente (ex.: mock_pix, cielo, rede) */
  @Column({ type: 'varchar', nullable: true, length: 64 })
  acquirerCode: string | null;

  /** Chave Pix para receber saque (CPF, CNPJ, e-mail ou chave aleatória) */
  @Column({ type: 'varchar', nullable: true, length: 256 })
  pixWithdrawalKey: string | null;

  @Column({ type: 'simple-array', nullable: true })
  tags: string[];

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, unknown>;

  @Column({ type: 'inet', array: true, nullable: true })
  ipAllowlist: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => User, (u) => u.merchant)
  users: User[];

  @OneToMany(() => Transaction, (t) => t.merchant)
  transactions: Transaction[];

  @OneToMany(() => ApiKey, (k) => k.merchant)
  apiKeys: ApiKey[];

  @OneToMany(() => MerchantConnector, (mc) => mc.merchant)
  merchantConnectors: MerchantConnector[];

  @OneToMany(() => RoutingRule, (r) => r.merchant)
  routingRules: RoutingRule[];

  @OneToMany(() => WebhookEndpoint, (w) => w.merchant)
  webhookEndpoints: WebhookEndpoint[];
}
