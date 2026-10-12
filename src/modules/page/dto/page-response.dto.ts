import { ApiProperty } from '@nestjs/swagger';

export class CreatePageResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d' })
  view_id: string;

  @ApiProperty({ example: 'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e', nullable: true })
  database_id?: string | null;
}

export class ViewResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d' })
  id: string;

  @ApiProperty({ example: 'w1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d' })
  workspace_id: string;

  @ApiProperty({ example: 'Página de Notas' })
  name: string;

  @ApiProperty({ example: 0 })
  layout: number;

  @ApiProperty({ example: false })
  is_favorite: boolean;

  @ApiProperty({ example: '2026-10-12T17:00:00Z' })
  created_at: string;

  @ApiProperty({ type: [ViewResponseDto], required: false })
  children?: ViewResponseDto[];
}
