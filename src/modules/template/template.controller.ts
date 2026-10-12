import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import {
  CreateTemplateCategoryDto,
  CreateTemplateCreatorDto,
  CreateTemplateDto,
  GetTemplateCategoriesQueryDto,
  GetTemplateCreatorsQueryDto,
  GetTemplatesQueryDto,
  TemplateHomePageQueryDto,
  UpdateTemplateCategoryDto,
  UpdateTemplateCreatorDto,
  UpdateTemplateDto,
} from './dto/template.dto';
import { TemplateService } from './template.service';

@ApiTags('Template Center')
@ApiBearerAuth()
@Controller('api/template-center')
export class TemplateController {
  constructor(private readonly templateService: TemplateService) {}

  // ---------------- CATEGORY ----------------
  @ApiOperation({ summary: 'Create template category' })
  @Post('category')
  async createCategory(@Body() dto: CreateTemplateCategoryDto) {
    return this.templateService.createCategory(dto);
  }

  @Public()
  @ApiOperation({ summary: 'List template categories' })
  @Get('category')
  async listCategories(@Query() query: GetTemplateCategoriesQueryDto) {
    const categories = await this.templateService.listCategories(query);
    return { categories };
  }

  @Public()
  @ApiOperation({ summary: 'Get template category by id' })
  @Get('category/:category_id')
  async getCategory(@Param('category_id') categoryId: string) {
    return this.templateService.getCategory(categoryId);
  }

  @ApiOperation({ summary: 'Update template category' })
  @Put('category/:category_id')
  async updateCategory(
    @Param('category_id') categoryId: string,
    @Body() dto: UpdateTemplateCategoryDto,
  ) {
    return this.templateService.updateCategory(categoryId, dto);
  }

  @ApiOperation({ summary: 'Delete template category' })
  @Delete('category/:category_id')
  async deleteCategory(@Param('category_id') categoryId: string) {
    await this.templateService.deleteCategory(categoryId);
    return {};
  }

  // ---------------- CREATOR ----------------
  @ApiOperation({ summary: 'Create template creator' })
  @Post('creator')
  async createCreator(@Body() dto: CreateTemplateCreatorDto) {
    return this.templateService.createCreator(dto);
  }

  @Public()
  @ApiOperation({ summary: 'List template creators' })
  @Get('creator')
  async listCreators(@Query() query: GetTemplateCreatorsQueryDto) {
    const creators = await this.templateService.listCreators(query);
    return { creators };
  }

  @Public()
  @ApiOperation({ summary: 'Get template creator by id' })
  @Get('creator/:creator_id')
  async getCreator(@Param('creator_id') creatorId: string) {
    return this.templateService.getCreator(creatorId);
  }

  @ApiOperation({ summary: 'Update template creator' })
  @Put('creator/:creator_id')
  async updateCreator(
    @Param('creator_id') creatorId: string,
    @Body() dto: UpdateTemplateCreatorDto,
  ) {
    return this.templateService.updateCreator(creatorId, dto);
  }

  @ApiOperation({ summary: 'Delete template creator' })
  @Delete('creator/:creator_id')
  async deleteCreator(@Param('creator_id') creatorId: string) {
    await this.templateService.deleteCreator(creatorId);
    return {};
  }

  // ---------------- TEMPLATE ----------------
  @ApiOperation({ summary: 'Create template' })
  @Post('template')
  async createTemplate(@Body() dto: CreateTemplateDto) {
    return this.templateService.createTemplate(dto);
  }

  @Public()
  @ApiOperation({ summary: 'List templates' })
  @Get('template')
  async listTemplates(@Query() query: GetTemplatesQueryDto) {
    const templates = await this.templateService.listTemplates(query);
    return { templates };
  }

  @Public()
  @ApiOperation({ summary: 'Get template by view id' })
  @Get('template/:view_id')
  async getTemplate(@Param('view_id') viewId: string) {
    return this.templateService.getTemplate(viewId);
  }

  @ApiOperation({ summary: 'Update template' })
  @Put('template/:view_id')
  async updateTemplate(
    @Param('view_id') viewId: string,
    @Body() dto: UpdateTemplateDto,
  ) {
    return this.templateService.updateTemplate(viewId, dto);
  }

  @ApiOperation({ summary: 'Delete template' })
  @Delete('template/:view_id')
  async deleteTemplate(@Param('view_id') viewId: string) {
    await this.templateService.deleteTemplate(viewId);
    return {};
  }

  // ---------------- HOMEPAGE ----------------
  @Public()
  @ApiOperation({ summary: 'Get template homepage content' })
  @Get('homepage')
  async getHomepage(@Query() query: TemplateHomePageQueryDto) {
    return this.templateService.getHomepage(query.per_count ? Number(query.per_count) : 10);
  }
}
