import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';

import { AnalyticService } from './analytic.service';
import { OrganizationService } from '../organizations/organization.service';

import { Analytic } from './analytic.entity';
import { NotFoundException } from '@nestjs/common'; // Import the NotFoundException

import { ApiTags, ApiResponse, ApiOperation, ApiBody } from '@nestjs/swagger';

import { AuthStatus } from '../auth-status.decorator';
import { AuthStatusGuard } from '../auth-status.guard';
import { EmployeeStatusGuard } from './employee-status.guard';
import { EmployeeStatus } from './employee-status.decorator';
import { AnalyticEvent, CRUDType, ChargeType } from './analytic.event';

@ApiTags('analytics')
@Controller('analytics')
export class AnalyticController {
  constructor(
    private readonly analyticService: AnalyticService,
    private readonly organizationService: OrganizationService,
    private readonly amqpConnection: AmqpConnection
  ) {}

  @ApiOperation({ summary: 'Get all analytics' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Get()
  async findAll(
    @Req() req: Request,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
  ) {
    const { data, total } = await this.analyticService.findAll(page, limit, search);
    
    const payload = { data, total };

    try {
      const event = new AnalyticEvent();
      event.url = req.url;
      event.method = req.method;
      event.headers = req.headers;
      event.body = req.body;
      event.crud = CRUDType.READ;
      event.charge = ChargeType.WEBMASTER;
      event.payload = payload;
      event.eventAt = new Date().toISOString();
      this.amqpConnection.publish('analytics', 'analytics.findAll', event);
    } catch (e) {
      console.log(e)
    }

    return payload;
  }

  @ApiOperation({ summary: 'Get a analytic by id' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Get(':id')
  async findOne(
    @Req() req: Request,
    @Param('id') id: string
  ): Promise<Analytic> {
    const payload = await this.analyticService.findOne(id);

    try {
      const event = new AnalyticEvent();
      event.url = req.url;
      event.method = req.method;
      event.headers = req.headers;
      event.body = req.body;
      event.crud = CRUDType.READ;
      event.charge = ChargeType.ORGANIZATION;
      event.organizationId = payload.organization.id;
      event.payload = payload;
      event.eventAt = new Date().toISOString();
      this.amqpConnection.publish('analytics', 'analytics.findOne', event);
    } catch (e) {
      console.log(e)
    }

    return payload;
  }

  @ApiOperation({ summary: 'Create a analytic' })
  @ApiBody({ type: Analytic })
  @ApiResponse({ status: 201, description: 'Success', type: Analytic })
  @Post()
  @AuthStatus(['Verified'])
  @EmployeeStatus(['Working'])
  @UseGuards(AuthStatusGuard, EmployeeStatusGuard)
  async create(
    @Req() req: Request,
    @Body() analyticData: Analytic
  ): Promise<Analytic> {
    const payload = await this.analyticService.create(analyticData);
    const record = await this.analyticService.findOne(payload.id);

    try {
      const event = new AnalyticEvent();
      event.url = req.url;
      event.method = req.method;
      event.headers = req.headers;
      event.body = req.body;
      event.crud = CRUDType.CREATE;
      event.charge = ChargeType.ORGANIZATION;
      event.organizationId = record.organization.id;
      event.payload = payload;
      event.eventAt = new Date().toISOString();
      this.amqpConnection.publish('analytics', 'analytics.create', event);
    } catch (e) {
      console.log(e)
    }

    return payload;
  }

  @ApiOperation({ summary: 'Update a analytic' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Patch(':id')
  @AuthStatus(['Verified'])
  @EmployeeStatus(['Working'])
  @UseGuards(AuthStatusGuard, EmployeeStatusGuard)
  async update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() updatedAnalyticData: Analytic
  ): Promise<Analytic> {
    const record = await this.analyticService.findOne(id);
    const payload = await this.analyticService.update(id, updatedAnalyticData);

    try {
      const event = new AnalyticEvent();
      event.url = req.url;
      event.method = req.method;
      event.headers = req.headers;
      event.body = req.body;
      event.crud = CRUDType.UPDATE;
      event.charge = ChargeType.ORGANIZATION;
      event.organizationId = record.organization.id;
      event.payload = payload;
      event.eventAt = new Date().toISOString();
      this.amqpConnection.publish('analytics', 'analytics.update', event);
    } catch (e) {
      console.log(e)
    }

    return payload;
  }

  @ApiOperation({ summary: 'Delete a analytic' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Delete(':id')
  @AuthStatus(['Verified'])
  @EmployeeStatus(['Working'])
  @UseGuards(AuthStatusGuard, EmployeeStatusGuard)
  async remove(
    @Req() req: Request,
    @Param('id') id: string
  ): Promise<void> {
    const record = await this.analyticService.findOne(id);
    const payload = await this.analyticService.remove(id);

    try {
      const event = new AnalyticEvent();
      event.url = req.url;
      event.method = req.method;
      event.headers = req.headers;
      event.body = req.body;
      event.crud = CRUDType.DELETE;
      event.charge = ChargeType.ORGANIZATION;
      event.organizationId = record.organization.id;
      event.payload = payload;
      event.eventAt = new Date().toISOString();
      this.amqpConnection.publish('analytics', 'analytics.remove', event);
    } catch (e) {
      console.log(e)
    }

    return payload;
  }

  @ApiOperation({ summary: 'Find analytics related to an organization' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Get('orgRelated/:id')
  async findOrgAnalytic(
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

    const { data, total } = await this.analyticService.findOrgAnalytic(organization, page, limit, search);
    const payload = { data, total };

    try {
      const event = new AnalyticEvent();
      event.url = req.url;
      event.method = req.method;
      event.headers = req.headers;
      event.body = req.body;
      event.crud = CRUDType.READ;
      event.charge = ChargeType.ORGANIZATION;
      event.organizationId = organizationId;
      event.payload = payload;
      event.eventAt = new Date().toISOString();
      this.amqpConnection.publish('analytics', 'analytics.findOrgBucket', event);
    } catch (e) {
      console.log(e)
    }

    return payload;
  }
}
