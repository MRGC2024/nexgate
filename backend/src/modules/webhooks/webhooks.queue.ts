import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue, QueueEvents } from 'bullmq';
import IORedis from 'ioredis';

const QUEUE_NAME = 'webhook-deliveries';
const CONNECTION_NAME = 'nexgate-webhooks';

@Injectable()
export class WebhooksQueue implements OnModuleDestroy {
  public queue: Queue;
  public queueEvents: QueueEvents;
  private connection: IORedis;

  constructor(private config: ConfigService) {
    const redisUrl = this.config.get('REDIS_URL') || 'redis://localhost:6379';
    this.connection = new IORedis(redisUrl, { maxRetriesPerRequest: null });
    this.queue = new Queue(QUEUE_NAME, {
      connection: this.connection,
      defaultJobOptions: {
        attempts: 6,
        backoff: { type: 'exponential', delay: 60 * 1000 },
        removeOnComplete: { count: 1000 },
      },
    });
    this.queueEvents = new QueueEvents(QUEUE_NAME, { connection: this.connection });
  }

  async add(
    job: {
      webhookEndpointId: string;
      eventId: string;
      event: string;
      payload: Record<string, unknown>;
      attempt?: number;
    },
    opts?: { delay?: number },
  ): Promise<string> {
    const id = await this.queue.add('deliver', job, { delay: opts?.delay });
    return id.id ?? '';
  }

  async onModuleDestroy() {
    await this.queue.close();
    await this.queueEvents.close();
    await this.connection.quit();
  }
}
