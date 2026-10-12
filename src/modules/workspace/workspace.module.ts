import { Module } from '@nestjs/common';
import { AccessRequestController } from './access-request.controller';
import { ImportController } from './import.controller';
import { InviteCodeController } from './invite-code.controller';
import { WorkspaceController } from './workspace.controller';
import { WorkspaceService } from './workspace.service';

@Module({
  controllers: [
    WorkspaceController,
    InviteCodeController,
    AccessRequestController,
    ImportController,
  ],
  providers: [WorkspaceService],
  exports: [WorkspaceService],
})
export class WorkspaceModule {}
