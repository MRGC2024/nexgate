import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { WebhookEndpoint } from './webhook-endpoint.entity';

@Entity('webhook_deliveries')
export class WebhookDelivery {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  webhookEndpointId: string;

  @ManyToOne(() => WebhookEndpoint, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'webhookEndpointId' })
  webhookEndpoint: WebhookEndpoint;

  @Column()
  eventId: string;

  @Column()
  event: string;

  @Column({ type: 'text', nullable: true })
  requestBody: string;

  @Column({ type: 'int', default: 0 })
  attempt: number;

  @Column()
  statusCode: number;

  @Column({ type: 'text', nullable: true })
  responseBody: string;

  @Column({ type: 'text', nullable: true })
  errorMessage: string;

  @Column({ default: 'pending' })
  status: string; // pending, success, failed

  @Column({ nullable: true })
  nextRetryAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
