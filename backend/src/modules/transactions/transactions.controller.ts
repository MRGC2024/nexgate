import { Controller, Get, Post, Param, Query, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';

@ApiTags('transactions')
@Controller('transactions')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class TransactionsController {
  constructor(private transactionsService: TransactionsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar transações (painel)' })
  @Roles('superadmin', 'merchant_admin', 'merchant_finance', 'merchant_dev')
  async list(
    @CurrentUser() user: JwtPayload,
    @Query('merchantId') merchantId?: string,
    @Query('status') status?: string,
    @Query('paymentMethod') paymentMethod?: string,
    @Query('limit') limit?: string,
  ) {
    const mid = merchantId || user.merchantId || null;
    return this.transactionsService.findAll(mid, { status, paymentMethod, limit: limit ? parseInt(limit, 10) : undefined });
  }

  @Get(':id/events')
  @ApiOperation({ summary: 'Timeline da transação' })
  @Roles('superadmin', 'merchant_admin', 'merchant_dev')
  async events(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.transactionsService.getEvents(id, user.merchantId ?? undefined);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter transação' })
  @Roles('superadmin', 'merchant_admin', 'merchant_finance', 'merchant_dev')
  async get(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    const merchantId = user.merchantId;
    return this.transactionsService.findOne(id, merchantId ?? undefined);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancelar transação' })
  @Roles('superadmin', 'merchant_admin')
  async cancel(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.transactionsService.cancel(id, user.merchantId ?? undefined);
  }

  @Post(':id/refund')
  @ApiOperation({ summary: 'Estornar transação' })
  @Roles('superadmin', 'merchant_admin')
  async refund(@Param('id') id: string, @Body() body: { amountCents?: number }, @CurrentUser() user: JwtPayload) {
    return this.transactionsService.refund(id, body.amountCents, user.merchantId ?? undefined);
  }
}
