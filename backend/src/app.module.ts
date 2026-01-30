import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './modules/auth/auth.module';
import { MerchantsModule } from './modules/merchants/merchants.module';
import { UsersModule } from './modules/users/users.module';
import { TransactionsModule } from './modules/transactions/transactions.module';
import { ConnectorsModule } from './modules/connectors/connectors.module';
import { WebhooksModule } from './modules/webhooks/webhooks.module';
import { ApiKeysModule } from './modules/api-keys/api-keys.module';
import { RoutingModule } from './modules/routing/routing.module';
import { AuditModule } from './modules/audit/audit.module';
import { HealthModule } from './modules/health/health.module';
import { FeeConfigModule } from './modules/fee-config/fee-config.module';
import { getDataSourceConfig } from './database/data-source';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    TypeOrmModule.forRootAsync({
      useFactory: () => getDataSourceConfig() as any,
    }),
    AuthModule,
    MerchantsModule,
    UsersModule,
    TransactionsModule,
    ConnectorsModule,
    WebhooksModule,
    ApiKeysModule,
    RoutingModule,
    AuditModule,
    HealthModule,
    FeeConfigModule,
  ],
})
export class AppModule {}
