import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { CreatePageDto, FavoritePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { CreatePageResponseDto, ViewResponseDto } from './dto/page-response.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PageService {
  constructor(private readonly prisma: PrismaService) {}

  async createPage(
    workspaceId: string,
    dto: CreatePageDto,
    ownerUid: bigint,
  ): Promise<CreatePageResponseDto> {
    const viewId = dto.view_id || uuidv4();
    const databaseId = dto.layout !== 0 ? uuidv4() : null;

    // 1. Crear registro de vista en base de datos
    await this.prisma.view.create({
      data: {
        viewId,
        workspaceId,
        parentViewId: dto.parent_view_id || null,
        name: dto.name || 'Untitled',
        layout: dto.layout,
      },
    });

    // 2. Inicializar el Collab del documento (partition_key 0: Documento)
    const initialBinary = Buffer.from([0, 0]); // Vector Yjs vacío inicial
    await this.prisma.collab.create({
      data: {
        oid: viewId,
        partitionKey: 0,
        blob: initialBinary as any,
        ownerUid,
        workspaceId,
      },
    });

    return {
      view_id: viewId,
      database_id: databaseId,
    };
  }

  async getPage(workspaceId: string, viewId: string): Promise<ViewResponseDto> {
    const view = await this.prisma.view.findFirst({
      where: { viewId, workspaceId, deletedAt: null },
    });

    if (!view) {
      throw new NotFoundException('Página no encontrada');
    }

    return this.mapViewToDto(view);
  }

  async updatePage(
    workspaceId: string,
    viewId: string,
    dto: UpdatePageDto,
  ): Promise<void> {
    const updateData: any = {};
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.layout !== undefined) updateData.layout = dto.layout;
    if (dto.icon !== undefined) updateData.icon = dto.icon;
    if (dto.extra !== undefined) updateData.extra = dto.extra;

    await this.prisma.view.updateMany({
      where: { viewId, workspaceId },
      data: updateData,
    });
  }

  async favoritePage(
    workspaceId: string,
    viewId: string,
    dto: FavoritePageDto,
  ): Promise<void> {
    await this.prisma.view.updateMany({
      where: { viewId, workspaceId },
      data: {
        isFavorite: dto.is_favorite,
        isPinned: dto.is_pinned ?? true,
      },
    });
  }

  async moveToTrash(workspaceId: string, viewId: string): Promise<void> {
    await this.prisma.view.updateMany({
      where: { viewId, workspaceId },
      data: { deletedAt: new Date() },
    });
  }

  async restoreFromTrash(workspaceId: string, viewId: string): Promise<void> {
    await this.prisma.view.updateMany({
      where: { viewId, workspaceId },
      data: { deletedAt: null },
    });
  }

  async getFolder(workspaceId: string): Promise<ViewResponseDto[]> {
    const views = await this.prisma.view.findMany({
      where: { workspaceId, deletedAt: null },
      orderBy: { order: 'asc' },
    });

    // Construir árbol jerárquico
    const viewMap = new Map<string, ViewResponseDto>();
    const rootViews: ViewResponseDto[] = [];

    views.forEach((v) => {
      viewMap.set(v.viewId, { ...this.mapViewToDto(v), children: [] });
    });

    views.forEach((v) => {
      const node = viewMap.get(v.viewId);
      if (v.parentViewId && viewMap.has(v.parentViewId)) {
        viewMap.get(v.parentViewId).children.push(node);
      } else {
        rootViews.push(node);
      }
    });

    return rootViews;
  }

  async getTrash(workspaceId: string): Promise<ViewResponseDto[]> {
    const views = await this.prisma.view.findMany({
      where: { workspaceId, deletedAt: { not: null } },
      orderBy: { updatedAt: 'desc' },
    });

    return views.map((v) => this.mapViewToDto(v));
  }

  async getFavorites(workspaceId: string): Promise<ViewResponseDto[]> {
    const views = await this.prisma.view.findMany({
      where: { workspaceId, isFavorite: true, deletedAt: null },
      orderBy: { updatedAt: 'desc' },
    });

    return views.map((v) => this.mapViewToDto(v));
  }

  private mapViewToDto(view: any): ViewResponseDto {
    return {
      id: view.viewId,
      workspace_id: view.workspaceId,
      name: view.name,
      layout: view.layout,
      is_favorite: view.isFavorite,
      created_at: view.createdAt.toISOString(),
    };
  }
}
