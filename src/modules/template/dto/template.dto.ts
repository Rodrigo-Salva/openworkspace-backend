import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateTemplateCategoryDto {
  @ApiProperty({ example: 'Productivity' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Templates to organize your tasks and projects' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'icon-rocket' })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional({ example: '#ffffff' })
  @IsOptional()
  @IsString()
  bg_color?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  category_type?: number;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsNumber()
  priority?: number;
}

export class UpdateTemplateCategoryDto extends CreateTemplateCategoryDto {}

export class GetTemplateCategoriesQueryDto {
  @ApiPropertyOptional({ example: 'Productivity' })
  @IsOptional()
  @IsString()
  name_contains?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  category_type?: number;
}

export class CreateTemplateCreatorDto {
  @ApiProperty({ example: 'OpenWorkspace Team' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'https://example.com/avatar.png' })
  @IsOptional()
  @IsString()
  avatar_url?: string;

  @ApiPropertyOptional({ example: ['https://twitter.com/appflowy'] })
  @IsOptional()
  @IsArray()
  account_links?: string[];
}

export class UpdateTemplateCreatorDto extends CreateTemplateCreatorDto {}

export class GetTemplateCreatorsQueryDto {
  @ApiPropertyOptional({ example: 'Team' })
  @IsOptional()
  @IsString()
  name_contains?: string;
}

export class CreateTemplateDto {
  @ApiProperty({ example: 'c249a5b4-d50d-45db-9ff3-c5a89ceee04d' })
  @IsNotEmpty()
  @IsUUID()
  view_id: string;

  @ApiProperty({ example: 'Sprint Board' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'Manage sprints efficiently' })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({ example: 'Detailed template documentation' })
  @IsNotEmpty()
  @IsString()
  about: string;

  @ApiProperty({ example: 'https://appflowy.com/template/1' })
  @IsNotEmpty()
  @IsString()
  view_url: string;

  @ApiProperty({ example: 'c1a2b3c4-d5e6-7f8a-9b0c-1d2e3f4a5b6c' })
  @IsNotEmpty()
  @IsUUID()
  creator_id: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  is_new_template?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  is_featured?: boolean;

  @ApiPropertyOptional({ example: ['c1a2b3c4-d5e6-7f8a-9b0c-1d2e3f4a5b6c'] })
  @IsOptional()
  @IsArray()
  category_ids?: string[];

  @ApiPropertyOptional({ example: [] })
  @IsOptional()
  @IsArray()
  related_view_ids?: string[];
}

export class UpdateTemplateDto {
  @ApiPropertyOptional({ example: 'Sprint Board' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'Manage sprints efficiently' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'Detailed template documentation' })
  @IsOptional()
  @IsString()
  about?: string;

  @ApiPropertyOptional({ example: 'https://appflowy.com/template/1' })
  @IsOptional()
  @IsString()
  view_url?: string;

  @ApiPropertyOptional({ example: 'c1a2b3c4-d5e6-7f8a-9b0c-1d2e3f4a5b6c' })
  @IsOptional()
  @IsUUID()
  creator_id?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  is_new_template?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  is_featured?: boolean;

  @ApiPropertyOptional({ example: ['c1a2b3c4-d5e6-7f8a-9b0c-1d2e3f4a5b6c'] })
  @IsOptional()
  @IsArray()
  category_ids?: string[];

  @ApiPropertyOptional({ example: [] })
  @IsOptional()
  @IsArray()
  related_view_ids?: string[];
}

export class GetTemplatesQueryDto {
  @ApiPropertyOptional({ example: 'c1a2b3c4-d5e6-7f8a-9b0c-1d2e3f4a5b6c' })
  @IsOptional()
  @IsUUID()
  category_id?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  is_featured?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  is_new_template?: boolean;

  @ApiPropertyOptional({ example: 'Sprint' })
  @IsOptional()
  @IsString()
  name_contains?: string;
}

export class TemplateHomePageQueryDto {
  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  per_count?: number;
}
