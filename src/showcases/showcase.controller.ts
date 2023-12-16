import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';

import { ShowcaseService } from './showcase.service';
import { OrganizationService } from '../organizations/organization.service';

import { Showcase } from './showcase.entity';
import { NotFoundException } from '@nestjs/common'; // Import the NotFoundException

import { ApiTags, ApiResponse, ApiOperation, ApiBody } from '@nestjs/swagger';

import { AuthStatus } from '../auth-status.decorator';
import { AuthStatusGuard } from '../auth-status.guard';
import { EmployeeStatusGuard } from './employee-status.guard';
import { EmployeeStatus } from './employee-status.decorator';
import { ShowcaseEvent, CRUDType, ChargeType } from './showcase.event';

@ApiTags('showcases')
@Controller('showcases')
export class ShowcaseController {
  constructor(
    private readonly showcaseService: ShowcaseService,
    private readonly organizationService: OrganizationService,
    private readonly amqpConnection: AmqpConnection
  ) {}

  @ApiOperation({ summary: 'Get all showcases' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Get()
  async findAll(
    @Req() req: Request,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
  ) {
    const { data, total } = await this.showcaseService.findAll(page, limit, search);
    const payload = { data, total };

    try {
      const event = new ShowcaseEvent();
      event.url = req.url;
      event.method = req.method;
      event.headers = req.headers;
      event.body = req.body;
      event.crud = CRUDType.READ;
      event.charge = ChargeType.WEBMASTER;
      event.payload = payload;
      event.eventAt = new Date().toISOString();
      this.amqpConnection.publish('analytics', 'showcases.findAll', event);
    } catch (e) {
      console.log(e)
    }
    
    return payload;
  }

  @ApiOperation({ summary: 'Get a showcase by id' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Get(':id')
  async findOne(
    @Req() req: Request,
    @Param('id') id: string
  ): Promise<Showcase> {
    const payload = await this.showcaseService.findOne(id);

    try {
      const event = new ShowcaseEvent();
      event.url = req.url;
      event.method = req.method;
      event.headers = req.headers;
      event.body = req.body;
      event.crud = CRUDType.READ;
      event.charge = ChargeType.ORGANIZATION;
      event.organizationId = payload.organization.id;
      event.payload = payload;
      event.eventAt = new Date().toISOString();
      this.amqpConnection.publish('analytics', 'showcases.findOne', event);
    } catch (e) {
      console.log(e)
    }
    
    return payload;
  }

  @ApiOperation({ summary: 'Create a showcase' })
  @ApiBody({ type: Showcase })
  @ApiResponse({ status: 201, description: 'Success', type: Showcase })
  @Post()
  @AuthStatus(['Verified'])
  @EmployeeStatus(['Working'])
  @UseGuards(AuthStatusGuard, EmployeeStatusGuard)
  async create(
    @Req() req: Request,
    @Body() showcaseData: Showcase
  ): Promise<Showcase> {
    const payload = await this.showcaseService.create(showcaseData);
    const record = await this.showcaseService.findOne(payload.id);

    try {
      const event = new ShowcaseEvent();
      event.url = req.url;
      event.method = req.method;
      event.headers = req.headers;
      event.body = req.body;
      event.crud = CRUDType.CREATE;
      event.charge = ChargeType.ORGANIZATION;
      event.organizationId = record.organization.id;
      event.payload = payload;
      event.eventAt = new Date().toISOString();
      this.amqpConnection.publish('analytics', 'showcases.create', event);
    } catch (e) {
      console.log(e)
    }
    
    return payload;
  }

  @ApiOperation({ summary: 'Update a showcase' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Patch(':id')
  @AuthStatus(['Verified'])
  @EmployeeStatus(['Working'])
  @UseGuards(AuthStatusGuard, EmployeeStatusGuard)
  async update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() updatedShowcaseData: Showcase
  ): Promise<Showcase> {
    const record = await this.showcaseService.findOne(id);
    const payload = await this.showcaseService.update(id, updatedShowcaseData);

    try {
      const event = new ShowcaseEvent();
      event.url = req.url;
      event.method = req.method;
      event.headers = req.headers;
      event.body = req.body;
      event.crud = CRUDType.UPDATE;
      event.charge = ChargeType.ORGANIZATION;
      event.organizationId = record.organization.id;
      event.payload = payload;
      event.eventAt = new Date().toISOString();
      this.amqpConnection.publish('analytics', 'showcases.update', event);
    } catch (e) {
      console.log(e)
    }
    
    return payload;
  }

  @ApiOperation({ summary: 'Delete a showcase' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Delete(':id')
  @AuthStatus(['Verified'])
  @EmployeeStatus(['Working'])
  @UseGuards(AuthStatusGuard, EmployeeStatusGuard)
  async remove(
    @Req() req: Request,
    @Param('id') id: string
  ): Promise<void> {
    const record = await this.showcaseService.findOne(id);
    const payload = await this.showcaseService.remove(id);

    try {
      const event = new ShowcaseEvent();
      event.url = req.url;
      event.method = req.method;
      event.headers = req.headers;
      event.body = req.body;
      event.crud = CRUDType.DELETE;
      event.charge = ChargeType.ORGANIZATION;
      event.organizationId = record.organization.id;
      event.payload = payload;
      event.eventAt = new Date().toISOString();
      this.amqpConnection.publish('analytics', 'showcases.remove', event);
    } catch (e) {
      console.log(e)
    }
    
    return payload;
  }

  @ApiOperation({ summary: 'Find showcases related to an organization' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Get('orgRelated/:id')
  async findOrgShowcase(
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

    const { data, total } = await this.showcaseService.findOrgShowcase(organization, page, limit, search);
    const payload = { data, total };

    try {
      const event = new ShowcaseEvent();
      event.url = req.url;
      event.method = req.method;
      event.headers = req.headers;
      event.body = req.body;
      event.crud = CRUDType.READ;
      event.charge = ChargeType.ORGANIZATION;
      event.organizationId = organizationId;
      event.payload = payload;
      event.eventAt = new Date().toISOString();
      this.amqpConnection.publish('analytics', 'showcases.findOrgShowcase', event);
    } catch (e) {
      console.log(e)
    }
    
    return payload;
  }

  @ApiOperation({ summary: 'Find the latest showcases related to an organization' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Get('latestOrgRelated/:id')
  async findLatestOrgShowcase(
    @Req() req: Request,
    @Param('id') organizationId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string
  ): Promise<any> {
    const organization = await this.organizationService.findOne(organizationId);

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    const { data, total } = await this.showcaseService.findLatestOrgShowcase(organization, page, limit, search);
    const payload = { data, total };

    try {
      const event = new ShowcaseEvent();
      event.url = req.url;
      event.method = req.method;
      event.headers = req.headers;
      event.body = req.body;
      event.crud = CRUDType.READ;
      event.charge = ChargeType.ORGANIZATION;
      event.organizationId = organizationId;
      event.payload = payload;
      event.eventAt = new Date().toISOString();
      this.amqpConnection.publish('analytics', 'showcases.findLatestOrgShowcase', event);
    } catch (e) {
      console.log(e)
    }
    
    return payload;
  }
}
