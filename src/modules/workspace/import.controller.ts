import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Import & Export')
@ApiBearerAuth()
@Controller('api/import')
export class ImportController {
  @ApiOperation({ summary: 'Crear tarea de importación de datos (Notion/Markdown/CSV)' })
  @Post('create')
  async createImportTask(@Body() body: any) {
    return {
      task_id: crypto.randomUUID(),
      presigned_url: 'http://localhost:9000/appflowy/import-upload',
      status: 'pending',
    };
  }

  @ApiOperation({ summary: 'Procesar datos importados' })
  @Post()
  async processImport(@Body() body: any) {
    return {
      status: 'completed',
    };
  }

  @ApiOperation({ summary: 'Consultar estado de importación' })
  @Get()
  async getImportDetail() {
    return {
      tasks: [],
    };
  }
}
