import { ApiProperty } from '@nestjs/swagger';

export class GoTrueUserDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d' })
  id: string;

  @ApiProperty({ example: 'usuario@ejemplo.com' })
  email: string;

  @ApiProperty({ example: { name: 'Rodrigo' } })
  user_metadata: Record<string, any>;

  @ApiProperty({ example: 'authenticated' })
  aud: string;

  @ApiProperty({ example: '2026-10-12T17:00:00Z' })
  created_at: string;
}

export class AuthResponseDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  access_token: string;

  @ApiProperty({ example: 'bearer' })
  token_type: string;

  @ApiProperty({ example: 604800 })
  expires_in: number;

  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  refresh_token: string;

  @ApiProperty({ type: GoTrueUserDto })
  user: GoTrueUserDto;
}
