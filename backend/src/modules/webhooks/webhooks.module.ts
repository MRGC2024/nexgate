import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WebhookEndpoint } from './entities/webhook-endpoint.entity';
import { WebhookDelivery } from './entities/webhook-delivery.entity';
import { WebhooksService } from './webhooks.service';
import { WebhooksController } from './webhooks.controller';
import { WebhooksPublicController } from './webhooks-public.controller';
import { WebhooksQueue } from './webhooks.queue';
import { WebhookSigningService } from './webhook-signing.service';
import { ApiKeysModule } from '../api-keys/api-keys.module';

@Module({
  imports: [TypeOrmModule.forFeature([WebhookEndpoint, WebhookDelivery]), ApiKeysModule],
  controllers: [WebhooksController, WebhooksPublicController],
  providers: [WebhooksService, WebhooksQueue, WebhookSigningService],
  exports: [WebhooksService, WebhookSigningService],
})
export class WebhooksModule {}
