import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateCollabDto {
  @ApiPropertyOptional({ example: 'c249a5b4-d50d-45db-9ff3-c5a89ceee04d' })
  @IsOptional()
  @IsString()
  object_id?: string;

  @ApiProperty({ example: 0, description: '0: Document, 1: Database, 2: DatabaseRow, 3: Folder' })
  @IsNotEmpty()
  @IsNumber()
  collab_type: number;

  @ApiPropertyOptional({ description: 'Base64 encoded collab or binary state' })
  @IsOptional()
  encoded_collab_v1?: string | any;

  @ApiPropertyOptional({ description: 'Doc state byte array or string' })
  @IsOptional()
  doc_state?: any;
}

export class UpdateCollabDto {
  @ApiProperty({ example: 0 })
  @IsNotEmpty()
  @IsNumber()
  collab_type: number;

  @ApiPropertyOptional({ description: 'Updated doc state' })
  @IsOptional()
  doc_state?: any;
}

export class CollabQueryDto {
  @ApiPropertyOptional({ example: 0, description: 'Collab type (0: Doc, 1: Database, 2: DatabaseRow, 3: Folder)' })
  @IsOptional()
  collab_type?: number;
}

export class UpdateCollabWebDto {
  @ApiProperty({ example: 0 })
  @IsNotEmpty()
  @IsNumber()
  collab_type: number;

  @ApiProperty({ description: 'Doc state byte array or base64' })
  @IsNotEmpty()
  doc_state: any;
}

export class CollabResponseDto {
  @ApiProperty({ example: 'c249a5b4-d50d-45db-9ff3-c5a89ceee04d' })
  object_id: string;

  @ApiProperty({ example: { doc_state: [], version: 1 } })
  encode_collab: {
    doc_state: number[];
    version: number;
  };
}

export class CollabJsonResponseDto {
  @ApiProperty({ example: {} })
  collab: any;
}

export class RowCollabExistsDto {
  @ApiProperty({ example: true })
  exists: boolean;
}
