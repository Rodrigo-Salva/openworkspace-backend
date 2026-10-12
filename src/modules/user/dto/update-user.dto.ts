import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'Rodrigo Updated' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: { avatar_url: 'https://ejemplo.com/avatar.png' } })
  @IsOptional()
  metadata?: Record<string, any>;
}
