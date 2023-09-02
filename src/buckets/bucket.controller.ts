import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common';

import { BucketService } from './bucket.service';
import { OrganizationService } from '../organizations/organization.service';
import { CategoryService } from '../categories/category.service';

import { Bucket } from './bucket.entity';
import { NotFoundException } from '@nestjs/common'; // Import the NotFoundException

import { ApiTags, ApiResponse, ApiOperation, ApiBody } from '@nestjs/swagger';

@ApiTags('buckets')
@Controller('buckets')
export class BucketController {
  constructor(
    private readonly bucketService: BucketService,
    private readonly categoryService: CategoryService,
    private readonly organizationService: OrganizationService,
    private readonly amqpConnection: AmqpConnection
  ) {}

  @ApiOperation({ summary: 'Get all buckets' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Get()
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
  ) {
    const { data, total } = await this.bucketService.findAll(page, limit, search);
    return { data, total };
  }

  @ApiOperation({ summary: 'Get a bucket by id' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Bucket> {
    return this.bucketService.findOne(id);
  }

  @ApiOperation({ summary: 'Get a bucket by name' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Get('name/:name/:organizationId')
  async findSingle(@Param('name') name: string, @Param('organizationId') organizationId: string): Promise<Bucket> {
    return this.bucketService.findByName(name, organizationId);
  }

  @ApiOperation({ summary: 'Create a bucket' })
  @ApiBody({ type: Bucket })
  @ApiResponse({ status: 201, description: 'Success', type: Bucket })
  @Post()
  async create(@Body() bucketData: Bucket): Promise<Bucket> {
    return this.bucketService.create(bucketData);
  }

  @ApiOperation({ summary: 'Update a bucket' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updatedBucketData: Bucket): Promise<Bucket> {
    return this.bucketService.update(id, updatedBucketData);
  }

  @ApiOperation({ summary: 'Delete a bucket' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.bucketService.remove(id);
  }

  @ApiOperation({ summary: 'Find buckets related to an organization' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Get('orgRelated/:id')
  async findOrgBucket(
    @Param('id') organizationId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
  ): Promise<any> {
    const organization = await this.organizationService.findOne(organizationId);

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    const { data, total } = await this.bucketService.findOrgBucket(organization, page, limit, search);
    return { data, total };
  }
}
