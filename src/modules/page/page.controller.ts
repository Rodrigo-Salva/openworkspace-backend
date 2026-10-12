import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
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
import { PageService } from './page.service';
import { CreatePageDto, FavoritePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { CreatePageResponseDto, ViewResponseDto } from './dto/page-response.dto';

@ApiTags('Pages & Views')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/workspace/:workspace_id')
export class PageController {
  constructor(private readonly pageService: PageService) {}

  @Post('page-view')
  @ApiOperation({ summary: 'Crear una nueva página en el workspace' })
  @ApiParam({ name: 'workspace_id', description: 'UUID del workspace' })
  @ApiResponse({ status: 201, type: CreatePageResponseDto })
  async createPage(
    @CurrentUser() user: AuthUser,
    @Param('workspace_id') workspaceId: string,
    @Body() dto: CreatePageDto,
  ): Promise<CreatePageResponseDto> {
    return this.pageService.createPage(workspaceId, dto, BigInt(user.uid));
  }

  @Get('page-view/:view_id')
  @ApiOperation({ summary: 'Consultar detalles de una página' })
  @ApiParam({ name: 'workspace_id', description: 'UUID del workspace' })
  @ApiParam({ name: 'view_id', description: 'UUID de la página' })
  @ApiResponse({ status: 200, type: ViewResponseDto })
  async getPage(
    @Param('workspace_id') workspaceId: string,
    @Param('view_id') viewId: string,
  ): Promise<ViewResponseDto> {
    return this.pageService.getPage(workspaceId, viewId);
  }

  @Patch('page-view/:view_id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Actualizar nombre o atributos de una página' })
  @ApiParam({ name: 'workspace_id', description: 'UUID del workspace' })
  @ApiParam({ name: 'view_id', description: 'UUID de la página' })
  async updatePage(
    @Param('workspace_id') workspaceId: string,
    @Param('view_id') viewId: string,
    @Body() dto: UpdatePageDto,
  ) {
    await this.pageService.updatePage(workspaceId, viewId, dto);
    return {};
  }

  @Post('page-view/:view_id/favorite')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Marcar o desmarcar una página como favorita' })
  @ApiParam({ name: 'workspace_id', description: 'UUID del workspace' })
  @ApiParam({ name: 'view_id', description: 'UUID de la página' })
  async favoritePage(
    @Param('workspace_id') workspaceId: string,
    @Param('view_id') viewId: string,
    @Body() dto: FavoritePageDto,
  ) {
    await this.pageService.favoritePage(workspaceId, viewId, dto);
    return {};
  }

  @Post('page-view/:view_id/move-to-trash')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mover una página a la papelera' })
  @ApiParam({ name: 'workspace_id', description: 'UUID del workspace' })
  @ApiParam({ name: 'view_id', description: 'UUID de la página' })
  async moveToTrash(
    @Param('workspace_id') workspaceId: string,
    @Param('view_id') viewId: string,
  ) {
    await this.pageService.moveToTrash(workspaceId, viewId);
    return {};
  }

  @Post('page-view/:view_id/restore-from-trash')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Restaurar una página desde la papelera' })
  @ApiParam({ name: 'workspace_id', description: 'UUID del workspace' })
  @ApiParam({ name: 'view_id', description: 'UUID de la página' })
  async restoreFromTrash(
    @Param('workspace_id') workspaceId: string,
    @Param('view_id') viewId: string,
  ) {
    await this.pageService.restoreFromTrash(workspaceId, viewId);
    return {};
  }

  @Get('folder')
  @ApiOperation({ summary: 'Obtener el árbol jerárquico de páginas y vistas (Folder Tree)' })
  @ApiParam({ name: 'workspace_id', description: 'UUID del workspace' })
  @ApiResponse({ status: 200, type: [ViewResponseDto] })
  async getFolder(
    @Param('workspace_id') workspaceId: string,
  ): Promise<ViewResponseDto[]> {
    return this.pageService.getFolder(workspaceId);
  }

  @Get('trash')
  @ApiOperation({ summary: 'Listar páginas en la papelera' })
  @ApiParam({ name: 'workspace_id', description: 'UUID del workspace' })
  @ApiResponse({ status: 200, type: [ViewResponseDto] })
  async getTrash(
    @Param('workspace_id') workspaceId: string,
  ): Promise<ViewResponseDto[]> {
    return this.pageService.getTrash(workspaceId);
  }

  @Get('favorite')
  @ApiOperation({ summary: 'Listar páginas marcadas como favoritas' })
  @ApiParam({ name: 'workspace_id', description: 'UUID del workspace' })
  @ApiResponse({ status: 200, type: [ViewResponseDto] })
  async getFavorites(
    @Param('workspace_id') workspaceId: string,
  ): Promise<ViewResponseDto[]> {
    return this.pageService.getFavorites(workspaceId);
  }
}
