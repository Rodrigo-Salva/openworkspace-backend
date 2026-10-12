import {
  Controller,
  Get,
  Put,
  Delete,
  Param,
  Req,
  Res,
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
  ApiConsumes,
} from '@nestjs/swagger';
import { Request, Response } from 'express';
import { Public } from '../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { FileStorageService } from './file-storage.service';
import {
  PutFileResponseDto,
  BlobMetadataDto,
  WorkspaceUsageDto,
} from './dto/file-storage.dto';

@ApiTags('Storage')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/file_storage/:workspace_id')
export class FileStorageController {
  constructor(private readonly storageService: FileStorageService) {}

  @Put('v1/blob/:parent_dir')
  @ApiOperation({ summary: 'Subir un archivo binario/blob a S3 o MinIO' })
  @ApiConsumes('application/octet-stream', 'image/*', 'multipart/form-data')
  @ApiParam({ name: 'workspace_id', description: 'UUID del workspace' })
  @ApiParam({ name: 'parent_dir', description: 'Directorio padre (usualmente view_id)' })
  @ApiResponse({ status: 200, type: PutFileResponseDto })
  async uploadBlob(
    @Param('workspace_id') workspaceId: string,
    @Param('parent_dir') parentDir: string,
    @Req() req: Request,
  ): Promise<PutFileResponseDto> {
    const chunks: Buffer[] = [];
    for await (const chunk of req) {
      chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
    }
    const buffer = Buffer.concat(chunks);
    const contentType = req.headers['content-type'] || 'application/octet-stream';

    return this.storageService.uploadBlob(workspaceId, parentDir, buffer, contentType);
  }

  @Public()
  @Get('v1/blob/:parent_dir/:file_id')
  @ApiOperation({ summary: 'Descargar o reproducir archivo/blob' })
  @ApiParam({ name: 'workspace_id', description: 'UUID del workspace' })
  @ApiParam({ name: 'parent_dir', description: 'Directorio padre (view_id)' })
  @ApiParam({ name: 'file_id', description: 'UUID del archivo' })
  async getBlob(
    @Param('workspace_id') workspaceId: string,
    @Param('parent_dir') parentDir: string,
    @Param('file_id') fileId: string,
    @Res() res: Response,
  ) {
    const { stream, contentType } = await this.storageService.getBlob(
      workspaceId,
      parentDir,
      fileId,
    );
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    stream.pipe(res);
  }

  @Get('v1/metadata/:parent_dir/:file_id')
  @ApiOperation({ summary: 'Obtener metadatos de un archivo' })
  @ApiParam({ name: 'workspace_id', description: 'UUID del workspace' })
  @ApiParam({ name: 'parent_dir', description: 'Directorio padre' })
  @ApiParam({ name: 'file_id', description: 'UUID del archivo' })
  @ApiResponse({ status: 200, type: BlobMetadataDto })
  async getMetadata(
    @Param('workspace_id') workspaceId: string,
    @Param('parent_dir') parentDir: string,
    @Param('file_id') fileId: string,
  ): Promise<BlobMetadataDto> {
    return this.storageService.getMetadata(workspaceId, parentDir, fileId);
  }

  @Delete('v1/blob/:parent_dir/:file_id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar un archivo/blob' })
  @ApiParam({ name: 'workspace_id', description: 'UUID del workspace' })
  @ApiParam({ name: 'parent_dir', description: 'Directorio padre' })
  @ApiParam({ name: 'file_id', description: 'UUID del archivo' })
  async deleteBlob(
    @Param('workspace_id') workspaceId: string,
    @Param('parent_dir') parentDir: string,
    @Param('file_id') fileId: string,
  ) {
    await this.storageService.deleteBlob(workspaceId, parentDir, fileId);
    return {};
  }

  @Get('usage')
  @ApiOperation({ summary: 'Consultar el espacio total consumido por el workspace' })
  @ApiParam({ name: 'workspace_id', description: 'UUID del workspace' })
  @ApiResponse({ status: 200, type: WorkspaceUsageDto })
  async getUsage(
    @Param('workspace_id') workspaceId: string,
  ): Promise<WorkspaceUsageDto> {
    return this.storageService.getUsage(workspaceId);
  }
}
