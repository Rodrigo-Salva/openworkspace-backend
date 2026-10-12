import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Res,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { Public } from '../../common/decorators/public.decorator';
import { ChatAiService } from './chat-ai.service';
import {
  CompleteTextDto,
  SummarizeRowDto,
  TranslateRowDto,
} from './dto/chat-ai.dto';

@ApiTags('AI')
@ApiBearerAuth()
@Controller('api/ai/:workspace_id')
export class AiController {
  constructor(private readonly chatAiService: ChatAiService) {}

  @ApiOperation({ summary: 'Stream AI text completion (SSE)' })
  @Post('complete/stream')
  async streamComplete(
    @Param('workspace_id') workspaceId: string,
    @Body() dto: CompleteTextDto,
    @Res() res: Response,
  ) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const sampleText = `Completando tu texto: "${dto.text}" con capacidades avanzadas de IA en AppFlowy Cloud.`;
    const words = sampleText.split(' ');

    for (const word of words) {
      res.write(`data: ${JSON.stringify({ text: word + ' ' })}\n\n`);
      await new Promise((resolve) => setTimeout(resolve, 40));
    }
    res.write('data: [DONE]\n\n');
    res.end();
  }

  @ApiOperation({ summary: 'Stream AI completion v2 (SSE)' })
  @Post('v2/complete/stream')
  async streamCompleteV2(
    @Param('workspace_id') workspaceId: string,
    @Body() dto: CompleteTextDto,
    @Res() res: Response,
  ) {
    return this.streamComplete(workspaceId, dto, res);
  }

  @ApiOperation({ summary: 'Summarize database row' })
  @Post('summarize_row')
  async summarizeRow(@Body() dto: SummarizeRowDto) {
    return this.chatAiService.summarizeRow(dto);
  }

  @ApiOperation({ summary: 'Translate row content' })
  @Post('translate_row')
  async translateRow(@Body() dto: TranslateRowDto) {
    return this.chatAiService.translateRow(dto);
  }

  @Public()
  @ApiOperation({ summary: 'Get local AI configuration' })
  @Get('local/config')
  async getLocalAiConfig() {
    return this.chatAiService.getLocalAiConfig();
  }

  @ApiOperation({ summary: 'Calculate similarity between embeddings' })
  @Post('calculate_similarity')
  async calculateSimilarity(@Body() body: any) {
    return { similarity: 0.95 };
  }

  @Public()
  @ApiOperation({ summary: 'List available AI models' })
  @Get('model/list')
  async listAiModels() {
    return this.chatAiService.listAiModels();
  }
}
