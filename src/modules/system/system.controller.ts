import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { SystemService } from './system.service';
import { ServerInfoResponseDto } from './dto/server-info.dto';
import { AppResponseDto } from '../../common/dto/api-response.dto';

@ApiTags('System')
@Controller()
export class SystemController {
  constructor(private readonly systemService: SystemService) {}

  @Public()
  @Get('health')
  @ApiOperation({ summary: 'Liveness health check principal' })
  @ApiResponse({ status: 200, description: 'Servidor saludable', example: 'OK' })
  healthCheck(): string {
    return 'OK';
  }

  @Public()
  @Get('api/health')
  @ApiOperation({ summary: 'Liveness health check bajo prefijo /api' })
  @ApiResponse({ status: 200, description: 'Servidor saludable', example: 'OK' })
  apiHealthCheck(): string {
    return 'OK';
  }

  @Public()
  @Get('api/server')
  @ApiOperation({
    summary: 'Información y capacidades del servidor (compatibilidad con AppFlowy Web/Desktop)',
  })
  @ApiResponse({
    status: 200,
    description: 'Información y compatibilidad devuelta exitosamente',
    type: ServerInfoResponseDto,
  })
  getServerInfo(): ServerInfoResponseDto {
    return this.systemService.getServerInfo();
  }
}
