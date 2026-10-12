import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SearchDocumentQueryDto, SummarySearchQueryDto } from './dto/search.dto';
import { SearchService } from './search.service';

@ApiTags('Search')
@ApiBearerAuth()
@Controller('api/search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @ApiOperation({ summary: 'Search documents in workspace' })
  @Get(':workspace_id')
  async searchDocument(
    @Param('workspace_id') workspaceId: string,
    @Query() query: SearchDocumentQueryDto,
  ) {
    return this.searchService.searchDocument(workspaceId, query);
  }

  @ApiOperation({ summary: 'Summarize search results in workspace' })
  @Get(':workspace_id/summary')
  async summarizeSearch(
    @Param('workspace_id') workspaceId: string,
    @Query() query: SummarySearchQueryDto,
  ) {
    return this.searchService.summarizeSearch(workspaceId, query.query);
  }
}
