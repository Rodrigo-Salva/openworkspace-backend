import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../infrastructure/database/database.module';
import { AiController } from './ai.controller';
import { ChatAiService } from './chat-ai.service';
import { ChatController } from './chat.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [ChatController, AiController],
  providers: [ChatAiService],
  exports: [ChatAiService],
})
export class ChatAiModule {}
