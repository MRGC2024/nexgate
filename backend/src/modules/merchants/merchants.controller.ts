import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MerchantsService } from './merchants.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

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
  @Roles('superadmin')
  async findAll() {
    return this.merchantsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter merchant' })
  @Roles('superadmin', 'merchant_admin')
  async findOne(@Param('id') id: string) {
    return this.merchantsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar merchant' })
  @Roles('superadmin', 'merchant_admin')
  async update(@Param('id') id: string, @Body() body: Partial<{ name: string; accentColor: string; active: boolean; tags: string[] }>) {
    return this.merchantsService.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover merchant (superadmin)' })
  @Roles('superadmin')
  async remove(@Param('id') id: string) {
    await this.merchantsService.remove(id);
    return { ok: true };
  }
}
