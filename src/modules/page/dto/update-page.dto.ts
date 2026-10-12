import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber } from 'class-validator';

export class UpdatePageDto {
  @ApiPropertyOptional({ example: 'Nuevo Nombre de la Página' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsNumber()
  layout?: number;

  @ApiPropertyOptional()
  @IsOptional()
  icon?: any;

  @ApiPropertyOptional()
  @IsOptional()
  extra?: any;
}
