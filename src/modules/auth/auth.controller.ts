import { Controller, Post, Get, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser, AuthUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto, GoTrueUserDto } from './dto/auth-response.dto';

@ApiTags('Auth (GoTrue)')
@Controller('gotrue')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Get('health')
  @ApiOperation({ summary: 'Health check del servicio de autenticación' })
  @ApiResponse({ status: 200, description: 'GoTrue API saludable' })
  health() {
    return {
      version: '1.0.0',
      name: 'OpenWorkspace Auth (NestJS)',
      description: 'OpenWorkspace authentication engine implemented in NestJS',
    };
  }

  @Public()
  @Post('signup')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Registro de nuevo usuario con email y contraseña' })
  @ApiResponse({ status: 200, type: AuthResponseDto })
  async signUp(@Body() dto: SignUpDto): Promise<AuthResponseDto> {
    return this.authService.signUp(dto);
  }

  @Public()
  @Post('token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Inicio de sesión (Login) con credenciales' })
  @ApiResponse({ status: 200, type: AuthResponseDto })
  async token(@Body() dto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(dto);
  }

  @Public()
  @Post('recover')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Enviar enlace de recuperación o Magic Link por correo electrónico' })
  @ApiResponse({ status: 200, description: 'Notificación enviada' })
  async recover(@Body('email') email: string) {
    return this.authService.sendRecoveryLink(email);
  }

  @Public()
  @Post('magiclink')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Solicitar inicio de sesión mediante Magic Link' })
  @ApiResponse({ status: 200, description: 'Magic link enviado' })
  async magicLink(@Body('email') email: string) {
    return this.authService.sendRecoveryLink(email);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('user')
  @ApiOperation({ summary: 'Obtener datos del usuario actualmente autenticado' })
  @ApiResponse({ status: 200, type: GoTrueUserDto })
  async getUser(@CurrentUser() user: AuthUser) {
    return this.authService.getUser(user.uuid);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cerrar sesión activa' })
  @ApiResponse({ status: 200, description: 'Sesión cerrada exitosamente' })
  async logout() {
    return {};
  }
}
