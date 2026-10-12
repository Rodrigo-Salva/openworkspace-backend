import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser, AuthUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserProfileDto, UserWorkspaceResponseDto } from './dto/user-profile.dto';

@ApiTags('User')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Public()
  @Get('verify/:access_token')
  @ApiOperation({ summary: 'Verificar validez de token de acceso' })
  @ApiResponse({ status: 200, example: { is_new: false } })
  async verifyToken(@Param('access_token') token: string) {
    return { is_new: false };
  }

  @Get('profile')
  @ApiOperation({ summary: 'Consultar perfil del usuario autenticado' })
  @ApiResponse({ status: 200, type: UserProfileDto })
  async getProfile(@CurrentUser() user: AuthUser): Promise<UserProfileDto> {
    return this.userService.getProfile(user.uuid);
  }

  @Post('update')
  @ApiOperation({ summary: 'Actualizar nombre o metadatos del usuario' })
  @ApiResponse({ status: 200, type: UserProfileDto })
  async updateProfile(
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdateUserDto,
  ): Promise<UserProfileDto> {
    return this.userService.updateProfile(user.uuid, dto);
  }

  @Get('workspace')
  @ApiOperation({ summary: 'Listar todos los workspaces a los que pertenece el usuario' })
  @ApiResponse({ status: 200, type: UserWorkspaceResponseDto })
  async getUserWorkspaces(
    @CurrentUser() user: AuthUser,
  ): Promise<UserWorkspaceResponseDto> {
    return this.userService.getUserWorkspaces(user.uuid);
  }
}
