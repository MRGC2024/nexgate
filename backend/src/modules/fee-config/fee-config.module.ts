import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeeConfig } from './entities/fee-config.entity';
import { FeeConfigService } from './fee-config.service';
import { FeeConfigController } from './fee-config.controller';

@Module({
  imports: [TypeOrmModule.forFeature([FeeConfig])],
  controllers: [FeeConfigController],
  providers: [FeeConfigService],
  exports: [FeeConfigService],
})
export class FeeConfigModule {}
