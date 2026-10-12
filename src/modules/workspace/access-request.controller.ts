import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Access Requests')
@ApiBearerAuth()
@Controller('api/access-request')
export class AccessRequestController {
  @ApiOperation({ summary: 'Crear solicitud de acceso a vista o espacio' })
  @Post()
  async createAccessRequest(@Body() body: any) {
    return {
      request_id: crypto.randomUUID(),
      status: 'pending',
      created_at: new Date().toISOString(),
    };
  }

  @ApiOperation({ summary: 'Obtener estado de solicitud de acceso' })
  @Get(':request_id')
  async getAccessRequest(@Param('request_id') requestId: string) {
    return {
      request_id: requestId,
      status: 'pending',
      created_at: new Date().toISOString(),
    };
  }

  @ApiOperation({ summary: 'Aprobar solicitud de acceso' })
  @Post(':request_id/approve')
  async approveAccessRequest(@Param('request_id') requestId: string) {
    return {
      request_id: requestId,
      status: 'approved',
      updated_at: new Date().toISOString(),
    };
  }
}
