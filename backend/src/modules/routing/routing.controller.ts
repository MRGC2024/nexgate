import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RoutingService } from './routing.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';

@ApiTags('routing')
@Controller('routing')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class RoutingController {
  constructor(private routingService: RoutingService) {}

  @Get('merchant/:merchantId')
  @ApiOperation({ summary: 'Listar regras de roteamento (superadmin)' })
  @Roles('superadmin')
  async listByMerchant(@Param('merchantId') merchantId: string) {
    return this.routingService.listRules(merchantId);
  }

  @Get('my')
  @ApiOperation({ summary: 'Listar regras do merchant atual' })
  @Roles('superadmin', 'merchant_admin', 'merchant_dev')
  async listMine(@CurrentUser() user: JwtPayload) {
    if (!user.merchantId) return [];
    return this.routingService.listRules(user.merchantId);
  }

  @Post()
  @ApiOperation({ summary: 'Criar regra de roteamento' })
  @Roles('superadmin', 'merchant_admin')
  async create(@Body() body: Partial<{ merchantId: string; connectorDefinitionId: string; paymentMethod: string; amountMinCents: number; amountMaxCents: number; currency: string; priority: number; isFallback: boolean; merchantTags: string[] }>, @CurrentUser() user: JwtPayload) {
    const merchantId = body.merchantId || user.merchantId;
    if (!merchantId) throw new Error('merchantId obrigatório');
    if (user.merchantId && user.merchantId !== merchantId) throw new Error('Merchant não autorizado');
    return this.routingService.createRule({ ...body, merchantId });
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar regra' })
  @Roles('superadmin', 'merchant_admin')
  async update(@Param('id') id: string, @Body() body: Partial<{ active: boolean; priority: number; amountMinCents: number; amountMaxCents: number }>, @CurrentUser() user: JwtPayload) {
    return this.routingService.updateRule(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover regra' })
  @Roles('superadmin', 'merchant_admin')
  async delete(@Param('id') id: string) {
    await this.routingService.deleteRule(id);
    return { ok: true };
  }
}
