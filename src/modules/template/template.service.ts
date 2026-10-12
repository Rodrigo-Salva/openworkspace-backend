import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import {
  CreateTemplateCategoryDto,
  CreateTemplateCreatorDto,
  CreateTemplateDto,
  GetTemplateCategoriesQueryDto,
  GetTemplateCreatorsQueryDto,
  GetTemplatesQueryDto,
  UpdateTemplateCategoryDto,
  UpdateTemplateCreatorDto,
  UpdateTemplateDto,
} from './dto/template.dto';

@Injectable()
export class TemplateService {
  constructor(private readonly prisma: PrismaService) {}

  // ================= CATEGORIES =================
  async createCategory(dto: CreateTemplateCategoryDto) {
    return this.prisma.templateCategory.create({
      data: {
        name: dto.name,
        description: dto.description || '',
        icon: dto.icon || '',
        bgColor: dto.bg_color || '#ffffff',
        categoryType: dto.category_type ?? 0,
        priority: dto.priority ?? 0,
      },
    });
  }

  async listCategories(query: GetTemplateCategoriesQueryDto) {
    const where: any = {};
    if (query.name_contains) {
      where.name = { contains: query.name_contains, mode: 'insensitive' };
    }
    const categories = await this.prisma.templateCategory.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    return categories;
  }

  async getCategory(categoryId: string) {
    const category = await this.prisma.templateCategory.findUnique({
      where: { categoryId },
      include: {
        templates: {
          include: { template: true },
        },
      },
    });
    if (!category) {
      throw new NotFoundException('Template category not found');
    }
    return category;
  }

  async updateCategory(categoryId: string, dto: UpdateTemplateCategoryDto) {
    await this.getCategory(categoryId);
    return this.prisma.templateCategory.update({
      where: { categoryId },
      data: {
        name: dto.name,
        description: dto.description || '',
        icon: dto.icon || '',
        bgColor: dto.bg_color || '#ffffff',
        categoryType: dto.category_type,
        priority: dto.priority,
      },
    });
  }

  async deleteCategory(categoryId: string) {
    await this.getCategory(categoryId);
    return this.prisma.templateCategory.delete({
      where: { categoryId },
    });
  }

  // ================= CREATORS =================
  async createCreator(dto: CreateTemplateCreatorDto) {
    return this.prisma.templateCreator.create({
      data: {
        name: dto.name,
        avatarUrl: dto.avatar_url,
      },
    });
  }

  async listCreators(query: GetTemplateCreatorsQueryDto) {
    const where: any = {};
    if (query.name_contains) {
      where.name = { contains: query.name_contains, mode: 'insensitive' };
    }
    return this.prisma.templateCreator.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async getCreator(creatorId: string) {
    const creator = await this.prisma.templateCreator.findUnique({
      where: { creatorId },
      include: { templates: true },
    });
    if (!creator) {
      throw new NotFoundException('Template creator not found');
    }
    return creator;
  }

  async updateCreator(creatorId: string, dto: UpdateTemplateCreatorDto) {
    await this.getCreator(creatorId);
    return this.prisma.templateCreator.update({
      where: { creatorId },
      data: {
        name: dto.name,
        avatarUrl: dto.avatar_url,
      },
    });
  }

  async deleteCreator(creatorId: string) {
    await this.getCreator(creatorId);
    return this.prisma.templateCreator.delete({
      where: { creatorId },
    });
  }

  // ================= TEMPLATES =================
  async createTemplate(dto: CreateTemplateDto) {
    const template = await this.prisma.templateView.create({
      data: {
        viewId: dto.view_id,
        name: dto.name,
        description: dto.description,
        about: dto.about,
        viewUrl: dto.view_url,
        creatorId: dto.creator_id,
        isNewTemplate: dto.is_new_template ?? false,
        isFeatured: dto.is_featured ?? false,
        categories: dto.category_ids?.length
          ? {
              create: dto.category_ids.map((catId) => ({
                category: { connect: { categoryId: catId } },
              })),
            }
          : undefined,
      },
      include: {
        creator: true,
        categories: { include: { category: true } },
      },
    });
    return template;
  }

  async listTemplates(query: GetTemplatesQueryDto) {
    const where: any = {};
    if (query.is_featured !== undefined) {
      where.isFeatured = query.is_featured;
    }
    if (query.is_new_template !== undefined) {
      where.isNewTemplate = query.is_new_template;
    }
    if (query.name_contains) {
      where.name = { contains: query.name_contains, mode: 'insensitive' };
    }
    if (query.category_id) {
      where.categories = {
        some: { categoryId: query.category_id },
      };
    }

    const templates = await this.prisma.templateView.findMany({
      where,
      include: {
        creator: true,
        categories: { include: { category: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return templates;
  }

  async getTemplate(viewId: string) {
    const template = await this.prisma.templateView.findUnique({
      where: { viewId },
      include: {
        creator: true,
        categories: { include: { category: true } },
      },
    });
    if (!template) {
      throw new NotFoundException('Template not found');
    }
    return template;
  }

  async updateTemplate(viewId: string, dto: UpdateTemplateDto) {
    await this.getTemplate(viewId);
    return this.prisma.templateView.update({
      where: { viewId },
      data: {
        name: dto.name,
        description: dto.description,
        about: dto.about,
        viewUrl: dto.view_url,
        creatorId: dto.creator_id,
        isNewTemplate: dto.is_new_template,
        isFeatured: dto.is_featured,
      },
      include: {
        creator: true,
        categories: { include: { category: true } },
      },
    });
  }

  async deleteTemplate(viewId: string) {
    await this.getTemplate(viewId);
    return this.prisma.templateView.delete({
      where: { viewId },
    });
  }

  async getHomepage(perCount = 10) {
    const [featured, newTemplates, categories] = await Promise.all([
      this.prisma.templateView.findMany({
        where: { isFeatured: true },
        take: perCount,
        include: { creator: true, categories: { include: { category: true } } },
      }),
      this.prisma.templateView.findMany({
        where: { isNewTemplate: true },
        take: perCount,
        include: { creator: true, categories: { include: { category: true } } },
      }),
      this.prisma.templateCategory.findMany({
        take: perCount,
        include: {
          templates: {
            take: 4,
            include: { template: { include: { creator: true } } },
          },
        },
      }),
    ]);

    return {
      featured_templates: featured,
      new_templates: newTemplates,
      categories,
    };
  }
}
