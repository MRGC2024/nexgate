import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Merchant } from '../../merchants/entities/merchant.entity';
import { TransactionEvent } from './transaction-event.entity';

export type PaymentMethod = 'pix' | 'boleto' | 'card';
export type TransactionStatus =
  | 'created'
  | 'waiting_payment'
  | 'processing'
  | 'paid'
  | 'refused'
  | 'canceled'
  | 'refunded'
  | 'chargeback';

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  merchantId: string;

  @ManyToOne(() => Merchant, (m) => m.transactions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'merchantId' })
  merchant: Merchant;

  @Column({ type: 'int' })
  amountCents: number;

  @Column({ default: 'BRL' })
  currency: string;

  @Column()
  paymentMethod: PaymentMethod;

  @Column({ default: 'created' })
  status: TransactionStatus;

  @Column()
  externalRef: string;

  @Column({ type: 'jsonb', nullable: true })
  customer: Record<string, unknown>;

  @Column({ type: 'jsonb', default: [] })
  items: Record<string, unknown>[];

  @Column({ nullable: true })
  providerCode: string;

  @Column({ nullable: true })
  providerTransactionId: string;

  @Column({ nullable: true })
  pixQr: string;

  @Column({ type: 'text', nullable: true })
  pixCopyPaste: string;

  @Column({ nullable: true })
  expiresAt: Date;

  @Column({ nullable: true })
  boletoUrl: string;

  @Column({ nullable: true })
  boletoLine: string;

  @Column({ nullable: true })
  cardLast4: string;

  @Column({ nullable: true })
  cardBrand: string;

  @Column({ type: 'int', nullable: true })
  installments: number | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, unknown>;

  @Column({ nullable: true })
  paidAt: Date;

  @Column({ nullable: true })
  canceledAt: Date;

  @Column({ nullable: true })
  refundedAt: Date;

  @Column({ nullable: true })
  idempotencyKey: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => TransactionEvent, (e) => e.transaction)
  events: TransactionEvent[];
}
