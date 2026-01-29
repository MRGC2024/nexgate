import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction, TransactionStatus, PaymentMethod } from './entities/transaction.entity';
import { TransactionEvent } from './entities/transaction-event.entity';
import { RoutingService } from '../routing/routing.service';
import { ConnectorsService } from '../connectors/connectors.service';
import { WebhooksService } from './../webhooks/webhooks.service';
import type { CreatePaymentPayload } from '../connectors/interfaces/payment-connector.interface';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private txRepo: Repository<Transaction>,
    @InjectRepository(TransactionEvent)
    private eventRepo: Repository<TransactionEvent>,
    private routingService: RoutingService,
    private connectorsService: ConnectorsService,
    private webhooksService: WebhooksService,
  ) {}

  async create(
    merchantId: string,
    payload: {
      amountCents: number;
      currency?: string;
      paymentMethod: PaymentMethod;
      externalRef: string;
      customer?: Record<string, unknown>;
      items?: Record<string, unknown>[];
      metadata?: Record<string, unknown>;
      returnUrl?: string;
      postbackUrl?: string;
      idempotencyKey?: string;
    },
  ): Promise<Transaction> {
    if (payload.idempotencyKey) {
      const existing = await this.txRepo.findOne({
        where: { merchantId, idempotencyKey: payload.idempotencyKey },
      });
      if (existing) return existing;
    }

    const routing = await this.routingService.selectConnector({
      merchantId,
      paymentMethod: payload.paymentMethod,
      amountCents: payload.amountCents,
      currency: payload.currency || 'BRL',
    });
    if (!routing) throw new BadRequestException('Nenhum conector configurado para este método/valor');

    const connector = this.connectorsService.getConnector(routing.connectorCode);
    if (!connector) throw new BadRequestException('Conector indisponível');

    const createPayload: CreatePaymentPayload = {
      amountCents: payload.amountCents,
      currency: payload.currency || 'BRL',
      paymentMethod: payload.paymentMethod,
      externalRef: payload.externalRef,
      customer: payload.customer as CreatePaymentPayload['customer'],
      items: payload.items,
      metadata: payload.metadata,
      returnUrl: payload.returnUrl,
      postbackUrl: payload.postbackUrl,
      expiresInMinutes: payload.paymentMethod === 'pix' ? 30 : undefined,
    };

    const result = await connector.createPayment(routing.config, createPayload);

    const tx = this.txRepo.create({
      merchantId,
      amountCents: payload.amountCents,
      currency: payload.currency || 'BRL',
      paymentMethod: payload.paymentMethod,
      status: (result.status === 'waiting_payment' ? 'waiting_payment' : result.status) as TransactionStatus,
      externalRef: payload.externalRef,
      customer: payload.customer,
      items: payload.items || [],
      providerCode: routing.connectorCode,
      providerTransactionId: result.providerTransactionId,
      pixQr: result.pixQr,
      pixCopyPaste: result.pixCopyPaste,
      expiresAt: result.expiresAt,
      boletoUrl: result.boletoUrl,
      boletoLine: result.boletoLine,
      cardLast4: result.cardLast4,
      cardBrand: result.cardBrand,
      installments: result.installments,
      metadata: payload.metadata,
      idempotencyKey: payload.idempotencyKey,
    });
    const saved = await this.txRepo.save(tx);
    await this.eventRepo.insert({
      transactionId: saved.id,
      event: 'transaction.created',
      payload: { status: saved.status },
      source: 'api',
    });
    await this.webhooksService.dispatchToMerchant(merchantId, 'transaction.created', {
      transaction: this.toPublicTransaction(saved),
    });
    return saved;
  }

  async findAll(merchantId: string | null, filters?: { status?: string; paymentMethod?: string; limit?: number }): Promise<Transaction[]> {
    const qb = this.txRepo
      .createQueryBuilder('t')
      .orderBy('t.createdAt', 'DESC')
      .take(filters?.limit ?? 50);
    if (merchantId) qb.andWhere('t.merchantId = :merchantId', { merchantId });
    if (filters?.status) qb.andWhere('t.status = :status', { status: filters.status });
    if (filters?.paymentMethod) qb.andWhere('t.paymentMethod = :method', { method: filters.paymentMethod });
    return qb.getMany();
  }

  async findOne(id: string, merchantId?: string): Promise<Transaction> {
    const tx = await this.txRepo.findOne({ where: { id }, relations: ['merchant'] });
    if (!tx) throw new NotFoundException('Transação não encontrada');
    if (merchantId && tx.merchantId !== merchantId) throw new ForbiddenException();
    return tx;
  }

  async cancel(id: string, merchantId?: string): Promise<Transaction> {
    const tx = await this.findOne(id, merchantId);
    if (tx.status !== 'created' && tx.status !== 'waiting_payment') throw new BadRequestException('Transação não pode ser cancelada');
    tx.status = 'canceled';
    tx.canceledAt = new Date();
    const saved = await this.txRepo.save(tx);
    await this.eventRepo.insert({ transactionId: tx.id, event: 'transaction.canceled', source: 'api' });
    await this.webhooksService.dispatchToMerchant(tx.merchantId, 'transaction.canceled', { transaction: this.toPublicTransaction(saved) });
    return saved;
  }

  async refund(id: string, amountCents?: number, merchantId?: string): Promise<Transaction> {
    const tx = await this.findOne(id, merchantId);
    if (tx.status !== 'paid') throw new BadRequestException('Apenas transações pagas podem ser estornadas');
    const connector = this.connectorsService.getConnector(tx.providerCode!);
    if (connector) {
      const config = await this.connectorsService.getMerchantConfig(tx.merchantId, tx.providerCode!);
      if (config) await connector.refundPayment(config, tx.providerTransactionId!, amountCents);
    }
    tx.status = 'refunded';
    tx.refundedAt = new Date();
    const saved = await this.txRepo.save(tx);
    await this.eventRepo.insert({ transactionId: tx.id, event: 'transaction.refunded', source: 'api' });
    await this.webhooksService.dispatchToMerchant(tx.merchantId, 'transaction.refunded', { transaction: this.toPublicTransaction(saved) });
    return saved;
  }

  async processProviderWebhook(providerCode: string, body: unknown, headers?: Record<string, string>): Promise<void> {
    const connector = this.connectorsService.getConnector(providerCode);
    if (!connector) return;
    const parsed = await connector.parseWebhook(body, headers);
    if (!parsed) return;
    const tx = await this.txRepo.findOne({
      where: { providerCode, providerTransactionId: parsed.providerTransactionId },
    });
    if (!tx) return;
    const oldStatus = tx.status;
    tx.status = parsed.status as TransactionStatus;
    if (parsed.status === 'paid') tx.paidAt = parsed.paidAt || new Date();
    await this.txRepo.save(tx);
    const ev = this.eventRepo.create({
      transactionId: tx.id,
      event: parsed.event,
      payload: parsed.payload ?? {},
      source: 'provider_webhook',
    });
    await this.eventRepo.save(ev);
    if (parsed.status !== oldStatus) {
      await this.webhooksService.dispatchToMerchant(tx.merchantId, parsed.event, { transaction: this.toPublicTransaction(tx) });
    }
  }

  toPublicTransaction(tx: Transaction): Record<string, unknown> {
    return {
      id: tx.id,
      merchantId: tx.merchantId,
      amountCents: tx.amountCents,
      currency: tx.currency,
      paymentMethod: tx.paymentMethod,
      status: tx.status,
      externalRef: tx.externalRef,
      providerCode: tx.providerCode,
      providerTransactionId: tx.providerTransactionId,
      pixQr: tx.pixQr,
      pixCopyPaste: tx.pixCopyPaste,
      expiresAt: tx.expiresAt?.toISOString(),
      boletoUrl: tx.boletoUrl,
      boletoLine: tx.boletoLine,
      paidAt: tx.paidAt?.toISOString(),
      createdAt: tx.createdAt?.toISOString(),
      updatedAt: tx.updatedAt?.toISOString(),
    };
  }

  async getEvents(transactionId: string, merchantId?: string): Promise<TransactionEvent[]> {
    const tx = await this.findOne(transactionId, merchantId);
    return this.eventRepo.find({ where: { transactionId: tx.id }, order: { createdAt: 'ASC' } });
  }
}
