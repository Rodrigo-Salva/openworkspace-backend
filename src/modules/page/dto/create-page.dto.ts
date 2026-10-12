import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsNumber } from 'class-validator';

export class CreatePageDto {
  @ApiPropertyOptional({ example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d' })
  @IsOptional()
  @IsString()
  parent_view_id?: string;

  @ApiProperty({ example: 0, description: '0: Document, 1: Grid, 2: Board/Kanban, 3: Calendar' })
  @IsNumber()
  layout: number;

  @ApiProperty({ example: 'Página Sin Título' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d' })
  @IsOptional()
  @IsString()
  view_id?: string;

  @ApiPropertyOptional({ example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d' })
  @IsOptional()
  @IsString()
  collab_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  page_data?: any;

  @ApiPropertyOptional()
  @IsOptional()
  prev_view_id?: string;
}

export class FavoritePageDto {
  @ApiProperty({ example: true })
  is_favorite: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  is_pinned?: boolean;
}
