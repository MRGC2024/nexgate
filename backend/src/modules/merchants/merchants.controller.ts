import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MerchantsService } from './merchants.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';

@ApiTags('merchants')
@Controller('merchants')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class MerchantsController {
  constructor(private merchantsService: MerchantsService) {}

  @Post()
  @ApiOperation({ summary: 'Criar merchant (superadmin)' })
  @Roles('superadmin')
  async create(@Body() body: Partial<{ name: string; slug: string; document: string; email: string; accentColor: string }>) {
    return this.merchantsService.create(body);
  }

  @Get()
  @ApiOperation({ summary: 'Listar merchants' })
  @Roles('superadmin', 'gerencia', 'analise_risco')
  async findAll() {
    return this.merchantsService.findAll();
  }

  @Get(':id/full-detail')
  @ApiOperation({ summary: 'Detalhe completo do merchant: transações' })
  @Roles('superadmin', 'gerencia', 'analise_risco')
  async fullDetail(@Param('id') id: string) {
    return this.merchantsService.getFullDetail(id);
  }

  @Get(':id/documents')
  @ApiOperation({ summary: 'Listar documentos do merchant' })
  @Roles('superadmin', 'gerencia', 'analise_risco', 'merchant_admin')
  async listDocuments(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    const isStaff = user.roles?.some((r) => ['superadmin', 'gerencia', 'analise_risco'].includes(r));
    if (!isStaff && user.merchantId !== id) throw new ForbiddenException('Só pode ver documentos da própria empresa.');
    return this.merchantsService.listDocuments(id);
  }

  @Post(':id/documents')
  @ApiOperation({ summary: 'Enviar documento do merchant' })
  @Roles('superadmin', 'gerencia', 'merchant_admin')
  async addDocument(
    @Param('id') id: string,
    @Body() body: { documentType: string; fileUrl: string },
    @CurrentUser() user: JwtPayload,
  ) {
    const isStaff = user.roles?.some((r) => ['superadmin', 'gerencia'].includes(r));
    if (!isStaff && user.merchantId !== id) throw new ForbiddenException('Só pode enviar documentos da própria empresa.');
    return this.merchantsService.addDocument(id, body.documentType as any, body.fileUrl);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter merchant' })
  @Roles('superadmin', 'gerencia', 'analise_risco', 'merchant_admin')
  async findOne(@Param('id') id: string) {
    return this.merchantsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar merchant (admin: tudo; merchant: só phone e pixWithdrawalKey)' })
  @Roles('superadmin', 'gerencia', 'merchant_admin')
  async update(
    @Param('id') id: string,
    @Body()
    body: Partial<{
      name: string;
      accentColor: string;
      active: boolean;
      tags: string[];
      registrationStatus: string;
      phone: string;
      email: string;
      address: string;
      withdrawalLimitCents: number;
      withdrawalFeePercent: number;
      withdrawalFeeFixedCents: number;
      acquirerCode: string;
      pixWithdrawalKey: string;
    }>,
    @CurrentUser() user: JwtPayload,
  ) {
    const isStaff = user.roles?.some((r) => ['superadmin', 'gerencia'].includes(r));
    if (!isStaff && user.merchantId !== id) throw new ForbiddenException('Só pode editar a própria empresa.');
    if (!isStaff && user.merchantId === id) {
      body = { phone: body?.phone, pixWithdrawalKey: body?.pixWithdrawalKey };
    }
    return this.merchantsService.update(id, body);
  }

  @Post(':id/approve')
  @ApiOperation({ summary: 'Aprovar cadastro do merchant' })
  @Roles('superadmin', 'gerencia', 'analise_risco')
  async approve(@Param('id') id: string) {
    return this.merchantsService.update(id, { registrationStatus: 'approved', active: true });
  }

  @Post(':id/reject')
  @ApiOperation({ summary: 'Rejeitar cadastro do merchant' })
  @Roles('superadmin', 'gerencia', 'analise_risco')
  async reject(@Param('id') id: string) {
    return this.merchantsService.update(id, { registrationStatus: 'rejected', active: false });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover merchant (superadmin)' })
  @Roles('superadmin')
  async remove(@Param('id') id: string) {
    await this.merchantsService.remove(id);
    return { ok: true };
  }
}
