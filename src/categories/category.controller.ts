import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common';

import { CategoryService } from './category.service';
import { OrganizationService } from '../organizations/organization.service';

import { Category } from './category.entity';
import { NotFoundException } from '@nestjs/common'; // Import the NotFoundException

import { ApiTags, ApiResponse, ApiOperation, ApiBody } from '@nestjs/swagger';

@ApiTags('categories')
@Controller('categories')
export class CategoryController {
  constructor(
    private readonly categoryService: CategoryService,
    private readonly organizationService: OrganizationService,
    private readonly amqpConnection: AmqpConnection
  ) {}

  @ApiOperation({ summary: 'Get all categories' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Get()
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
  ) {
    const { data, total } = await this.categoryService.findAll(page, limit, search);
    return { data, total };
  }

  @ApiOperation({ summary: 'Get a category by id' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Category> {
    return this.categoryService.findOne(id);
  }

  @ApiOperation({ summary: 'Get a category by URL slug' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Get('slug/:slug/:organizationId')
  async findSingle(@Param('slug') slug: string, @Param('organizationId') organizationId: string): Promise<Category> {
    return this.categoryService.findBySlug(slug, organizationId);
  }

  @ApiOperation({ summary: 'Create a category' })
  @ApiBody({ type: Category })
  @ApiResponse({ status: 201, description: 'Success', type: Category })
  @Post()
  async create(@Body() categoryData: Category): Promise<Category> {
    return this.categoryService.create(categoryData);
  }

  @ApiOperation({ summary: 'Update a category' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updatedCategoryData: Category): Promise<Category> {
    return this.categoryService.update(id, updatedCategoryData);
  }

  @ApiOperation({ summary: 'Delete a category' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.categoryService.remove(id);
  }

  @ApiOperation({ summary: 'Find categories related to an organization' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Get('orgRelated/:id')
  async findOrgCategory(
    @Param('id') organizationId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
  ): Promise<any> {
    const organization = await this.organizationService.findOne(organizationId);

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    const { data, total } = await this.categoryService.findOrgCategory(organization, page, limit, search);
    return { data, total };
  }

  @ApiOperation({ summary: 'Find categories related to an organization by hostname' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Get('hostname/:hostname')
  async findOrgCategoryByHostname(
    @Param('hostname') hostname: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
  ): Promise<any> {
    const organization = await this.organizationService.findByHostname(hostname);

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    const { data, total } = await this.categoryService.findOrgCategory(organization, page, limit, search);
    return { data, total };
  }

  @ApiOperation({ summary: 'Find sub categories related to a category' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Get('categoryRelated/:id')
  async findSubCategories(
    @Param('id') categoryId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
  ): Promise<any> {
    const category = await this.categoryService.findOne(categoryId);

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const { data, total } = await this.categoryService.findSubCategories(category, page, limit, search);
    return { data, total };
  }
}
