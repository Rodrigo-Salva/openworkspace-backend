import { Module } from '@nestjs/common';
import { IndexerService } from './indexer.service';
import { WorkerController } from './worker.controller';

@Module({
  controllers: [WorkerController],
  providers: [IndexerService],
  exports: [IndexerService],
})
export class WorkerModule {}
