import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConnectorDefinition } from './entities/connector-definition.entity';
import { MerchantConnector } from './entities/merchant-connector.entity';
import { ConnectorsService } from './connectors.service';
import { ConnectorsController } from './connectors.controller';
import { EncryptionService } from './encryption.service';

@Module({
  imports: [TypeOrmModule.forFeature([ConnectorDefinition, MerchantConnector])],
  controllers: [ConnectorsController],
  providers: [ConnectorsService, EncryptionService],
  exports: [ConnectorsService, EncryptionService],
})
export class ConnectorsModule {}
