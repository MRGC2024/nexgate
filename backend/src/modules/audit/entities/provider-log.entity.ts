import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Merchant } from '../../merchants/entities/merchant.entity';

@Entity('provider_logs')
export class ProviderLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  merchantId: string;

  @ManyToOne(() => Merchant, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'merchantId' })
  merchant: Merchant | null;

  @Column()
  providerCode: string;

  @Column()
  direction: string; // request, response

  @Column({ type: 'text', nullable: true })
  bodyMasked: string;

  @Column({ nullable: true })
  transactionId: string;

  @Column({ nullable: true })
  statusCode: number;

  @CreateDateColumn()
  createdAt: Date;
}
