import { ApiProperty } from '@nestjs/swagger';

export class ServerInfoResponseDto {
  @ApiProperty({
    example: ['realtime_collab', 'ai_chat', 'database_views'],
    description: 'Lista de características soportadas por el servidor',
  })
  supported_client_features: string[];

  @ApiProperty({
    example: '0.5.0',
    nullable: true,
    description: 'Versión mínima recomendada de clientes AppFlowy',
  })
  minimum_supported_client_version: string | null;

  @ApiProperty({
    example: 'http://localhost',
    description: 'URL base del frontend web de AppFlowy',
  })
  appflowy_web_url: string;
}
