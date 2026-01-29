import { Controller, Get, Post, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ApiKeysService } from './api-keys.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';

@ApiTags('api-keys')
@Controller('api-keys')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ApiKeysController {
  constructor(private apiKeysService: ApiKeysService) {}

  @Post()
  @ApiOperation({ summary: 'Criar API Key (merchant)' })
  @Roles('superadmin', 'merchant_admin', 'merchant_dev')
  async create(
    @CurrentUser() user: JwtPayload,
    @Body() body: { merchantId?: string; name?: string },
  ) {
    const merchantId = body.merchantId || user.merchantId;
    if (!merchantId) throw new Error('merchantId obrigatório');
    if (user.merchantId && user.merchantId !== merchantId) throw new Error('Merchant não autorizado');
    return this.apiKeysService.create(merchantId, body.name);
  }

  @Get()
  @ApiOperation({ summary: 'Listar API Keys do merchant' })
  @Roles('superadmin', 'merchant_admin', 'merchant_dev')
  async list(@CurrentUser() user: JwtPayload) {
    const merchantId = user.merchantId;
    if (!merchantId) return []; // superadmin sem merchant
    return this.apiKeysService.listByMerchant(merchantId);
  }

  @Get('merchant/:merchantId')
  @ApiOperation({ summary: 'Listar API Keys por merchant (superadmin)' })
  @Roles('superadmin')
  async listByMerchant(@Param('merchantId') merchantId: string) {
    return this.apiKeysService.listByMerchant(merchantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Ver API Key' })
  @Roles('superadmin', 'merchant_admin', 'merchant_dev')
  async get(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.apiKeysService.findOne(id, user.merchantId ?? undefined);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Revogar API Key' })
  @Roles('superadmin', 'merchant_admin', 'merchant_dev')
  async revoke(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    await this.apiKeysService.revoke(id, user.merchantId ?? undefined);
    return { ok: true };
  }
}
