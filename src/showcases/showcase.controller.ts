import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common';

import { ShowcaseService } from './showcase.service';
import { OrganizationService } from '../organizations/organization.service';
import { CategoryService } from '../categories/category.service';

import { Showcase } from './showcase.entity';
import { NotFoundException } from '@nestjs/common'; // Import the NotFoundException

import { ApiTags, ApiResponse, ApiOperation, ApiBody } from '@nestjs/swagger';

@ApiTags('showcases')
@Controller('showcases')
export class ShowcaseController {
  constructor(
    private readonly showcaseService: ShowcaseService,
    private readonly categoryService: CategoryService,
    private readonly organizationService: OrganizationService,
    private readonly amqpConnection: AmqpConnection
  ) {}

  @ApiOperation({ summary: 'Get all showcases' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Get()
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
  ) {
    const { data, total } = await this.showcaseService.findAll(page, limit, search);
    return { data, total };
  }

  @ApiOperation({ summary: 'Get a showcase by id' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Showcase> {
    return this.showcaseService.findOne(id);
  }

  @ApiOperation({ summary: 'Get a showcase by SKU' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Get('sku/:sku/:organizationId')
  async findSingle(@Param('sku') sku: string, @Param('organizationId') organizationId: string): Promise<Showcase> {
    return this.showcaseService.findBySKU(sku, organizationId);
  }

  @ApiOperation({ summary: 'Create a showcase' })
  @ApiBody({ type: Showcase })
  @ApiResponse({ status: 201, description: 'Success', type: Showcase })
  @Post()
  async create(@Body() showcaseData: Showcase): Promise<Showcase> {
    return this.showcaseService.create(showcaseData);
  }

  @ApiOperation({ summary: 'Update a showcase' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updatedShowcaseData: Showcase): Promise<Showcase> {
    return this.showcaseService.update(id, updatedShowcaseData);
  }

  @ApiOperation({ summary: 'Delete a showcase' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.showcaseService.remove(id);
  }

  @ApiOperation({ summary: 'Find showcases related to an organization' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Get('orgRelated/:id')
  async findOrgShowcase(
    @Param('id') organizationId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
  ): Promise<any> {
    const organization = await this.organizationService.findOne(organizationId);

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    const { data, total } = await this.showcaseService.findOrgShowcase(organization, page, limit, search);
    return { data, total };
  }

  @ApiOperation({ summary: 'Find showcases related to a category' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Get('categoryRelated/:id')
  async findCategoryShowcase(
    @Param('id') categoryId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
    @Query('type') type?: string,
  ): Promise<any> {
    const category = await this.categoryService.findOne(categoryId);

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const { data, total } = await this.showcaseService.findCategoryShowcase(category, page, limit, search, type);
    return { data, total };
  }

  @ApiOperation({ summary: 'Find the latest showcases related to an organization' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Get('latestOrgRelated/:id')
  async findLatestOrgShowcase(
    @Param('id') organizationId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
    @Query('type') type?: string,
  ): Promise<any> {
    const organization = await this.organizationService.findOne(organizationId);

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    const { data, total } = await this.showcaseService.findLatestOrgShowcase(organization, page, limit, search, type);
    return { data, total };
  }
}
