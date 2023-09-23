import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';

import { ProductService } from './product.service';
import { OrganizationService } from '../organizations/organization.service';
import { CategoryService } from '../categories/category.service';

import { Product } from './product.entity';
import { NotFoundException } from '@nestjs/common'; // Import the NotFoundException

import { ApiTags, ApiResponse, ApiOperation, ApiBody } from '@nestjs/swagger';
import { EmployeeStatusGuard } from './employee-status.guard';
import { EmployeeStatus } from './employee-status.decorator';

@ApiTags('products')
@Controller('products')
export class ProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly categoryService: CategoryService,
    private readonly organizationService: OrganizationService,
    private readonly amqpConnection: AmqpConnection
  ) {}

  @ApiOperation({ summary: 'Get all products' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Get()
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
  ) {
    const { data, total } = await this.productService.findAll(page, limit, search);
    return { data, total };
  }

  @ApiOperation({ summary: 'Get a product by id' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Product> {
    return this.productService.findOne(id);
  }

  @ApiOperation({ summary: 'Get a product by SKU' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Get('sku/:sku/:organizationId')
  async findSingle(@Param('sku') sku: string, @Param('organizationId') organizationId: string): Promise<Product> {
    return this.productService.findBySKU(sku, organizationId);
  }

  @ApiOperation({ summary: 'Create a product' })
  @ApiBody({ type: Product })
  @ApiResponse({ status: 201, description: 'Success', type: Product })
  @Post()
  @EmployeeStatus(['Working'])
  @UseGuards(EmployeeStatusGuard)
  async create(@Body() productData: Product): Promise<Product> {
    return this.productService.create(productData);
  }

  @ApiOperation({ summary: 'Update a product' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Patch(':id')
  @EmployeeStatus(['Working'])
  @UseGuards(EmployeeStatusGuard)
  async update(@Param('id') id: string, @Body() updatedProductData: Product): Promise<Product> {
    return this.productService.update(id, updatedProductData);
  }

  @ApiOperation({ summary: 'Delete a product' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Delete(':id')
  @EmployeeStatus(['Working'])
  @UseGuards(EmployeeStatusGuard)
  async remove(@Param('id') id: string): Promise<void> {
    return this.productService.remove(id);
  }

  @ApiOperation({ summary: 'Find products related to an organization' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Get('orgRelated/:id')
  async findOrgProduct(
    @Param('id') organizationId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
  ): Promise<any> {
    const organization = await this.organizationService.findOne(organizationId);

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    const { data, total } = await this.productService.findOrgProduct(organization, page, limit, search);
    return { data, total };
  }

  @ApiOperation({ summary: 'Find products related to a category' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Get('categoryRelated/:id')
  async findCategoryProduct(
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

    const { data, total } = await this.productService.findCategoryProduct(category, page, limit, search, type);
    return { data, total };
  }

  @ApiOperation({ summary: 'Find the latest products related to an organization' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Get('latestOrgRelated/:id')
  async findLatestOrgProduct(
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

    const { data, total } = await this.productService.findLatestOrgProduct(organization, page, limit, search, type);
    return { data, total };
  }
}
