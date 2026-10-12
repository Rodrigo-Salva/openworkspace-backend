import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserProfileDto, UserWorkspaceResponseDto } from './dto/user-profile.dto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userUuid: string): Promise<UserProfileDto> {
    const user = await this.prisma.user.findUnique({
      where: { uuid: userUuid },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return {
      id: user.uid.toString(),
      uuid: user.uuid,
      email: user.email,
      name: user.name,
      metadata: (user.metadata as Record<string, any>) || {},
    };
  }

  async updateProfile(userUuid: string, dto: UpdateUserDto): Promise<UserProfileDto> {
    const updateData: any = {};
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.metadata !== undefined) updateData.metadata = dto.metadata;

    const user = await this.prisma.user.update({
      where: { uuid: userUuid },
      data: updateData,
    });

    return {
      id: user.uid.toString(),
      uuid: user.uuid,
      email: user.email,
      name: user.name,
      metadata: (user.metadata as Record<string, any>) || {},
    };
  }

  async getUserWorkspaces(userUuid: string): Promise<UserWorkspaceResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { uuid: userUuid },
      include: {
        memberships: {
          include: {
            workspace: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const workspaces = user.memberships
      .filter((m) => !m.workspace.deletedAt)
      .map((m) => ({
        workspace_id: m.workspace.workspaceId,
        workspace_name: m.workspace.workspaceName,
        workspace_type: m.workspace.workspaceType,
        role_id: m.roleId,
      }));

    return {
      user_id: user.uuid,
      workspaces,
    };
  }
}
