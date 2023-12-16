import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';

import { BucketService } from './bucket.service';
import { OrganizationService } from '../organizations/organization.service';

import { Bucket } from './bucket.entity';
import { NotFoundException } from '@nestjs/common'; // Import the NotFoundException

import { ApiTags, ApiResponse, ApiOperation, ApiBody } from '@nestjs/swagger';

import { AuthStatus } from '../auth-status.decorator';
import { AuthStatusGuard } from '../auth-status.guard';
import { EmployeeStatusGuard } from './employee-status.guard';
import { EmployeeStatus } from './employee-status.decorator';
import { BucketEvent, CRUDType, ChargeType } from './bucket.event';

@ApiTags('buckets')
@Controller('buckets')
export class BucketController {
  constructor(
    private readonly bucketService: BucketService,
    private readonly organizationService: OrganizationService,
    private readonly amqpConnection: AmqpConnection
  ) {}

  @ApiOperation({ summary: 'Get all buckets' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Get()
  async findAll(
    @Req() req: Request,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
  ) {
    const { data, total } = await this.bucketService.findAll(page, limit, search);
    
    const payload = { data, total };

    try {
      const event = new BucketEvent();
      event.url = req.url;
      event.method = req.method;
      event.headers = req.headers;
      event.body = req.body;
      event.crud = CRUDType.READ;
      event.charge = ChargeType.WEBMASTER;
      event.payload = payload;
      event.eventAt = new Date().toISOString();
      this.amqpConnection.publish('analytics', 'buckets.findAll', event);
    } catch (e) {
      console.log(e)
    }

    return payload;
  }

  @ApiOperation({ summary: 'Get a bucket by id' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Get(':id')
  async findOne(
    @Req() req: Request,
    @Param('id') id: string
  ): Promise<Bucket> {
    const payload = await this.bucketService.findOne(id);

    try {
      const event = new BucketEvent();
      event.url = req.url;
      event.method = req.method;
      event.headers = req.headers;
      event.body = req.body;
      event.crud = CRUDType.READ;
      event.charge = ChargeType.ORGANIZATION;
      event.organizationId = payload.organization.id;
      event.payload = payload;
      event.eventAt = new Date().toISOString();
      this.amqpConnection.publish('analytics', 'buckets.findOne', event);
    } catch (e) {
      console.log(e)
    }

    return payload;
  }

  @ApiOperation({ summary: 'Get a bucket by name' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Get('name/:name/:organizationId')
  async findSingle(
    @Req() req: Request,
    @Param('name') name: string,
    @Param('organizationId') organizationId: string
  ): Promise<Bucket> {
    const payload = await this.bucketService.findByName(name, organizationId);

    try {
      const event = new BucketEvent();
      event.url = req.url;
      event.method = req.method;
      event.headers = req.headers;
      event.body = req.body;
      event.crud = CRUDType.READ;
      event.charge = ChargeType.ORGANIZATION;
      event.organizationId = organizationId;
      event.payload = payload;
      event.eventAt = new Date().toISOString();
      this.amqpConnection.publish('analytics', 'buckets.findSingle', event);
    } catch (e) {
      console.log(e)
    }

    return payload;
  }

  @ApiOperation({ summary: 'Create a bucket' })
  @ApiBody({ type: Bucket })
  @ApiResponse({ status: 201, description: 'Success', type: Bucket })
  @Post()
  @AuthStatus(['Verified'])
  @EmployeeStatus(['Working'])
  @UseGuards(AuthStatusGuard, EmployeeStatusGuard)
  async create(
    @Req() req: Request,
    @Body() bucketData: Bucket
  ): Promise<Bucket> {
    const payload = await this.bucketService.create(bucketData);
    const record = await this.bucketService.findOne(payload.id);

    try {
      const event = new BucketEvent();
      event.url = req.url;
      event.method = req.method;
      event.headers = req.headers;
      event.body = req.body;
      event.crud = CRUDType.CREATE;
      event.charge = ChargeType.ORGANIZATION;
      event.organizationId = record.organization.id;
      event.payload = payload;
      event.eventAt = new Date().toISOString();
      this.amqpConnection.publish('analytics', 'buckets.create', event);
    } catch (e) {
      console.log(e)
    }

    return payload;
  }

  @ApiOperation({ summary: 'Update a bucket' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Patch(':id')
  @AuthStatus(['Verified'])
  @EmployeeStatus(['Working'])
  @UseGuards(AuthStatusGuard, EmployeeStatusGuard)
  async update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() updatedBucketData: Bucket
  ): Promise<Bucket> {
    const record = await this.bucketService.findOne(id);
    const payload = await this.bucketService.update(id, updatedBucketData);

    try {
      const event = new BucketEvent();
      event.url = req.url;
      event.method = req.method;
      event.headers = req.headers;
      event.body = req.body;
      event.crud = CRUDType.UPDATE;
      event.charge = ChargeType.ORGANIZATION;
      event.organizationId = record.organization.id;
      event.payload = payload;
      event.eventAt = new Date().toISOString();
      this.amqpConnection.publish('analytics', 'buckets.update', event);
    } catch (e) {
      console.log(e)
    }

    return payload;
  }

  @ApiOperation({ summary: 'Delete a bucket' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Delete(':id')
  @AuthStatus(['Verified'])
  @EmployeeStatus(['Working'])
  @UseGuards(AuthStatusGuard, EmployeeStatusGuard)
  async remove(
    @Req() req: Request,
    @Param('id') id: string
  ): Promise<void> {
    const record = await this.bucketService.findOne(id);
    const payload = await this.bucketService.remove(id);

    try {
      const event = new BucketEvent();
      event.url = req.url;
      event.method = req.method;
      event.headers = req.headers;
      event.body = req.body;
      event.crud = CRUDType.DELETE;
      event.charge = ChargeType.ORGANIZATION;
      event.organizationId = record.organization.id;
      event.payload = payload;
      event.eventAt = new Date().toISOString();
      this.amqpConnection.publish('analytics', 'buckets.remove', event);
    } catch (e) {
      console.log(e)
    }

    return payload;
  }

  @ApiOperation({ summary: 'Find buckets related to an organization' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Get('orgRelated/:id')
  async findOrgBucket(
    @Req() req: Request,
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
    const payload = { data, total };

    try {
      const event = new BucketEvent();
      event.url = req.url;
      event.method = req.method;
      event.headers = req.headers;
      event.body = req.body;
      event.crud = CRUDType.READ;
      event.charge = ChargeType.ORGANIZATION;
      event.organizationId = organizationId;
      event.payload = payload;
      event.eventAt = new Date().toISOString();
      this.amqpConnection.publish('analytics', 'buckets.findOrgBucket', event);
    } catch (e) {
      console.log(e)
    }

    return payload;
  }
}
