import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { CurrentUser, AuthUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { WorkspaceService } from './workspace.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import {
  WorkspaceResponseDto,
  WorkspaceMemberItemDto,
} from './dto/workspace-response.dto';

@ApiTags('Workspaces')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/workspace')
export class WorkspaceController {
  constructor(private readonly workspaceService: WorkspaceService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos los workspaces del usuario autenticado' })
  @ApiResponse({ status: 200, type: [WorkspaceResponseDto] })
  async listWorkspaces(
    @CurrentUser() user: AuthUser,
  ): Promise<WorkspaceResponseDto[]> {
    return this.workspaceService.listWorkspaces(user.uuid);
  }

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo workspace' })
  @ApiResponse({ status: 201, type: WorkspaceResponseDto })
  async createWorkspace(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateWorkspaceDto,
  ): Promise<WorkspaceResponseDto> {
    return this.workspaceService.createWorkspace(user.uuid, dto);
  }

  @Get(':workspace_id/member')
  @ApiOperation({ summary: 'Listar miembros de un workspace' })
  @ApiParam({ name: 'workspace_id', description: 'UUID del workspace' })
  @ApiResponse({ status: 200, type: [WorkspaceMemberItemDto] })
  async getMembers(
    @CurrentUser() user: AuthUser,
    @Param('workspace_id') workspaceId: string,
  ): Promise<WorkspaceMemberItemDto[]> {
    return this.workspaceService.getMembers(user.uuid, workspaceId);
  }

  @Delete(':workspace_id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar un workspace (marcar como borrado)' })
  @ApiParam({ name: 'workspace_id', description: 'UUID del workspace' })
  @ApiResponse({ status: 200, description: 'Workspace eliminado exitosamente' })
  async deleteWorkspace(
    @CurrentUser() user: AuthUser,
    @Param('workspace_id') workspaceId: string,
  ) {
    await this.workspaceService.deleteWorkspace(user.uuid, workspaceId);
    return {};
  }
}
