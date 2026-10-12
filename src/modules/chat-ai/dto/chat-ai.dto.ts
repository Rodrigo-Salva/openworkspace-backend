import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateChatDto {
  @ApiPropertyOptional({ example: 'Nuevo Chat' })
  @IsOptional()
  @IsString()
  name?: string;
}

export class UpdateChatSettingsDto {
  @ApiPropertyOptional({ example: 'gpt-4o' })
  @IsOptional()
  @IsString()
  model?: string;

  @ApiPropertyOptional({ example: 0.7 })
  @IsOptional()
  @IsNumber()
  temperature?: number;
}

export class CreateChatMessageDto {
  @ApiProperty({ example: '¿Cómo funciona AppFlowy Cloud?' })
  @IsNotEmpty()
  @IsString()
  content: string;

  @ApiPropertyOptional({ example: { role: 'user', name: 'Rodrigo' } })
  @IsOptional()
  author?: any;
}

export class UpdateChatMessageDto {
  @ApiProperty({ example: 'Contenido corregido de la pregunta' })
  @IsNotEmpty()
  @IsString()
  content: string;
}

export class CompleteTextDto {
  @ApiProperty({ example: 'Continúa escribiendo sobre arquitectura de software:' })
  @IsNotEmpty()
  @IsString()
  text: string;

  @ApiPropertyOptional({ example: { prompt_id: 'continue' } })
  @IsOptional()
  metadata?: any;
}

export class SummarizeRowDto {
  @ApiProperty({ example: { title: 'Tarea 1', description: 'Revisar PR' } })
  @IsNotEmpty()
  row: any;
}

export class TranslateRowDto {
  @ApiProperty({ example: 'Hola mundo' })
  @IsNotEmpty()
  @IsString()
  text: string;

  @ApiProperty({ example: 'en' })
  @IsNotEmpty()
  @IsString()
  target_lang: string;
}
