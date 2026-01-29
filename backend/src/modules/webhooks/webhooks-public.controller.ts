import { Controller, Get, Post, Query, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiSecurity } from '@nestjs/swagger';
import { WebhooksService } from './webhooks.service';
import { ApiKeyGuard } from '../../common/guards/api-key.guard';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';

@ApiTags('webhooks')
@ApiSecurity('api-key')
@Controller('v1/webhooks')
@UseGuards(ApiKeyGuard)
export class WebhooksPublicController {
  constructor(private webhooksService: WebhooksService) {}

  @Get('deliveries')
  @ApiOperation({ summary: 'Listar entregas de webhook' })
  async listDeliveries(
    @CurrentUser() user: JwtPayload,
    @Query('webhook_endpoint_id') webhookEndpointId?: string,
    @Query('event') event?: string,
    @Query('status') status?: string,
  ) {
    return this.webhooksService.listDeliveries(user.merchantId!, {
      webhookEndpointId,
      event,
      status,
    });
  }

  @Post('test')
  @ApiOperation({ summary: 'Enviar evento de teste' })
  async test(@CurrentUser() user: JwtPayload, @Body() body: { event?: string }) {
    await this.webhooksService.dispatchToMerchant(user.merchantId!, body.event || 'transaction.created', {
      transaction: { id: 'test', status: 'created', amount_cents: 0 },
    });
    return { ok: true };
  }
}
