import { Controller, Get, Post, Put, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Criar usuário' })
  @Roles('superadmin')
  async create(
    @Body()
    body: {
      email: string;
      password: string;
      name: string;
      merchantId?: string;
      roleNames?: string[];
    },
  ) {
    return this.usersService.create(body);
  }

  @Get()
  @ApiOperation({ summary: 'Listar usuários' })
  @Roles('superadmin')
  async findAll() {
    return this.usersService.findAll();
  }

  @Get('merchant/:merchantId')
  @ApiOperation({ summary: 'Listar usuários do merchant' })
  @Roles('superadmin', 'merchant_admin')
  async findByMerchant(@Param('merchantId') merchantId: string) {
    return this.usersService.findAll(merchantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter usuário' })
  @Roles('superadmin', 'merchant_admin')
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Put(':id/roles')
  @ApiOperation({ summary: 'Atualizar roles do usuário' })
  @Roles('superadmin', 'merchant_admin')
  async updateRoles(@Param('id') id: string, @Body() body: { roleNames: string[] }) {
    return this.usersService.updateRoles(id, body.roleNames);
  }
}
