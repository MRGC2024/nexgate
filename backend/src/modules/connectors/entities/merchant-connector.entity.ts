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
import { ConnectorDefinition } from './connector-definition.entity';

@Entity('merchant_connectors')
export class MerchantConnector {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  merchantId: string;

  @ManyToOne(() => Merchant, (m) => m.merchantConnectors, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'merchantId' })
  merchant: Merchant;

  @Column()
  connectorDefinitionId: string;

  @ManyToOne(() => ConnectorDefinition, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'connectorDefinitionId' })
  connectorDefinition: ConnectorDefinition;

  @Column({ type: 'text' })
  encryptedConfig: string;

  @Column({ default: true })
  active: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
