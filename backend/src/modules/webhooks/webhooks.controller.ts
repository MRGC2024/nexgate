import { Controller, Get, Post, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { WebhooksService } from './webhooks.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';

@ApiTags('webhooks')
@Controller('webhooks')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class WebhooksController {
  constructor(private webhooksService: WebhooksService) {}

  @Post()
  @ApiOperation({ summary: 'Criar endpoint de webhook' })
  @Roles('superadmin', 'merchant_admin', 'merchant_dev')
  async create(
    @CurrentUser() user: JwtPayload,
    @Body() body: { url: string; events: string[]; description?: string; merchantId?: string },
  ) {
    const merchantId = body.merchantId || user.merchantId;
    if (!merchantId) throw new Error('merchantId obrigatório');
    if (user.merchantId && user.merchantId !== merchantId) throw new Error('Merchant não autorizado');
    return this.webhooksService.createEndpoint(merchantId, body);
  }

  @Get()
  @ApiOperation({ summary: 'Listar endpoints' })
  @Roles('superadmin', 'merchant_admin', 'merchant_dev')
  async list(@CurrentUser() user: JwtPayload, @Query('merchantId') merchantId?: string) {
    const mid = merchantId || user.merchantId;
    if (!mid) return [];
    return this.webhooksService.listEndpoints(mid);
  }

  @Get('deliveries')
  @ApiOperation({ summary: 'Listar entregas' })
  @Roles('superadmin', 'merchant_admin', 'merchant_dev')
  async listDeliveries(
    @CurrentUser() user: JwtPayload,
    @Query('merchantId') merchantId?: string,
    @Query('webhookEndpointId') webhookEndpointId?: string,
    @Query('event') event?: string,
    @Query('status') status?: string,
  ) {
    const mid = merchantId || user.merchantId;
    return this.webhooksService.listDeliveries(mid, { webhookEndpointId, event, status });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter endpoint' })
  @Roles('superadmin', 'merchant_admin', 'merchant_dev')
  async get(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.webhooksService.getEndpoint(id, user.merchantId ?? undefined);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover endpoint' })
  @Roles('superadmin', 'merchant_admin')
  async delete(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    await this.webhooksService.deleteEndpoint(id, user.merchantId ?? undefined);
    return { ok: true };
  }

  @Post('test')
  @ApiOperation({ summary: 'Enviar evento de teste' })
  @Roles('superadmin', 'merchant_admin', 'merchant_dev')
  async test(@CurrentUser() user: JwtPayload, @Body() body: { merchantId?: string; event?: string }) {
    const merchantId = body.merchantId || user.merchantId;
    if (!merchantId) throw new Error('merchantId obrigatório');
    const event = body.event || 'transaction.created';
    await this.webhooksService.dispatchToMerchant(merchantId, event, {
      transaction: { id: 'test', status: 'created', amount_cents: 0 },
    });
    return { ok: true, event };
  }

  @Post('deliveries/:id/retry')
  @ApiOperation({ summary: 'Reenviar webhook' })
  @Roles('superadmin', 'merchant_admin', 'merchant_dev')
  async retry(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    await this.webhooksService.retryDelivery(id, user.merchantId ?? undefined);
    return { ok: true };
  }
}
