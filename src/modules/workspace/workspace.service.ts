import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import {
  WorkspaceResponseDto,
  WorkspaceMemberItemDto,
} from './dto/workspace-response.dto';

@Injectable()
export class WorkspaceService {
  constructor(private readonly prisma: PrismaService) {}

  async listWorkspaces(userUuid: string): Promise<WorkspaceResponseDto[]> {
    const user = await this.prisma.user.findUnique({
      where: { uuid: userUuid },
    });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const members = await this.prisma.workspaceMember.findMany({
      where: { uid: user.uid },
      include: { workspace: true },
    });

    return members
      .filter((m) => !m.workspace.deletedAt)
      .map((m) => ({
        workspace_id: m.workspace.workspaceId,
        database_storage_id: m.workspace.databaseStorageId,
        owner_uid: m.workspace.ownerUid.toString(),
        workspace_name: m.workspace.workspaceName,
        workspace_type: m.workspace.workspaceType,
        created_at: m.workspace.createdAt.toISOString(),
      }));
  }

  async createWorkspace(
    userUuid: string,
    dto: CreateWorkspaceDto,
  ): Promise<WorkspaceResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { uuid: userUuid },
    });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const name = dto.workspace_name || 'My Workspace';

    const workspace = await this.prisma.workspace.create({
      data: {
        ownerUid: user.uid,
        workspaceName: name,
        workspaceType: 0,
      },
    });

    // El trigger af_workspace_after_insert de Postgres asocia automáticamente al owner en af_workspace_member

    return {
      workspace_id: workspace.workspaceId,
      database_storage_id: workspace.databaseStorageId,
      owner_uid: workspace.ownerUid.toString(),
      workspace_name: workspace.workspaceName,
      workspace_type: workspace.workspaceType,
      created_at: workspace.createdAt.toISOString(),
    };
  }

  async getMembers(
    userUuid: string,
    workspaceId: string,
  ): Promise<WorkspaceMemberItemDto[]> {
    const members = await this.prisma.workspaceMember.findMany({
      where: { workspaceId },
      include: { user: true },
    });

    return members.map((m) => ({
      uid: m.user.uid.toString(),
      uuid: m.user.uuid,
      email: m.user.email,
      name: m.user.name,
      role: m.roleId,
    }));
  }

  async deleteWorkspace(userUuid: string, workspaceId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { uuid: userUuid },
    });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const membership = await this.prisma.workspaceMember.findUnique({
      where: {
        uid_workspaceId: {
          uid: user.uid,
          workspaceId,
        },
      },
    });

    if (!membership || membership.roleId !== 1) {
      throw new ForbiddenException('Solo el propietario puede eliminar el workspace');
    }

    await this.prisma.workspace.update({
      where: { workspaceId },
      data: { deletedAt: new Date() },
    });
  }
}
