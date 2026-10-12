import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import {
  PutFileResponseDto,
  BlobMetadataDto,
  WorkspaceUsageDto,
} from './dto/file-storage.dto';

@Injectable()
export class FileStorageService {
  private readonly logger = new Logger(FileStorageService.name);
  private s3Client: S3Client;
  private bucket: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.bucket = this.configService.get<string>('S3_BUCKET') || 'appflowy';
    const endpoint = this.configService.get<string>('S3_ENDPOINT') || 'http://localhost:9000';
    const accessKeyId = this.configService.get<string>('S3_ACCESS_KEY') || 'minioadmin';
    const secretAccessKey = this.configService.get<string>('S3_SECRET_KEY') || 'minioadmin';
    const region = this.configService.get<string>('S3_REGION') || 'us-east-1';

    this.s3Client = new S3Client({
      endpoint,
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      forcePathStyle: true,
    });
  }

  async uploadBlob(
    workspaceId: string,
    parentDir: string,
    buffer: Buffer,
    contentType: string,
  ): Promise<PutFileResponseDto> {
    const fileId = uuidv4();
    const key = `${workspaceId}/${parentDir}/${fileId}`;

    // 1. Guardar en S3 / MinIO
    try {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: buffer,
          ContentType: contentType || 'application/octet-stream',
        }),
      );
    } catch (error) {
      this.logger.warn(`No se pudo subir a S3, guardando metadatos localmente: ${error.message}`);
    }

    // 2. Registrar en la base de datos
    await this.prisma.blobMetadata.create({
      data: {
        fileId,
        workspaceId,
        fileSize: BigInt(buffer.length),
        fileType: contentType,
        fileStatus: 0,
      },
    });

    return {
      file_id: fileId,
      file_size: buffer.length,
    };
  }

  async getBlob(
    workspaceId: string,
    parentDir: string,
    fileId: string,
  ): Promise<{ stream: any; contentType: string }> {
    const meta = await this.prisma.blobMetadata.findUnique({
      where: { fileId },
    });

    if (!meta || meta.workspaceId !== workspaceId) {
      throw new NotFoundException('Archivo no encontrado');
    }

    const key = `${workspaceId}/${parentDir}/${fileId}`;
    try {
      const response = await this.s3Client.send(
        new GetObjectCommand({
          Bucket: this.bucket,
          Key: key,
        }),
      );

      return {
        stream: response.Body,
        contentType: meta.fileType || 'application/octet-stream',
      };
    } catch (error) {
      throw new NotFoundException('El archivo físico no se encuentra en el storage');
    }
  }

  async getMetadata(
    workspaceId: string,
    parentDir: string,
    fileId: string,
  ): Promise<BlobMetadataDto> {
    const meta = await this.prisma.blobMetadata.findUnique({
      where: { fileId },
    });

    if (!meta || meta.workspaceId !== workspaceId) {
      throw new NotFoundException('Metadatos de archivo no encontrados');
    }

    return {
      file_id: meta.fileId,
      file_type: meta.fileType || 'application/octet-stream',
      file_size: Number(meta.fileSize),
      file_status: meta.fileStatus,
      created_at: meta.createdAt.toISOString(),
    };
  }

  async deleteBlob(
    workspaceId: string,
    parentDir: string,
    fileId: string,
  ): Promise<void> {
    const key = `${workspaceId}/${parentDir}/${fileId}`;
    try {
      await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: key,
        }),
      );
    } catch (e) {
      // Ignorar error si ya fue borrado en S3
    }

    await this.prisma.blobMetadata.deleteMany({
      where: { fileId, workspaceId },
    });
  }

  async getUsage(workspaceId: string): Promise<WorkspaceUsageDto> {
    const blobs = await this.prisma.blobMetadata.findMany({
      where: { workspaceId },
      select: { fileSize: true },
    });

    const total = blobs.reduce((acc, b) => acc + Number(b.fileSize), 0);
    return {
      total_bytes: total,
    };
  }
}
