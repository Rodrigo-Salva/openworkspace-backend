import { Injectable, NotFoundException } from '@nestjs/common';
import * as Y from 'yjs';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import {
  CreateCollabDto,
  UpdateCollabDto,
  UpdateCollabWebDto,
} from './dto/collab.dto';

@Injectable()
export class CollabService {
  constructor(private readonly prisma: PrismaService) {}

  private extractBuffer(data: any): Buffer {
    if (!data) {
      return Buffer.from([]);
    }
    if (Buffer.isBuffer(data)) {
      return data;
    }
    if (Array.isArray(data)) {
      return Buffer.from(data);
    }
    if (typeof data === 'string') {
      try {
        return Buffer.from(data, 'base64');
      } catch {
        return Buffer.from(data, 'utf-8');
      }
    }
    if (typeof data === 'object') {
      if (data.doc_state) {
        return this.extractBuffer(data.doc_state);
      }
      if (data.encoded_collab_v1) {
        return this.extractBuffer(data.encoded_collab_v1);
      }
    }
    return Buffer.from([]);
  }

  async upsertCollab(
    workspaceId: string,
    objectId: string,
    uid: bigint,
    dto: CreateCollabDto | UpdateCollabDto,
  ) {
    const partitionKey = Number(dto.collab_type ?? 0);
    const blob = this.extractBuffer(
      (dto as any).doc_state || (dto as any).encoded_collab_v1 || (dto as any).blob,
    );

    return this.prisma.collab.upsert({
      where: {
        oid: objectId,
      },
      update: {
        blob: blob as any,
        len: blob.length,
        partitionKey,
        updatedAt: new Date(),
      },
      create: {
        oid: objectId,
        partitionKey,
        blob: blob as any,
        len: blob.length,
        ownerUid: uid,
        workspaceId,
      },
    });
  }

  async getCollab(workspaceId: string, objectId: string, collabType = 0) {
    const partitionKey = Number(collabType);
    let collab = await this.prisma.collab.findUnique({
      where: {
        oid: objectId,
      },
    });

    if (!collab) {
      // If not found yet, return an empty initialized doc state for new views
      const emptyDoc = new Y.Doc();
      const emptyUpdate = Buffer.from(Y.encodeStateAsUpdate(emptyDoc));
      return {
        object_id: objectId,
        encode_collab: {
          doc_state: Array.from(emptyUpdate),
          version: 1,
        },
      };
    }

    return {
      object_id: objectId,
      encode_collab: {
        doc_state: Array.from(collab.blob),
        version: 1,
      },
    };
  }

  async getCollabJson(workspaceId: string, objectId: string, collabType = 0) {
    const collab = await this.prisma.collab.findUnique({
      where: {
        oid: objectId,
      },
    });

    const doc = new Y.Doc();
    if (collab && collab.blob.length > 0) {
      try {
        Y.applyUpdate(doc, new Uint8Array(collab.blob));
      } catch (err) {
        // Fallback if binary isn't pure Yjs
      }
    }

    return {
      collab: doc.toJSON(),
    };
  }

  async deleteCollab(workspaceId: string, objectId: string, collabType = 0) {
    try {
      await this.prisma.collab.delete({
        where: {
          oid: objectId,
        },
      });
    } catch {
      // Ignored if already absent
    }
    return {};
  }

  async webUpdate(
    workspaceId: string,
    objectId: string,
    uid: bigint,
    dto: UpdateCollabWebDto,
  ) {
    const partitionKey = Number(dto.collab_type ?? 0);
    const newUpdate = this.extractBuffer(dto.doc_state);

    const existing = await this.prisma.collab.findUnique({
      where: {
        oid: objectId,
      },
    });

    let mergedBlob = newUpdate;
    if (existing && existing.blob.length > 0) {
      try {
        const doc = new Y.Doc();
        Y.applyUpdate(doc, new Uint8Array(existing.blob));
        Y.applyUpdate(doc, new Uint8Array(newUpdate));
        mergedBlob = Buffer.from(Y.encodeStateAsUpdate(doc));
      } catch {
        mergedBlob = newUpdate;
      }
    }

    await this.prisma.collab.upsert({
      where: {
        oid: objectId,
      },
      update: {
        blob: mergedBlob as any,
        len: mergedBlob.length,
        partitionKey,
        updatedAt: new Date(),
      },
      create: {
        oid: objectId,
        partitionKey,
        blob: mergedBlob as any,
        len: mergedBlob.length,
        ownerUid: uid,
        workspaceId,
      },
    });

    return {};
  }

  async fullSync(
    workspaceId: string,
    objectId: string,
    uid: bigint,
    body: any,
  ) {
    const blob = this.extractBuffer(body);
    const partitionKey = 0; // Default to document partition

    const existing = await this.prisma.collab.findUnique({
      where: {
        oid: objectId,
      },
    });

    let finalBlob = blob;
    if (existing && existing.blob.length > 0 && blob.length > 0) {
      try {
        const doc = new Y.Doc();
        Y.applyUpdate(doc, new Uint8Array(existing.blob));
        Y.applyUpdate(doc, new Uint8Array(blob));
        finalBlob = Buffer.from(Y.encodeStateAsUpdate(doc));
      } catch {
        finalBlob = blob;
      }
    }

    await this.prisma.collab.upsert({
      where: {
        oid: objectId,
      },
      update: {
        blob: finalBlob as any,
        len: finalBlob.length,
        partitionKey,
        updatedAt: new Date(),
      },
      create: {
        oid: objectId,
        partitionKey,
        blob: finalBlob as any,
        len: finalBlob.length,
        ownerUid: uid,
        workspaceId,
      },
    });

    return {
      object_id: objectId,
      encode_collab: {
        doc_state: Array.from(finalBlob),
        version: 1,
      },
    };
  }

  async checkRowCollabExists(objectId: string): Promise<boolean> {
    const count = await this.prisma.collab.count({
      where: {
        oid: objectId,
        partitionKey: 2, // DatabaseRow
      },
    });
    return count > 0;
  }

  async batchCreateCollab(
    workspaceId: string,
    uid: bigint,
    items: Array<{ object_id: string; collab_type: number; doc_state: any }>,
  ) {
    for (const item of items) {
      await this.upsertCollab(workspaceId, item.object_id, uid, {
        collab_type: item.collab_type,
        doc_state: item.doc_state,
      });
    }
    return {};
  }
}
