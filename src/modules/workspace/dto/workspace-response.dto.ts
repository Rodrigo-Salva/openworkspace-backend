import { ApiProperty } from '@nestjs/swagger';

export class WorkspaceResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d' })
  workspace_id: string;

  @ApiProperty({ example: 'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e' })
  database_storage_id: string;

  @ApiProperty({ example: '1' })
  owner_uid: string;

  @ApiProperty({ example: 'Mi Espacio de Trabajo' })
  workspace_name: string;

  @ApiProperty({ example: 0 })
  workspace_type: number;

  @ApiProperty({ example: '2026-10-12T17:00:00Z' })
  created_at: string;
}

export class WorkspaceMemberItemDto {
  @ApiProperty({ example: '1' })
  uid: string;

  @ApiProperty({ example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d' })
  uuid: string;

  @ApiProperty({ example: 'usuario@ejemplo.com' })
  email: string;

  @ApiProperty({ example: 'Rodrigo' })
  name: string;

  @ApiProperty({ example: 1, description: '1: Owner, 2: Admin, 3: Member, 4: Guest' })
  role: number;
}
