import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import {
  AdminCreateSSOProviderDto,
  AdminCreateUserDto,
  AdminUpdateUserDto,
} from './dto/admin.dto';

@ApiTags('Admin Console')
@ApiBearerAuth()
@Controller('api/admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @ApiOperation({ summary: 'Estadísticas globales del servidor (usuarios, workspaces, almacenamiento)' })
  @Get('stats')
  async getStats() {
    return this.adminService.getStats();
  }

  @ApiOperation({ summary: 'Listar todos los usuarios del sistema' })
  @Get('users')
  async listUsers() {
    return this.adminService.listUsers();
  }

  @ApiOperation({ summary: 'Obtener detalle de un usuario' })
  @Get('users/:user_id')
  async getUser(@Param('user_id') userId: string) {
    return this.adminService.getUser(userId);
  }

  @ApiOperation({ summary: 'Crear usuario desde el panel de administración' })
  @Post('users')
  async createUser(@Body() dto: AdminCreateUserDto) {
    return this.adminService.createUser(dto);
  }

  @ApiOperation({ summary: 'Actualizar datos de un usuario' })
  @Put('users/:user_id')
  async updateUser(
    @Param('user_id') userId: string,
    @Body() dto: AdminUpdateUserDto,
  ) {
    return this.adminService.updateUser(userId, dto);
  }

  @ApiOperation({ summary: 'Eliminar usuario' })
  @Delete('users/:user_id')
  async deleteUser(@Param('user_id') userId: string) {
    return this.adminService.deleteUser(userId);
  }

  @ApiOperation({ summary: 'Listar todos los workspaces globales' })
  @Get('workspaces')
  async listWorkspaces() {
    return this.adminService.listWorkspaces();
  }

  @ApiOperation({ summary: 'Generar enlace mágico (Magic Link) de inicio de sesión' })
  @Post('users/:email/generate-link')
  async generateMagicLink(@Param('email') email: string) {
    return this.adminService.generateMagicLink(email);
  }

  @ApiOperation({ summary: 'Listar proveedores SSO' })
  @Get('sso')
  async listSsoProviders() {
    return this.adminService.listSsoProviders();
  }

  @ApiOperation({ summary: 'Configurar nuevo proveedor SSO (SAML/OAuth2)' })
  @Post('sso')
  async createSsoProvider(@Body() dto: AdminCreateSSOProviderDto) {
    return this.adminService.createSsoProvider(dto);
  }

  @ApiOperation({ summary: 'Eliminar proveedor SSO' })
  @Delete('sso/:provider_id')
  async deleteSsoProvider(@Param('provider_id') providerId: string) {
    return this.adminService.deleteSsoProvider(providerId);
  }
}
