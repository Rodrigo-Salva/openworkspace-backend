import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { MailerService } from '../mailer/mailer.service';
import { SignUpDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly mailerService: MailerService,
  ) {}

  async sendRecoveryLink(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (user) {
      const token = this.jwtService.sign(
        { sub: user.uuid, email: user.email, type: 'recovery' },
        { expiresIn: '1h' },
      );
      const link = `http://localhost:8000/auth/callback?token=${token}&type=recovery`;
      await this.mailerService.sendMagicLink(user.email, link);
    }

    return { message: 'If this email is registered, a magic login link was sent.' };
  }

  async signUp(dto: SignUpDto): Promise<AuthResponseDto> {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (existing) {
      throw new ConflictException('Ya existe un usuario con este correo electrónico');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const name = dto.data?.name || dto.email.split('@')[0];
    const userUuid = crypto.randomUUID();
    const userUid = BigInt(Date.now()) * 1000n + BigInt(Math.floor(Math.random() * 1000));

    // 1. Insertar en auth.users (esquema GoTrue)
    await this.prisma.$executeRaw`
      INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data)
      VALUES (${userUuid}::uuid, ${dto.email.toLowerCase()}, ${hashedPassword}, now(), ${JSON.stringify(dto.data || {})}::jsonb)
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
        metadata: dto.data || {},
      },
    });

    // Crear su workspace por defecto ('My Workspace')
    const workspace = await this.prisma.workspace.create({
      data: {
        ownerUid: user.uid,
        workspaceName: `${name}'s Workspace`,
        workspaceType: 0,
      },
    });

    // El trigger af_workspace_after_insert de Postgres asocia automáticamente al owner en af_workspace_member
    return this.generateAuthResponse(user);
  }

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const passwordMatches = await bcrypt.compare(dto.password, user.password);
    if (!passwordMatches) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    return this.generateAuthResponse(user);
  }

  async getUser(uuid: string) {
    const user = await this.prisma.user.findUnique({
      where: { uuid },
      select: {
        uuid: true,
        email: true,
        name: true,
        metadata: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return {
      id: user.uuid,
      email: user.email,
      user_metadata: {
        name: user.name,
        ...(user.metadata as Record<string, any> || {}),
      },
      aud: 'authenticated',
      created_at: user.createdAt.toISOString(),
    };
  }

  private generateAuthResponse(user: {
    uid: bigint;
    uuid: string;
    email: string;
    name: string;
    metadata: any;
    createdAt: Date;
  }): AuthResponseDto {
    const payload = {
      sub: user.uuid,
      email: user.email,
      role: 'authenticated',
      app_metadata: { provider: 'email' },
      user_metadata: { name: user.name, ...(user.metadata || {}) },
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '30d' });

    return {
      access_token: accessToken,
      token_type: 'bearer',
      expires_in: 604800, // 7 días
      refresh_token: refreshToken,
      user: {
        id: user.uuid,
        email: user.email,
        user_metadata: { name: user.name, ...(user.metadata || {}) },
        aud: 'authenticated',
        created_at: user.createdAt.toISOString(),
      },
    };
  }
}
