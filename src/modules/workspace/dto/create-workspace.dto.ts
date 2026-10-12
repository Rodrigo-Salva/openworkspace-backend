import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateWorkspaceDto {
  @ApiPropertyOptional({ example: 'Nuevo Espacio de Trabajo' })
  @IsOptional()
  @IsString()
  workspace_name?: string;
}
