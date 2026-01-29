import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WebhookEndpoint } from './entities/webhook-endpoint.entity';
import { WebhookDelivery } from './entities/webhook-delivery.entity';
import { WebhooksQueue } from './webhooks.queue';
import { WebhookSigningService } from './webhook-signing.service';

const RETRY_DELAYS_MS = [60 * 1000, 5 * 60 * 1000, 15 * 60 * 1000, 60 * 60 * 1000, 6 * 60 * 60 * 1000];

@Injectable()
export class WebhooksService {
  constructor(
    @InjectRepository(WebhookEndpoint)
    private endpointRepo: Repository<WebhookEndpoint>,
    @InjectRepository(WebhookDelivery)
    private deliveryRepo: Repository<WebhookDelivery>,
    private queue: WebhooksQueue,
    private signing: WebhookSigningService,
  ) {}

  async createEndpoint(merchantId: string, data: { url: string; events: string[]; description?: string }): Promise<WebhookEndpoint> {
    const entity = this.endpointRepo.create({
      merchantId,
      url: data.url,
      events: data.events,
      description: data.description,
      active: true,
    });
    return this.endpointRepo.save(entity);
  }

  async listEndpoints(merchantId: string): Promise<WebhookEndpoint[]> {
    return this.endpointRepo.find({
      where: { merchantId },
      order: { createdAt: 'DESC' },
    });
  }

  async getEndpoint(id: string, merchantId?: string): Promise<WebhookEndpoint> {
    const e = await this.endpointRepo.findOne({ where: { id } });
    if (!e) throw new NotFoundException('Webhook endpoint não encontrado');
    if (merchantId && e.merchantId !== merchantId) throw new ForbiddenException();
    return e;
  }

  async deleteEndpoint(id: string, merchantId?: string): Promise<void> {
    const e = await this.getEndpoint(id, merchantId);
    await this.endpointRepo.remove(e);
  }

  async dispatchToMerchant(merchantId: string, event: string, payload: Record<string, unknown>): Promise<void> {
    const endpoints = await this.endpointRepo.find({
      where: { merchantId, active: true },
    });
    const body = JSON.stringify({
      event,
      transaction: payload.transaction,
      merchant_id: merchantId,
      occurred_at: new Date().toISOString(),
      ...payload,
    });
    const { 'X-Event-Id': eventId, 'X-Timestamp': timestamp, 'X-Signature': signature } = this.signing.getHeaders(body);

    for (const ep of endpoints) {
      if (!ep.events.includes(event)) continue;
      await this.queue.add(
        {
          webhookEndpointId: ep.id,
          eventId,
          event,
          payload: { body, timestamp, signature, url: ep.url },
        },
        { delay: 0 },
      );
    }
  }

  async recordDelivery(
    webhookEndpointId: string,
    eventId: string,
    event: string,
    attempt: number,
    statusCode: number,
    responseBody?: string,
    errorMessage?: string,
  ): Promise<WebhookDelivery> {
    const delivery = this.deliveryRepo.create({
      webhookEndpointId,
      eventId,
      event,
      attempt,
      statusCode,
      responseBody: responseBody?.slice(0, 2000),
      errorMessage: errorMessage?.slice(0, 500),
      status: statusCode >= 200 && statusCode < 300 ? 'success' : 'failed',
    });
    return this.deliveryRepo.save(delivery);
  }

  async listDeliveries(merchantId?: string, filters?: { webhookEndpointId?: string; event?: string; status?: string }): Promise<WebhookDelivery[]> {
    const qb = this.deliveryRepo
      .createQueryBuilder('d')
      .leftJoinAndSelect('d.webhookEndpoint', 'e')
      .orderBy('d.createdAt', 'DESC')
      .take(100);
    if (merchantId) qb.andWhere('e.merchantId = :merchantId', { merchantId });
    if (filters?.webhookEndpointId) qb.andWhere('d.webhookEndpointId = :wid', { wid: filters.webhookEndpointId });
    if (filters?.event) qb.andWhere('d.event = :event', { event: filters.event });
    if (filters?.status) qb.andWhere('d.status = :status', { status: filters.status });
    return qb.getMany();
  }

  async retryDelivery(id: string, merchantId?: string): Promise<void> {
    const d = await this.deliveryRepo.findOne({ where: { id }, relations: ['webhookEndpoint'] });
    if (!d) throw new NotFoundException('Entrega não encontrada');
    if (merchantId && d.webhookEndpoint.merchantId !== merchantId) throw new ForbiddenException();
    const body = d.requestBody || JSON.stringify({ event: d.event, transaction: {} });
    const { 'X-Event-Id': eventId, 'X-Timestamp': timestamp, 'X-Signature': signature } = this.signing.getHeaders(body);
    await this.queue.add(
      {
        webhookEndpointId: d.webhookEndpointId,
        eventId,
        event: d.event,
        payload: { body, timestamp, signature, url: d.webhookEndpoint.url },
      },
      { delay: 0 },
    );
  }
}
