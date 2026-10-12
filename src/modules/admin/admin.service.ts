import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import {
  AdminCreateSSOProviderDto,
  AdminCreateUserDto,
  AdminUpdateUserDto,
} from './dto/admin.dto';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats() {
    const [totalUsers, totalWorkspaces, totalViews, totalCollabs, totalBlobs] =
      await Promise.all([
        this.prisma.user.count({ where: { deletedAt: null } }),
        this.prisma.workspace.count({ where: { deletedAt: null } }),
        this.prisma.view.count({ where: { deletedAt: null } }),
        this.prisma.collab.count({ where: { deletedAt: null } }),
        this.prisma.blobMetadata.aggregate({
          _sum: { fileSize: true },
          _count: true,
        }),
      ]);

    return {
      total_users: totalUsers,
      total_workspaces: totalWorkspaces,
      total_views: totalViews,
      total_collabs: totalCollabs,
      total_storage_bytes: (totalBlobs._sum.fileSize || 0).toString(),
      total_files: totalBlobs._count,
    };
  }

  async listUsers() {
    const users = await this.prisma.user.findMany({
      where: { deletedAt: null },
      include: {
        memberships: {
          include: { workspace: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return users.map((u) => ({
      uid: u.uid.toString(),
      id: u.uuid,
      email: u.email,
      name: u.name,
      created_at: u.createdAt.toISOString(),
      workspaces_count: u.memberships.length,
      workspaces: u.memberships.map((m) => ({
        workspace_id: m.workspace.workspaceId,
        name: m.workspace.workspaceName,
        role_id: m.roleId,
      })),
    }));
  }

  async getUser(userId: string) {
    const isEmail = userId.includes('@');
    const whereCondition = isEmail
      ? { email: userId.toLowerCase(), deletedAt: null }
      : { uuid: userId, deletedAt: null };

    const user = await this.prisma.user.findFirst({
      where: whereCondition,
      include: {
        memberships: {
          include: { workspace: true },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return {
      uid: user.uid.toString(),
      id: user.uuid,
      email: user.email,
      name: user.name,
      metadata: user.metadata,
      created_at: user.createdAt.toISOString(),
      workspaces: user.memberships.map((m) => ({
        workspace_id: m.workspace.workspaceId,
        name: m.workspace.workspaceName,
        role_id: m.roleId,
      })),
    };
  }

  async createUser(dto: AdminCreateUserDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (existing) {
      throw new ConflictException('Ya existe un usuario con este correo electrónico');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const userUuid = crypto.randomUUID();
    const userUid =
      BigInt(Date.now()) * 1000n + BigInt(Math.floor(Math.random() * 1000));
    const name = dto.name || dto.email.split('@')[0];

    // 1. Insertar en auth.users
    await this.prisma.$executeRaw`
      INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data)
      VALUES (${userUuid}::uuid, ${dto.email.toLowerCase()}, ${hashedPassword}, now(), ${JSON.stringify({ name })}::jsonb)
      ON CONFLICT (id) DO NOTHING
    `;

    // 2. Insertar en af_user
    const user = await this.prisma.user.create({
      data: {
        uid: userUid,
        uuid: userUuid,
        email: dto.email.toLowerCase(),
        password: hashedPassword,
        name,
        metadata: { name },
      },
    });

    // 3. Crear workspace inicial por defecto
    await this.prisma.workspace.create({
      data: {
        ownerUid: user.uid,
        workspaceName: `${name}'s Workspace`,
        workspaceType: 0,
      },
    });

    return {
      uid: user.uid.toString(),
      id: user.uuid,
      email: user.email,
      name: user.name,
      created_at: user.createdAt.toISOString(),
    };
  }

  async updateUser(userId: string, dto: AdminUpdateUserDto) {
    const user = await this.getUser(userId);

    const updateData: any = {};
    if (dto.name) updateData.name = dto.name;
    if (dto.email) updateData.email = dto.email.toLowerCase();
    if (dto.password) {
      updateData.password = await bcrypt.hash(dto.password, 10);
    }

    const updated = await this.prisma.user.update({
      where: { uuid: user.id },
      data: updateData,
    });

    return {
      id: updated.uuid,
      email: updated.email,
      name: updated.name,
    };
  }

  async deleteUser(userId: string) {
    const user = await this.getUser(userId);

    await this.prisma.user.update({
      where: { uuid: user.id },
      data: { deletedAt: new Date() },
    });

    return {
      message: 'Usuario eliminado correctamente',
      id: user.id,
    };
  }

  async listWorkspaces() {
    const workspaces = await this.prisma.workspace.findMany({
      where: { deletedAt: null },
      include: {
        owner: { select: { uid: true, uuid: true, email: true, name: true } },
        members: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return workspaces.map((w) => ({
      workspace_id: w.workspaceId,
      name: w.workspaceName,
      type: w.workspaceType,
      created_at: w.createdAt.toISOString(),
      owner: {
        uid: w.owner.uid.toString(),
        email: w.owner.email,
        name: w.owner.name,
      },
      total_members: w.members.length,
    }));
  }

  async generateMagicLink(email: string) {
    const user = await this.getUser(email);
    const code = crypto.randomBytes(24).toString('hex');
    const magicLinkUrl = `http://localhost:3000/login-callback?token=${code}&user_id=${user.id}`;

    return {
      email: user.email,
      token: code,
      magic_link_url: magicLinkUrl,
    };
  }

  async listSsoProviders() {
    return {
      providers: [],
    };
  }

  async createSsoProvider(dto: AdminCreateSSOProviderDto) {
    return {
      provider_id: crypto.randomUUID(),
      type: dto.type,
      metadata_url: dto.metadata_url,
      created_at: new Date().toISOString(),
    };
  }

  async deleteSsoProvider(providerId: string) {
    return {
      provider_id: providerId,
      status: 'deleted',
    };
  }
}
