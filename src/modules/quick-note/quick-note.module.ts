import { Module } from '@nestjs/common';
import { QuickNoteController } from './quick-note.controller';
import { QuickNoteService } from './quick-note.service';

@Module({
  controllers: [QuickNoteController],
  providers: [QuickNoteService],
  exports: [QuickNoteService],
})
export class QuickNoteModule {}
