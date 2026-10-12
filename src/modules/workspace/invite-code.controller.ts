import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags('Invite Codes')
@ApiBearerAuth()
@Controller('api/invite-code-info')
export class InviteCodeController {
  @ApiOperation({ summary: 'Obtener información de código de invitación' })
  @ApiQuery({ name: 'code', example: 'INVITE123' })
  @Get()
  async getInviteCodeInfo(@Query('code') code: string) {
    return {
      code,
      status: 'valid',
      inviter_name: 'AppFlowy Team',
      created_at: new Date().toISOString(),
    };
  }
}
