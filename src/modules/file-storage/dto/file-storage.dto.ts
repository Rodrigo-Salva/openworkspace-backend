import { ApiProperty } from '@nestjs/swagger';

export class PutFileResponseDto {
  @ApiProperty({ example: 'f1a2b3c4-d5e6-7f8a-9b0c-1d2e3f4a5b6c' })
  file_id: string;

  @ApiProperty({ example: 1048576 })
  file_size: number;
}

export class BlobMetadataDto {
  @ApiProperty({ example: 'f1a2b3c4-d5e6-7f8a-9b0c-1d2e3f4a5b6c' })
  file_id: string;

  @ApiProperty({ example: 'image/png' })
  file_type: string;

  @ApiProperty({ example: 1048576 })
  file_size: number;

  @ApiProperty({ example: 0, description: '0: Activo, 1: En papelera' })
  file_status: number;

  @ApiProperty({ example: '2026-10-12T17:00:00Z' })
  created_at: string;
}

export class WorkspaceUsageDto {
  @ApiProperty({ example: 15728640, description: 'Bytes totales consumidos por el workspace' })
  total_bytes: number;
}
