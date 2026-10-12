import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { CurrentUser, AuthUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { QuickNoteService } from './quick-note.service';
import { QuickNoteListResponseDto } from './dto/quick-note.dto';

@ApiTags('Quick Notes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/workspace/:workspace_id/quick-note')
export class QuickNoteController {
  constructor(private readonly quickNoteService: QuickNoteService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todas las notas rápidas del workspace' })
  @ApiParam({ name: 'workspace_id', description: 'UUID del workspace' })
  @ApiResponse({ status: 200, type: QuickNoteListResponseDto })
  async listNotes(
    @Param('workspace_id') workspaceId: string,
  ): Promise<QuickNoteListResponseDto> {
    return this.quickNoteService.listNotes(workspaceId);
  }

  @Post()
  @ApiOperation({ summary: 'Crear una nueva nota rápida' })
  @ApiParam({ name: 'workspace_id', description: 'UUID del workspace' })
  @ApiResponse({ status: 201, example: { id: 'uuid-de-nota' } })
  async createNote(
    @CurrentUser() user: AuthUser,
    @Param('workspace_id') workspaceId: string,
    @Body() body: any,
  ) {
    return this.quickNoteService.createNote(workspaceId, BigInt(user.uid), body);
  }

  @Put(':quick_note_id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Actualizar contenido de una nota rápida' })
  @ApiParam({ name: 'workspace_id', description: 'UUID del workspace' })
  @ApiParam({ name: 'quick_note_id', description: 'UUID de la nota rápida' })
  async updateNote(
    @Param('workspace_id') workspaceId: string,
    @Param('quick_note_id') noteId: string,
    @Body() body: any,
  ) {
    await this.quickNoteService.updateNote(workspaceId, noteId, body);
    return {};
  }

  @Delete(':quick_note_id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar una nota rápida' })
  @ApiParam({ name: 'workspace_id', description: 'UUID del workspace' })
  @ApiParam({ name: 'quick_note_id', description: 'UUID de la nota rápida' })
  async deleteNote(
    @Param('workspace_id') workspaceId: string,
    @Param('quick_note_id') noteId: string,
  ) {
    await this.quickNoteService.deleteNote(workspaceId, noteId);
    return {};
  }
}
