import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import {
  CompleteTextDto,
  CreateChatDto,
  CreateChatMessageDto,
  SummarizeRowDto,
  TranslateRowDto,
  UpdateChatSettingsDto,
} from './dto/chat-ai.dto';

@Injectable()
export class ChatAiService {
  constructor(private readonly prisma: PrismaService) {}

  // ================= CHAT =================
  async createChat(workspaceId: string, dto: CreateChatDto) {
    const chat = await this.prisma.chat.create({
      data: {
        workspaceId,
        name: dto.name || 'Chat',
      },
    });
    return { chat_id: chat.chatId, ...chat };
  }

  async deleteChat(workspaceId: string, chatId: string) {
    await this.prisma.chat.updateMany({
      where: { chatId, workspaceId },
      data: { deletedAt: new Date() },
    });
    return {};
  }

  async getChat(workspaceId: string, chatId: string) {
    const chat = await this.prisma.chat.findFirst({
      where: { chatId, workspaceId, deletedAt: null },
      include: {
        messages: {
          where: { deletedAt: null },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
    if (!chat) {
      throw new NotFoundException('Chat not found');
    }
    return {
      chat_id: chat.chatId,
      name: chat.name,
      workspace_id: chat.workspaceId,
      messages: chat.messages.map((m) => ({
        message_id: m.messageId.toString(),
        author: m.author,
        content: m.content,
        created_at: m.createdAt.toISOString(),
      })),
    };
  }

  async getChatMessages(workspaceId: string, chatId: string) {
    const messages = await this.prisma.chatMessage.findMany({
      where: { chatId, deletedAt: null },
      orderBy: { createdAt: 'asc' },
    });
    return {
      messages: messages.map((m) => ({
        message_id: m.messageId.toString(),
        author: m.author,
        content: m.content,
        created_at: m.createdAt.toISOString(),
      })),
    };
  }

  async createQuestion(
    workspaceId: string,
    chatId: string,
    dto: CreateChatMessageDto,
  ) {
    const message = await this.prisma.chatMessage.create({
      data: {
        chatId,
        author: dto.author || { role: 'user' },
        content: dto.content,
      },
    });
    return {
      message_id: message.messageId.toString(),
      chat_id: message.chatId,
      content: message.content,
      author: message.author,
      created_at: message.createdAt.toISOString(),
    };
  }

  async createAnswer(
    workspaceId: string,
    chatId: string,
    dto: CreateChatMessageDto,
  ) {
    const message = await this.prisma.chatMessage.create({
      data: {
        chatId,
        author: dto.author || { role: 'assistant', name: 'OpenWorkspace AI' },
        content: dto.content,
      },
    });
    return {
      message_id: message.messageId.toString(),
      chat_id: message.chatId,
      content: message.content,
      author: message.author,
      created_at: message.createdAt.toISOString(),
    };
  }

  async updateMessage(chatId: string, messageId: string, content: string) {
    const message = await this.prisma.chatMessage.update({
      where: { messageId: BigInt(messageId) },
      data: { content },
    });
    return {
      message_id: message.messageId.toString(),
      content: message.content,
    };
  }

  async getChatSettings(chatId: string) {
    return {
      chat_id: chatId,
      model: 'gpt-4o',
      temperature: 0.7,
      system_prompt: 'You are OpenWorkspace AI Assistant.',
    };
  }

  async updateChatSettings(chatId: string, dto: UpdateChatSettingsDto) {
    return {
      chat_id: chatId,
      ...dto,
    };
  }

  async getRelatedQuestions(chatId: string, messageId: string) {
    return {
      questions: [
        '¿Puedes resumir este documento?',
        '¿Cuáles son los puntos clave de este proyecto?',
        '¿Cómo organizar mis vistas en OpenWorkspace?',
      ],
    };
  }

  // ================= AI COMPLETION =================
  async summarizeRow(dto: SummarizeRowDto) {
    return {
      summary: `Resumen de fila: ${JSON.stringify(dto.row)}`,
    };
  }

  async translateRow(dto: TranslateRowDto) {
    return {
      translated_text: dto.text,
      target_lang: dto.target_lang,
    };
  }

  async getLocalAiConfig() {
    return {
      enabled: true,
      provider: 'openai_compatible',
      api_base: process.env.AI_BASE_URL || 'http://localhost:8000/v1',
      models: ['gpt-4o', 'claude-3-5-sonnet', 'deepseek-chat', 'llama-3'],
    };
  }

  async listAiModels() {
    return {
      models: [
        { id: 'gpt-4o', name: 'OpenAI GPT-4o' },
        { id: 'claude-3-5-sonnet', name: 'Anthropic Claude 3.5 Sonnet' },
        { id: 'deepseek-chat', name: 'DeepSeek Chat' },
      ],
    };
  }
}
