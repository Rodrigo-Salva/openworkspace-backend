import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ServerInfoResponseDto } from './dto/server-info.dto';

@Injectable()
export class SystemService {
  constructor(private readonly configService: ConfigService) {}

  getServerInfo(): ServerInfoResponseDto {
    return {
      supported_client_features: [
        'realtime_collab',
        'database_views',
        'document_publish',
        'template_center',
        'file_storage',
      ],
      minimum_supported_client_version: null,
      appflowy_web_url:
        this.configService.get<string>('APPFLOWY_WEB_URL') || 'http://localhost',
    };
  }
}
