import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Merchant } from '../../merchants/entities/merchant.entity';
import { ConnectorDefinition } from '../../connectors/entities/connector-definition.entity';

@Entity('routing_rules')
export class RoutingRule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  merchantId: string;

  @ManyToOne(() => Merchant, (m) => m.routingRules, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'merchantId' })
  merchant: Merchant;

  @Column()
  connectorDefinitionId: string;

  @ManyToOne(() => ConnectorDefinition, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'connectorDefinitionId' })
  connectorDefinition: ConnectorDefinition;

  @Column()
  paymentMethod: string; // pix, boleto, card

  @Column({ type: 'int', nullable: true })
  amountMinCents: number | null;

  @Column({ type: 'int', nullable: true })
  amountMaxCents: number | null;

  @Column({ nullable: true })
  currency: string;

  @Column({ type: 'int', default: 0 })
  priority: number;

  @Column({ default: false })
  isFallback: boolean;

  @Column({ type: 'simple-array', nullable: true })
  merchantTags: string[];

  @Column({ default: true })
  active: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
