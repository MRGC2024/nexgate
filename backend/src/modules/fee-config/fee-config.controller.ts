import { Controller, Get, Put, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FeeConfigService } from './fee-config.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { FeeConfigData } from './entities/fee-config.entity';

@ApiTags('fee-config')
@Controller('fee-config')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class FeeConfigController {
  constructor(private feeConfigService: FeeConfigService) {}

  @Get()
  @ApiOperation({ summary: 'Obter taxas globais (padrão para novas empresas)' })
  @Roles('superadmin', 'gerencia')
  getConfig() {
    return this.feeConfigService.getGlobalConfig();
  }

  @Put()
  @ApiOperation({ summary: 'Atualizar taxas globais' })
  @Roles('superadmin', 'gerencia')
  updateConfig(@Body() body: Partial<FeeConfigData>) {
    return this.feeConfigService.updateGlobalConfig(body);
  }

  @Get('merchant/:merchantId')
  @ApiOperation({ summary: 'Obter taxas da empresa (usa padrão se não tiver override)' })
  @Roles('superadmin', 'gerencia', 'analise_risco', 'merchant_admin')
  getMerchantConfig(@Param('merchantId') merchantId: string) {
    return this.feeConfigService.getMerchantConfig(merchantId);
  }

  @Put('merchant/:merchantId')
  @ApiOperation({ summary: 'Atualizar taxas da empresa' })
  @Roles('superadmin', 'gerencia')
  updateMerchantConfig(@Param('merchantId') merchantId: string, @Body() body: Partial<FeeConfigData>) {
    return this.feeConfigService.updateMerchantConfig(merchantId, body);
  }
}
