import { Controller, Get, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { IndexerService } from './indexer.service';

@ApiTags('Worker')
@Controller('api/worker')
export class WorkerController {
  constructor(private readonly indexerService: IndexerService) {}

  @Get('status')
  @ApiOperation({ summary: 'Get background indexer status and document vector statistics' })
  @ApiResponse({ status: 200, description: 'Indexer worker statistics' })
  async getStatus() {
    const data = await this.indexerService.getStats();
    return {
      code: 0,
      message: 'Ok',
      data,
    };
  }

  @Post('index-now')
  @ApiOperation({ summary: 'Trigger an immediate background vector indexing pass' })
  @ApiResponse({ status: 200, description: 'Indexing pass completion report' })
  async indexNow() {
    const result = await this.indexerService.runIndexingPass();
    return {
      code: 0,
      message: 'Ok',
      data: result,
    };
  }
}
