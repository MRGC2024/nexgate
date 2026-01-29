import { Controller, Get, Post, Param, Query, Body, UseGuards, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiSecurity } from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { ApiKeyGuard } from '../../common/guards/api-key.guard';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';
import { PaymentMethod } from './entities/transaction.entity';

@ApiTags('transactions')
@ApiSecurity('api-key')
@Controller('v1/transactions')
@UseGuards(ApiKeyGuard)
export class TransactionsPublicController {
  constructor(private transactionsService: TransactionsService) {}

  @Post()
  @ApiOperation({ summary: 'Criar transação (API pública)' })
  async create(
    @CurrentUser() user: JwtPayload,
    @Headers('idempotency-key') idempotencyKey: string | undefined,
    @Body()
    body: {
      amount_cents: number;
      currency?: string;
      payment_method: PaymentMethod;
      external_ref: string;
      customer?: { name?: string; email?: string; document?: string; phone?: string };
      items?: Array<{ description?: string; quantity?: number; amount_cents?: number }>;
      metadata?: Record<string, unknown>;
      return_url?: string;
      postback_url?: string;
    },
  ) {
    const merchantId = user.merchantId!;
    const tx = await this.transactionsService.create(merchantId, {
      amountCents: body.amount_cents,
      currency: body.currency || 'BRL',
      paymentMethod: body.payment_method,
      externalRef: body.external_ref,
      customer: body.customer,
      items: body.items,
      metadata: body.metadata,
      returnUrl: body.return_url,
      postbackUrl: body.postback_url,
      idempotencyKey,
    });
    return {
      transaction_id: tx.id,
      status: tx.status,
      payment_method: tx.paymentMethod,
      pix_qr: tx.pixQr,
      pix_copy_paste: tx.pixCopyPaste,
      expires_at: tx.expiresAt?.toISOString(),
      boleto_url: tx.boletoUrl,
      boleto_line: tx.boletoLine,
      created_at: tx.createdAt?.toISOString(),
    };
  }

  @Get()
  @ApiOperation({ summary: 'Listar transações' })
  async list(
    @CurrentUser() user: JwtPayload,
    @Query('status') status?: string,
    @Query('payment_method') paymentMethod?: string,
    @Query('limit') limit?: string,
  ) {
    const list = await this.transactionsService.findAll(user.merchantId!, {
      status,
      paymentMethod: paymentMethod as PaymentMethod | undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
    return list.map((t) => this.transactionsService.toPublicTransaction(t));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter transação' })
  async get(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    const tx = await this.transactionsService.findOne(id, user.merchantId!);
    return this.transactionsService.toPublicTransaction(tx);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancelar transação' })
  async cancel(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    const tx = await this.transactionsService.cancel(id, user.merchantId!);
    return this.transactionsService.toPublicTransaction(tx);
  }

  @Post(':id/refund')
  @ApiOperation({ summary: 'Estornar transação' })
  async refund(@Param('id') id: string, @Body() body: { amount_cents?: number }, @CurrentUser() user: JwtPayload) {
    const tx = await this.transactionsService.refund(id, body.amount_cents, user.merchantId!);
    return this.transactionsService.toPublicTransaction(tx);
  }
}
