import { Controller, Get, Post, Put, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ConnectorsService } from './connectors.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';

@ApiTags('connectors')
@Controller('connectors')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ConnectorsController {
  constructor(private connectorsService: ConnectorsService) {}

  @Get('definitions')
  @ApiOperation({ summary: 'Listar definições de conectores' })
  @Roles('superadmin', 'merchant_admin', 'merchant_dev')
  async listDefinitions() {
    return this.connectorsService.listDefinitions();
  }

  @Get('definitions/:code/health')
  @ApiOperation({ summary: 'Health check do conector' })
  @Roles('superadmin', 'merchant_admin')
  async health(@Param('code') code: string) {
    const connector = this.connectorsService.getConnector(code);
    if (!connector) return { ok: false, error: 'Conector não encontrado' };
    const ok = await connector.healthCheck({});
    return { ok };
  }

  @Get('merchant/:merchantId')
  @ApiOperation({ summary: 'Listar conectores do merchant (superadmin)' })
  @Roles('superadmin')
  async listByMerchant(@Param('merchantId') merchantId: string) {
    return this.connectorsService.listMerchantConnectors(merchantId);
  }

  @Get('my')
  @ApiOperation({ summary: 'Listar conectores do merchant atual' })
  @Roles('merchant_admin', 'merchant_dev')
  async listMine(@CurrentUser() user: JwtPayload) {
    if (!user.merchantId) return [];
    return this.connectorsService.listMerchantConnectors(user.merchantId);
  }

  @Put('merchant/:merchantId/config')
  @ApiOperation({ summary: 'Configurar conector do merchant' })
  @Roles('superadmin', 'merchant_admin')
  async setConfig(
    @Param('merchantId') merchantId: string,
    @Body() body: { connectorDefinitionId: string; config: Record<string, unknown> },
    @CurrentUser() user: JwtPayload,
  ) {
    if (user.merchantId && user.merchantId !== merchantId) throw new Error('Merchant não autorizado');
    return this.connectorsService.setMerchantConfig(merchantId, body.connectorDefinitionId, body.config);
  }
}
