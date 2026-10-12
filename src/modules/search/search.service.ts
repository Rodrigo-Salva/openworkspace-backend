import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { SearchDocumentQueryDto } from './dto/search.dto';

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  async searchDocument(workspaceId: string, query: SearchDocumentQueryDto) {
    const views = await this.prisma.view.findMany({
      where: {
        workspaceId,
        deletedAt: null,
        name: {
          contains: query.keyword,
          mode: 'insensitive',
        },
      },
      take: query.limit ? Number(query.limit) : 20,
    });

    const results = views.map((v) => ({
      view_id: v.viewId,
      name: v.name,
      layout: v.layout,
      snippet: `Coincidencia encontrada en documento "${v.name}"`,
      score: 1.0,
    }));

    try {
      const contentMatches: any[] = await this.prisma.$queryRaw`
        SELECT e.oid, e.content, e.fragment_id
        FROM af_collab_embeddings e
        JOIN af_collab c ON c.oid = e.oid
        WHERE c.workspace_id = ${workspaceId}::uuid
          AND e.content ILIKE ${'%' + query.keyword + '%'}
        LIMIT 10;
      `;

      for (const m of contentMatches) {
        if (!results.some((r) => r.view_id === m.oid)) {
          results.push({
            view_id: m.oid,
            name: 'Document Content',
            layout: 0,
            snippet: m.content ? m.content.substring(0, 160) + '...' : '',
            score: 0.85,
          });
        }
      }
    } catch {
      // Safe fallback
    }

    return results;
  }

  async summarizeSearch(workspaceId: string, queryText: string) {
    const results = await this.searchDocument(workspaceId, { keyword: queryText });
    return {
      query: queryText,
      total_matches: results.length,
      summary: `Se encontraron ${results.length} coincidencias para "${queryText}" en tu espacio de trabajo.`,
      items: results,
    };
  }
}
