import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../infrastructure/database/database.module';
import { CollabController } from './collab.controller';
import { CollabGateway } from './collab.gateway';
import { CollabService } from './collab.service';

@Module({
  imports: [DatabaseModule],
  controllers: [CollabController],
  providers: [CollabService, CollabGateway],
  exports: [CollabService, CollabGateway],
})
export class CollabModule {}
