import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
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
  @ApiOperation({ summary: 'Obter taxas globais' })
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
}
