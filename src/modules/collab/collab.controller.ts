import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { CollabService } from './collab.service';
import {
  CollabJsonResponseDto,
  CollabQueryDto,
  CollabResponseDto,
  CreateCollabDto,
  RowCollabExistsDto,
  UpdateCollabDto,
  UpdateCollabWebDto,
} from './dto/collab.dto';

@ApiTags('Collab')
@ApiBearerAuth()
@Controller()
export class CollabController {
  constructor(private readonly collabService: CollabService) {}

  @ApiOperation({ summary: 'Create or init collab object' })
  @Post('api/workspace/:workspace_id/collab/:object_id')
  async createCollab(
    @Param('workspace_id') workspaceId: string,
    @Param('object_id') objectId: string,
    @CurrentUser() user: any,
    @Body() dto: CreateCollabDto,
  ) {
    const uid = user ? BigInt(user.uid || 1) : BigInt(1);
    await this.collabService.upsertCollab(workspaceId, objectId, uid, dto);
    return {};
  }

  @ApiOperation({ summary: 'Get collab object' })
  @Get('api/workspace/:workspace_id/collab/:object_id')
  async getCollab(
    @Param('workspace_id') workspaceId: string,
    @Param('object_id') objectId: string,
    @Query() query: CollabQueryDto,
  ): Promise<CollabResponseDto> {
    return this.collabService.getCollab(workspaceId, objectId, query.collab_type ?? 0);
  }

  @ApiOperation({ summary: 'Update collab object' })
  @Put('api/workspace/:workspace_id/collab/:object_id')
  async updateCollab(
    @Param('workspace_id') workspaceId: string,
    @Param('object_id') objectId: string,
    @CurrentUser() user: any,
    @Body() dto: UpdateCollabDto,
  ) {
    const uid = user ? BigInt(user.uid || 1) : BigInt(1);
    await this.collabService.upsertCollab(workspaceId, objectId, uid, dto);
    return {};
  }

  @ApiOperation({ summary: 'Delete collab object' })
  @Delete('api/workspace/:workspace_id/collab/:object_id')
  async deleteCollab(
    @Param('workspace_id') workspaceId: string,
    @Param('object_id') objectId: string,
    @Query() query: CollabQueryDto,
  ) {
    return this.collabService.deleteCollab(workspaceId, objectId, query.collab_type ?? 0);
  }

  @ApiOperation({ summary: 'Get collab object (v1 format)' })
  @Get('api/workspace/v1/:workspace_id/collab/:object_id')
  async getCollabV1(
    @Param('workspace_id') workspaceId: string,
    @Param('object_id') objectId: string,
    @Query() query: CollabQueryDto,
  ): Promise<CollabResponseDto> {
    return this.collabService.getCollab(workspaceId, objectId, query.collab_type ?? 0);
  }

  @ApiOperation({ summary: 'Get collab as JSON' })
  @Get('api/workspace/v1/:workspace_id/collab/:object_id/json')
  async getCollabJson(
    @Param('workspace_id') workspaceId: string,
    @Param('object_id') objectId: string,
    @Query() query: CollabQueryDto,
  ): Promise<CollabJsonResponseDto> {
    return this.collabService.getCollabJson(workspaceId, objectId, query.collab_type ?? 0);
  }

  @ApiOperation({ summary: 'Perform full sync on collab' })
  @Post('api/workspace/v1/:workspace_id/collab/:object_id/full-sync')
  async fullSync(
    @Param('workspace_id') workspaceId: string,
    @Param('object_id') objectId: string,
    @CurrentUser() user: any,
    @Body() body: any,
  ) {
    const uid = user ? BigInt(user.uid || 1) : BigInt(1);
    return this.collabService.fullSync(workspaceId, objectId, uid, body);
  }

  @ApiOperation({ summary: 'Post web update for collab' })
  @Post('api/workspace/v1/:workspace_id/collab/:object_id/web-update')
  async postWebUpdate(
    @Param('workspace_id') workspaceId: string,
    @Param('object_id') objectId: string,
    @CurrentUser() user: any,
    @Body() dto: UpdateCollabWebDto,
  ) {
    const uid = user ? BigInt(user.uid || 1) : BigInt(1);
    return this.collabService.webUpdate(workspaceId, objectId, uid, dto);
  }

  @ApiOperation({ summary: 'Check if row document collab exists' })
  @Get('api/workspace/:workspace_id/collab/:object_id/row-document-collab-exists')
  async checkRowCollabExists(
    @Param('workspace_id') workspaceId: string,
    @Param('object_id') objectId: string,
  ): Promise<RowCollabExistsDto> {
    const exists = await this.collabService.checkRowCollabExists(objectId);
    return { exists };
  }

  @ApiOperation({ summary: 'Batch create or update collabs' })
  @Post('api/workspace/:workspace_id/batch/collab')
  async batchCreateCollab(
    @Param('workspace_id') workspaceId: string,
    @CurrentUser() user: any,
    @Body() body: any,
  ) {
    const uid = user ? BigInt(user.uid || 1) : BigInt(1);
    const items = Array.isArray(body) ? body : body.collabs || [];
    return this.collabService.batchCreateCollab(workspaceId, uid, items);
  }
}
