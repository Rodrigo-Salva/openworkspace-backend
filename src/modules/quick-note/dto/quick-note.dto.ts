import { ApiProperty } from '@nestjs/swagger';

export class QuickNoteDto {
  @ApiProperty({ example: 'n1a2b3c4-d5e6-7f8a-9b0c-1d2e3f4a5b6c' })
  id: string;

  @ApiProperty({ example: 'w1a2b3c4-d5e6-7f8a-9b0c-1d2e3f4a5b6c' })
  workspace_id: string;

  @ApiProperty({ example: '2026-10-12T17:00:00Z' })
  created_at: string;

  @ApiProperty({ example: '2026-10-12T17:00:00Z' })
  updated_at: string;

  @ApiProperty({
    example: [{ type: 'paragraph', delta: [{ insert: 'Mi nota rápida' }] }],
    description: 'Contenido Quill/Delta en formato JSON',
  })
  data: any;
}

export class QuickNoteListResponseDto {
  @ApiProperty({ type: [QuickNoteDto] })
  data: QuickNoteDto[];

  @ApiProperty({ example: false })
  has_more: boolean;
}
