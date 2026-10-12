import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import * as Y from 'yjs';
import { PrismaService } from '../../infrastructure/database/prisma.service';

interface CollabRow {
  oid: string;
  workspace_id: string;
  blob: Buffer;
  updated_at: Date;
  indexed_at: Date | null;
}

@Injectable()
export class IndexerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(IndexerService.name);
  private timer: NodeJS.Timeout | null = null;
  private isProcessing = false;
  private readonly intervalSecs: number;
  private readonly chunkSize: number;
  private readonly chunkOverlap: number;
  private readonly openAiApiKey: string | null;
  private readonly openAiModel: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.intervalSecs = Number(this.configService.get<string>('APPFLOWY_WORKER_INDEX_INTERVAL_SECS') || 30);
    this.chunkSize = Number(this.configService.get<string>('APPFLOWY_EMBEDDING_CHUNK_SIZE') || 1000);
    this.chunkOverlap = Number(this.configService.get<string>('APPFLOWY_EMBEDDING_CHUNK_OVERLAP') || 100);
    this.openAiApiKey =
      this.configService.get<string>('OPENAI_API_KEY') ||
      this.configService.get<string>('AI_OPENAI_API_KEY') ||
      null;
    this.openAiModel =
      this.configService.get<string>('OPENAI_EMBEDDING_MODEL') || 'text-embedding-3-small';
  }

  onModuleInit() {
    this.logger.log(
      `Starting background Indexer worker (interval: ${this.intervalSecs}s, OpenAI: ${
        this.openAiApiKey ? 'Configured' : 'Local/Synthetic Vector mode'
      })`,
    );

    // Initial check after 3 seconds
    setTimeout(() => {
      this.runIndexingPass().catch((err) =>
        this.logger.error(`Initial indexing pass error: ${err.message}`),
      );
    }, 3000);

    // Periodic loop
    this.timer = setInterval(() => {
      this.runIndexingPass().catch((err) =>
        this.logger.error(`Periodic indexing pass error: ${err.message}`),
      );
    }, this.intervalSecs * 1000);
  }

  onModuleDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  async runIndexingPass(): Promise<{
    processedCollabs: number;
    chunksIndexed: number;
    durationMs: number;
  }> {
    if (this.isProcessing) {
      return { processedCollabs: 0, chunksIndexed: 0, durationMs: 0 };
    }

    this.isProcessing = true;
    const startTime = Date.now();
    let processedCollabs = 0;
    let chunksIndexed = 0;

    try {
      // Find unindexed collabs or collabs modified after indexed_at
      const unindexed: CollabRow[] = await this.prisma.$queryRaw`
        SELECT oid, workspace_id, blob, updated_at, indexed_at
        FROM af_collab
        WHERE deleted_at IS NULL
          AND (indexed_at IS NULL OR updated_at > indexed_at)
        LIMIT 50;
      `;

      if (unindexed.length > 0) {
        this.logger.log(`Found ${unindexed.length} unindexed collabs. Processing embeddings...`);

        for (const collab of unindexed) {
          try {
            const chunks = await this.processCollabDocument(collab);
            chunksIndexed += chunks;
            processedCollabs++;
          } catch (err: any) {
            this.logger.warn(`Failed indexing collab ${collab.oid}: ${err.message}`);
            // Still mark as processed to prevent infinite retry loops on corrupt blobs
            await this.prisma.$executeRaw`
              UPDATE af_collab SET indexed_at = NOW() WHERE oid = ${collab.oid}::uuid;
            `;
          }
        }

        const elapsed = Date.now() - startTime;
        this.logger.log(
          `Completed indexing pass: ${processedCollabs} collabs, ${chunksIndexed} embedding fragments in ${elapsed}ms`,
        );
      }
    } catch (err: any) {
      this.logger.error(`Error during indexing pass: ${err.message}`);
    } finally {
      this.isProcessing = false;
    }

    return {
      processedCollabs,
      chunksIndexed,
      durationMs: Date.now() - startTime,
    };
  }

  private async processCollabDocument(collab: CollabRow): Promise<number> {
    const paragraphs = this.extractTextFromCollabBlob(collab.blob);
    const chunks = this.splitTextIntoChunks(collab.oid, paragraphs);

    if (chunks.length === 0) {
      // Empty document, mark as indexed
      await this.prisma.$executeRaw`
        UPDATE af_collab SET indexed_at = NOW() WHERE oid = ${collab.oid}::uuid;
      `;
      return 0;
    }

    // Embed and persist chunks
    let count = 0;
    for (let index = 0; index < chunks.length; index++) {
      const chunk = chunks[index];
      const embeddingVector = await this.generateEmbedding(chunk.content);
      const vectorSqlString = `[${embeddingVector.join(',')}]`;
      const metadataJson = JSON.stringify({
        id: collab.oid,
        workspace_id: collab.workspace_id,
        fragment_index: index,
        source: 'appflowy',
      });

      await this.prisma.$executeRaw`
        INSERT INTO af_collab_embeddings (
          fragment_id,
          oid,
          content_type,
          indexed_at,
          content,
          embedding,
          metadata,
          fragment_index,
          embedder_type
        )
        VALUES (
          ${chunk.fragmentId},
          ${collab.oid}::uuid,
          0,
          NOW(),
          ${chunk.content},
          ${vectorSqlString}::vector,
          ${metadataJson}::jsonb,
          ${index},
          0
        )
        ON CONFLICT (fragment_id, oid)
        DO UPDATE SET
          content = EXCLUDED.content,
          embedding = EXCLUDED.embedding,
          indexed_at = NOW();
      `;
      count++;
    }

    // Update collab.indexed_at
    await this.prisma.$executeRaw`
      UPDATE af_collab SET indexed_at = NOW() WHERE oid = ${collab.oid}::uuid;
    `;

    return count;
  }

  private extractTextFromCollabBlob(blob: Buffer): string[] {
    const paragraphs: string[] = [];
    if (!blob || blob.length === 0) return paragraphs;

    try {
      const ydoc = new Y.Doc();
      Y.applyUpdate(ydoc, new Uint8Array(blob));

      // Extract from shared types
      for (const [_, sharedType] of ydoc.share.entries()) {
        if (sharedType instanceof Y.Text) {
          const text = sharedType.toString().trim();
          if (text) paragraphs.push(text);
        } else if (sharedType instanceof Y.Array) {
          this.extractFromArray(sharedType, paragraphs);
        } else if (sharedType instanceof Y.Map) {
          this.extractFromMap(sharedType, paragraphs);
        }
      }
    } catch {
      // If Yjs decode fails (e.g. raw text or alternative serialization), extract printable UTF-8 lines
      const rawString = blob.toString('utf-8').replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, ' ');
      const cleanLines = rawString
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l.length >= 4);
      if (cleanLines.length > 0) {
        paragraphs.push(...cleanLines);
      }
    }

    return paragraphs;
  }

  private extractFromArray(yarray: Y.Array<any>, out: string[]) {
    try {
      for (const item of yarray.toArray()) {
        if (typeof item === 'string' && item.trim()) {
          out.push(item.trim());
        } else if (item instanceof Y.Text) {
          const str = item.toString().trim();
          if (str) out.push(str);
        } else if (item && typeof item === 'object') {
          for (const val of Object.values(item)) {
            if (typeof val === 'string' && val.trim().length > 2) {
              out.push(val.trim());
            }
          }
        }
      }
    } catch {
      // Safe ignore
    }
  }

  private extractFromMap(ymap: Y.Map<any>, out: string[]) {
    try {
      for (const [_, val] of ymap.entries()) {
        if (typeof val === 'string' && val.trim().length > 2) {
          out.push(val.trim());
        } else if (val instanceof Y.Text) {
          const str = val.toString().trim();
          if (str) out.push(str);
        }
      }
    } catch {
      // Safe ignore
    }
  }

  private splitTextIntoChunks(
    oid: string,
    paragraphs: string[],
  ): Array<{ fragmentId: string; content: string }> {
    if (paragraphs.length === 0) return [];

    const fullText = paragraphs.join('\n\n');
    const chunks: Array<{ fragmentId: string; content: string }> = [];

    let start = 0;
    while (start < fullText.length) {
      const end = Math.min(start + this.chunkSize, fullText.length);
      const chunkContent = fullText.substring(start, end).trim();

      if (chunkContent.length > 0) {
        const hash = crypto.createHash('sha256').update(`${oid}-${start}-${chunkContent}`).digest('hex').substring(0, 32);
        chunks.push({
          fragmentId: hash,
          content: chunkContent,
        });
      }

      if (end >= fullText.length) break;
      start += this.chunkSize - this.chunkOverlap;
    }

    return chunks;
  }

  private async generateEmbedding(text: string): Promise<number[]> {
    const dimensions = 1536;

    if (this.openAiApiKey) {
      try {
        const response = await fetch('https://api.openai.com/v1/embeddings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.openAiApiKey}`,
          },
          body: JSON.stringify({
            model: this.openAiModel,
            input: text.substring(0, 8000),
          }),
        });

        if (response.ok) {
          const data: any = await response.json();
          if (data?.data?.[0]?.embedding) {
            return data.data[0].embedding;
          }
        } else {
          const errText = await response.text();
          this.logger.warn(`OpenAI embedding API returned status ${response.status}: ${errText}`);
        }
      } catch (err: any) {
        this.logger.warn(`OpenAI embedding request failed: ${err.message}`);
      }
    }

    // Local / Synthetic deterministic embedding for 1536 dimensions
    // Computes normalized hash features so vector cosine operations are fully valid in PostgreSQL!
    const vector = new Array(dimensions).fill(0);
    const hash = crypto.createHash('sha256').update(text).digest();
    let norm = 0;

    for (let i = 0; i < dimensions; i++) {
      const byte = hash[i % hash.length];
      const val = (byte - 128) / 128.0 + Math.sin(i * 0.1) * 0.1;
      vector[i] = val;
      norm += val * val;
    }

    const sqrtNorm = Math.sqrt(norm) || 1;
    for (let i = 0; i < dimensions; i++) {
      vector[i] = Number((vector[i] / sqrtNorm).toFixed(6));
    }

    return vector;
  }

  async getStats() {
    const totalCollabs: any[] = await this.prisma.$queryRaw`
      SELECT COUNT(*)::int as count FROM af_collab WHERE deleted_at IS NULL;
    `;
    const indexedCollabs: any[] = await this.prisma.$queryRaw`
      SELECT COUNT(*)::int as count FROM af_collab WHERE deleted_at IS NULL AND indexed_at IS NOT NULL;
    `;
    const pendingCollabs: any[] = await this.prisma.$queryRaw`
      SELECT COUNT(*)::int as count FROM af_collab WHERE deleted_at IS NULL AND (indexed_at IS NULL OR updated_at > indexed_at);
    `;
    const totalEmbeddings: any[] = await this.prisma.$queryRaw`
      SELECT COUNT(*)::int as count FROM af_collab_embeddings;
    `;

    return {
      workerRunning: this.timer !== null,
      intervalSecs: this.intervalSecs,
      openAiConfigured: Boolean(this.openAiApiKey),
      openAiModel: this.openAiModel,
      collabs: {
        total: totalCollabs[0]?.count ?? 0,
        indexed: indexedCollabs[0]?.count ?? 0,
        pending: pendingCollabs[0]?.count ?? 0,
      },
      embeddings: {
        totalFragments: totalEmbeddings[0]?.count ?? 0,
      },
    };
  }
}
