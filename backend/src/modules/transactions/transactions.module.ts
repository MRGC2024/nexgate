import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from './entities/transaction.entity';
import { TransactionEvent } from './entities/transaction-event.entity';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { TransactionsPublicController } from './transactions-public.controller';
import { WebhookProviderController } from './webhook-provider.controller';
import { RoutingModule } from '../routing/routing.module';
import { ConnectorsModule } from '../connectors/connectors.module';
import { WebhooksModule } from '../webhooks/webhooks.module';
import { ApiKeysModule } from '../api-keys/api-keys.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction, TransactionEvent]),
    RoutingModule,
    ConnectorsModule,
    WebhooksModule,
    ApiKeysModule,
  ],
  controllers: [TransactionsController, TransactionsPublicController, WebhookProviderController],
  providers: [TransactionsService],
  exports: [TransactionsService],
})
export class TransactionsModule {}
