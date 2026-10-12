import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { QuickNoteDto, QuickNoteListResponseDto } from './dto/quick-note.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class QuickNoteService {
  constructor(private readonly prisma: PrismaService) {}

  async listNotes(workspaceId: string): Promise<QuickNoteListResponseDto> {
    const notes = await this.prisma.quickNote.findMany({
      where: { workspaceId },
      orderBy: { updatedAt: 'desc' },
    });

    return {
      data: notes.map((n) => ({
        id: n.quickNoteId,
        workspace_id: n.workspaceId,
        created_at: n.createdAt.toISOString(),
        updated_at: n.updatedAt.toISOString(),
        data: n.data,
      })),
      has_more: false,
    };
  }

  async createNote(
    workspaceId: string,
    uid: bigint,
    data: any,
  ): Promise<{ id: string }> {
    const note = await this.prisma.quickNote.create({
      data: {
        quickNoteId: uuidv4(),
        workspaceId,
        uid,
        data,
      },
    });

    return { id: note.quickNoteId };
  }

  async updateNote(
    workspaceId: string,
    noteId: string,
    data: any,
  ): Promise<void> {
    const note = await this.prisma.quickNote.findFirst({
      where: { quickNoteId: noteId, workspaceId },
    });

    if (!note) {
      throw new NotFoundException('Nota rápida no encontrada');
    }

    await this.prisma.quickNote.update({
      where: { quickNoteId: noteId },
      data: { data },
    });
  }

  async deleteNote(workspaceId: string, noteId: string): Promise<void> {
    await this.prisma.quickNote.deleteMany({
      where: { quickNoteId: noteId, workspaceId },
    });
  }
}
