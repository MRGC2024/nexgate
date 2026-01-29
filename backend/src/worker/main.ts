/**
 * NEXGATE Worker - Processa fila de webhooks (BullMQ)
 * Uso: npm run worker  (após build) ou npm run worker:dev
 */
import { DataSource } from 'typeorm';
import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import axios from 'axios';
import { dataSourceOptions } from '../database/data-source';
import { WebhookDelivery } from '../modules/webhooks/entities/webhook-delivery.entity';

const QUEUE_NAME = 'webhook-deliveries';
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const connection = new IORedis(redisUrl, { maxRetriesPerRequest: null });

const dataSource = new DataSource({
  ...dataSourceOptions,
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
});

async function run() {
  await dataSource.initialize();

  const worker = new Worker(
    QUEUE_NAME,
    async (job) => {
      const { webhookEndpointId, eventId, event, payload } = job.data as {
        webhookEndpointId: string;
        eventId: string;
        event: string;
        payload: { body: string; url: string; timestamp: string; signature: string };
      };
      const attempt = job.attemptsMade ?? 0;
      let statusCode = 0;
      let responseBody = '';
      let errorMessage = '';

      try {
        const res = await axios.post(payload.url, payload.body, {
          headers: {
            'Content-Type': 'application/json',
            'X-Event-Id': eventId,
            'X-Timestamp': payload.timestamp,
            'X-Signature': payload.signature,
          },
          timeout: 30000,
          validateStatus: () => true,
        });
        statusCode = res.status;
        responseBody = typeof res.data === 'string' ? res.data : JSON.stringify(res.data);
        if (statusCode < 200 || statusCode >= 300) {
          errorMessage = `HTTP ${statusCode}`;
          throw new Error(errorMessage);
        }
      } catch (err: unknown) {
        statusCode = (err as { response?: { status?: number } })?.response?.status ?? 0;
        errorMessage = err instanceof Error ? err.message : String(err);
        throw err;
      } finally {
        const deliveryRepo = dataSource.getRepository(WebhookDelivery);
        await deliveryRepo.insert({
          webhookEndpointId,
          eventId,
          event,
          requestBody: payload.body?.slice(0, 10000),
          attempt,
          statusCode,
          responseBody: responseBody?.slice(0, 2000),
          errorMessage: errorMessage?.slice(0, 500),
          status: statusCode >= 200 && statusCode < 300 ? 'success' : 'failed',
        });
      }
    },
    {
      connection,
      concurrency: 5,
    },
  );

  worker.on('completed', (job) => console.log(`Job ${job.id} completed`));
  worker.on('failed', (job, err) => console.error(`Job ${job?.id} failed:`, err?.message));
  console.log('NEXGATE Worker running (webhook-deliveries)');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
