import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Res,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { ChatAiService } from './chat-ai.service';
import {
  CreateChatDto,
  CreateChatMessageDto,
  UpdateChatMessageDto,
  UpdateChatSettingsDto,
} from './dto/chat-ai.dto';

@ApiTags('Chat')
@ApiBearerAuth()
@Controller('api/chat/:workspace_id')
export class ChatController {
  constructor(private readonly chatAiService: ChatAiService) {}

  @ApiOperation({ summary: 'Create new chat session' })
  @Post()
  async createChat(
    @Param('workspace_id') workspaceId: string,
    @Body() dto: CreateChatDto,
  ) {
    return this.chatAiService.createChat(workspaceId, dto);
  }

  @ApiOperation({ summary: 'Delete chat session' })
  @Delete(':chat_id')
  async deleteChat(
    @Param('workspace_id') workspaceId: string,
    @Param('chat_id') chatId: string,
  ) {
    return this.chatAiService.deleteChat(workspaceId, chatId);
  }

  @ApiOperation({ summary: 'Get chat details and message history' })
  @Get(':chat_id')
  async getChat(
    @Param('workspace_id') workspaceId: string,
    @Param('chat_id') chatId: string,
  ) {
    return this.chatAiService.getChat(workspaceId, chatId);
  }

  @ApiOperation({ summary: 'Get chat settings' })
  @Get(':chat_id/settings')
  async getChatSettings(@Param('chat_id') chatId: string) {
    return this.chatAiService.getChatSettings(chatId);
  }

  @ApiOperation({ summary: 'Update chat settings' })
  @Post(':chat_id/settings')
  async updateChatSettings(
    @Param('chat_id') chatId: string,
    @Body() dto: UpdateChatSettingsDto,
  ) {
    return this.chatAiService.updateChatSettings(chatId, dto);
  }

  @ApiOperation({ summary: 'Get messages for chat' })
  @Get(':chat_id/message')
  async getMessages(
    @Param('workspace_id') workspaceId: string,
    @Param('chat_id') chatId: string,
  ) {
    return this.chatAiService.getChatMessages(workspaceId, chatId);
  }

  @ApiOperation({ summary: 'Update message content' })
  @Put(':chat_id/message')
  async updateMessage(
    @Param('chat_id') chatId: string,
    @Body() dto: UpdateChatMessageDto & { message_id: string },
  ) {
    return this.chatAiService.updateMessage(chatId, dto.message_id, dto.content);
  }

  @ApiOperation({ summary: 'Post user question message' })
  @Post(':chat_id/message/question')
  async createQuestion(
    @Param('workspace_id') workspaceId: string,
    @Param('chat_id') chatId: string,
    @Body() dto: CreateChatMessageDto,
  ) {
    return this.chatAiService.createQuestion(workspaceId, chatId, dto);
  }

  @ApiOperation({ summary: 'Post assistant answer message' })
  @Post(':chat_id/message/answer')
  async createAnswer(
    @Param('workspace_id') workspaceId: string,
    @Param('chat_id') chatId: string,
    @Body() dto: CreateChatMessageDto,
  ) {
    return this.chatAiService.createAnswer(workspaceId, chatId, dto);
  }

  @ApiOperation({ summary: 'Get AI answer for message' })
  @Get(':chat_id/:message_id/answer')
  async getAnswer(
    @Param('chat_id') chatId: string,
    @Param('message_id') messageId: string,
  ) {
    return {
      chat_id: chatId,
      message_id: messageId,
      answer: 'Esta es una respuesta generada por AppFlowy Cloud AI.',
    };
  }

  @ApiOperation({ summary: 'Stream AI answer response (SSE)' })
  @Post(':chat_id/answer/stream')
  async streamAnswer(
    @Param('workspace_id') workspaceId: string,
    @Param('chat_id') chatId: string,
    @Body() dto: CreateChatMessageDto,
    @Res() res: Response,
  ) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const chunks = [
      'Hola! ',
      'Soy el asistente ',
      'de AppFlowy Cloud. ',
      'Tu espacio está listo para colaborar.',
    ];

    for (const chunk of chunks) {
      res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
    res.write('data: [DONE]\n\n');
    res.end();
  }

  @ApiOperation({ summary: 'Get related follow-up questions' })
  @Get(':chat_id/:message_id/related_question')
  async getRelatedQuestions(
    @Param('chat_id') chatId: string,
    @Param('message_id') messageId: string,
  ) {
    return this.chatAiService.getRelatedQuestions(chatId, messageId);
  }
}
