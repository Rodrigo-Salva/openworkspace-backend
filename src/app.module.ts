import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './infrastructure/database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { ChatAiModule } from './modules/chat-ai/chat-ai.module';
import { CollabModule } from './modules/collab/collab.module';
import { FileStorageModule } from './modules/file-storage/file-storage.module';
import { PageModule } from './modules/page/page.module';
import { QuickNoteModule } from './modules/quick-note/quick-note.module';
import { SearchModule } from './modules/search/search.module';
import { SystemModule } from './modules/system/system.module';
import { TemplateModule } from './modules/template/template.module';
import { UserModule } from './modules/user/user.module';
import { WorkspaceModule } from './modules/workspace/workspace.module';
import { AdminModule } from './modules/admin/admin.module';
import { MailerModule } from './modules/mailer/mailer.module';
import { WorkerModule } from './modules/worker/worker.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),
    DatabaseModule,
    SystemModule,
    AuthModule,
    UserModule,
    WorkspaceModule,
    PageModule,
    FileStorageModule,
    QuickNoteModule,
    TemplateModule,
    CollabModule,
    ChatAiModule,
    SearchModule,
    AdminModule,
    MailerModule,
    WorkerModule,
  ],
})
export class AppModule {}
