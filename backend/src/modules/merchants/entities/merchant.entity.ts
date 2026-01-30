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
