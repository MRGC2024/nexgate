import { Controller, Post, Param, Body, RawBodyRequest, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { TransactionsService } from './transactions.service';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('webhooks-provider')
@Controller('webhooks/provider')
@Public()
export class WebhookProviderController {
  constructor(private transactionsService: TransactionsService) {}

  @Post(':providerCode')
  async handle(
    @Param('providerCode') providerCode: string,
    @Body() body: unknown,
    @Req() req: RawBodyRequest<Request>,
  ) {
    const headers: Record<string, string> = {};
    if (req.headers) {
      for (const [k, v] of Object.entries(req.headers)) {
        if (typeof v === 'string') headers[k] = v;
      }
    }
    await this.transactionsService.processProviderWebhook(providerCode, body, headers);
    return { received: true };
  }
}
