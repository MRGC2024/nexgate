import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoutingRule } from './entities/routing-rule.entity';
import { RoutingService } from './routing.service';
import { RoutingController } from './routing.controller';
import { ConnectorsModule } from '../connectors/connectors.module';

@Module({
  imports: [TypeOrmModule.forFeature([RoutingRule]), ConnectorsModule],
  controllers: [RoutingController],
  providers: [RoutingService],
  exports: [RoutingService],
})
export class RoutingModule {}
