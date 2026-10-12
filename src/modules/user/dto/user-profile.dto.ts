import { ApiProperty } from '@nestjs/swagger';

export class UserProfileDto {
  @ApiProperty({ example: '1' })
  id: string;

  @ApiProperty({ example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d' })
  uuid: string;

  @ApiProperty({ example: 'usuario@ejemplo.com' })
  email: string;

  @ApiProperty({ example: 'Rodrigo' })
  name: string;

  @ApiProperty({ example: {} })
  metadata: Record<string, any>;
}

export class UserWorkspaceItemDto {
  @ApiProperty({ example: 'w1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d' })
  workspace_id: string;

  @ApiProperty({ example: "Rodrigo's Workspace" })
  workspace_name: string;

  @ApiProperty({ example: 0 })
  workspace_type: number;

  @ApiProperty({ example: 1, description: '1: Owner, 2: Admin, 3: Member, 4: Guest' })
  role_id: number;
}

export class UserWorkspaceResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d' })
  user_id: string;

  @ApiProperty({ type: [UserWorkspaceItemDto] })
  workspaces: UserWorkspaceItemDto[];
}
