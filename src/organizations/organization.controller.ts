import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';

import { OrganizationService } from './organization.service';
import { UserService } from 'src/users/user.service';

import { Organization } from './organization.entity';
import { NotFoundException } from '@nestjs/common'; // Import the NotFoundException

import { ApiTags, ApiResponse, ApiOperation, ApiBody } from '@nestjs/swagger';

import { AuthStatus } from '../auth-status.decorator';
import { AuthStatusGuard } from '../auth-status.guard';
import { EmployeeStatusGuard } from './employee-status.guard';
import { EmployeeStatus } from './employee-status.decorator';
import { OrganizationEvent, CRUDType, ChargeType } from './organization.event';

@ApiTags('organizations')
@Controller('organizations')
export class OrganizationController {
  constructor(
    private readonly organizationService: OrganizationService,
    private readonly userService: UserService,
    private readonly amqpConnection: AmqpConnection
  ) {}

  @ApiOperation({ summary: 'Get all organizations' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Get()
  async findAll(
    @Req() req: Request,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
  ) {
    const { data, total } = await this.organizationService.findAll(page, limit, search);
    const payload = { data, total };

    try {
      const event = new OrganizationEvent();
      event.url = req.url;
      event.method = req.method;
      event.headers = req.headers;
      event.body = req.body;
      event.crud = CRUDType.READ;
      event.charge = ChargeType.WEBMASTER;
      event.payload = payload;
      event.eventAt = new Date().toISOString();
      this.amqpConnection.publish('analytics', 'organizations.findAll', event);
    } catch (e) {
      console.log(e)
    }
    
    return payload;
  }

  @ApiOperation({ summary: 'Get an organization by id' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Get(':id')
  async findOne(
    @Req() req: Request,
    @Param('id') id: string
  ): Promise<Organization> {
    const payload = await this.organizationService.findOne(id);

    try {
      const event = new OrganizationEvent();
      event.url = req.url;
      event.method = req.method;
      event.headers = req.headers;
      event.body = req.body;
      event.crud = CRUDType.READ;
      event.charge = ChargeType.ORGANIZATION;
      event.organizationId = payload.id;
      event.payload = payload;
      event.eventAt = new Date().toISOString();
      this.amqpConnection.publish('analytics', 'organizations.findOne', event);
    } catch (e) {
      console.log(e)
    }
    
    return payload;
  }

  @ApiOperation({ summary: 'Get an organization by orgname' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Get('orgname/:orgname')
  async findSingle(
    @Req() req: Request,
    @Param('orgname') orgname: string
  ): Promise<Organization> {
    const payload = await this.organizationService.findByOrgname(orgname);

    try {
      const event = new OrganizationEvent();
      event.url = req.url;
      event.method = req.method;
      event.headers = req.headers;
      event.body = req.body;
      event.crud = CRUDType.READ;
      event.charge = ChargeType.ORGANIZATION;
      event.organizationId = payload.id;
      event.payload = payload;
      event.eventAt = new Date().toISOString();
      this.amqpConnection.publish('analytics', 'organizations.findSingle', event);
    } catch (e) {
      console.log(e)
    }
    
    return payload;
  }

  @ApiOperation({ summary: 'Get an organization by frontendHostname' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Get('frontendHostname/:frontendHostname')
  async findFrontendHostname(
    @Req() req: Request,
    @Param('frontendHostname') frontendHostname: string
  ): Promise<Organization> {
    const payload = await this.organizationService.findByFrontendHostname(frontendHostname);

    try {
      const event = new OrganizationEvent();
      event.url = req.url;
      event.method = req.method;
      event.headers = req.headers;
      event.body = req.body;
      event.crud = CRUDType.READ;
      event.charge = ChargeType.ORGANIZATION;
      event.organizationId = payload.id;
      event.payload = payload;
      event.eventAt = new Date().toISOString();
      this.amqpConnection.publish('analytics', 'organizations.findFrontendHostname', event);
    } catch (e) {
      console.log(e)
    }
    
    return payload;
  }

  @ApiOperation({ summary: 'Get an organization by backendHostname' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Get('backendHostname/:backendHostname')
  async findBackendHostname(
    @Req() req: Request,
    @Param('backendHostname') backendHostname: string
  ): Promise<Organization> {
    const payload = await this.organizationService.findByBackendHostname(backendHostname);

    try {
      const event = new OrganizationEvent();
      event.url = req.url;
      event.method = req.method;
      event.headers = req.headers;
      event.body = req.body;
      event.crud = CRUDType.READ;
      event.charge = ChargeType.ORGANIZATION;
      event.organizationId = payload.id;
      event.payload = payload;
      event.eventAt = new Date().toISOString();
      this.amqpConnection.publish('analytics', 'organizations.findBackendHostname', event);
    } catch (e) {
      console.log(e)
    }
    
    return payload;
  }

  @ApiOperation({ summary: 'Get an organization by homeHostname' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Get('homeHostname/:homeHostname')
  async findMainHome(
    @Req() req: Request,
    @Param('homeHostname') homeHostname: string
  ): Promise<Organization> {
    const payload = await this.organizationService.findByHomeHostname(homeHostname);

    try {
      const event = new OrganizationEvent();
      event.url = req.url;
      event.method = req.method;
      event.headers = req.headers;
      event.body = req.body;
      event.crud = CRUDType.READ;
      event.charge = ChargeType.ORGANIZATION;
      event.organizationId = payload.id;
      event.payload = payload;
      event.eventAt = new Date().toISOString();
      this.amqpConnection.publish('analytics', 'organizations.findMainHome', event);
    } catch (e) {
      console.log(e)
    }
    
    return payload;
  }

  @ApiOperation({ summary: 'Get an organization by erpHostname' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Get('erpHostname/:erpHostname')
  async findMainErp(
    @Req() req: Request,
    @Param('erpHostname') erpHostname: string
  ): Promise<Organization> {
    const payload = await this.organizationService.findByErpHostname(erpHostname);

    try {
      const event = new OrganizationEvent();
      event.url = req.url;
      event.method = req.method;
      event.headers = req.headers;
      event.body = req.body;
      event.crud = CRUDType.READ;
      event.charge = ChargeType.ORGANIZATION;
      event.organizationId = payload.id;
      event.payload = payload;
      event.eventAt = new Date().toISOString();
      this.amqpConnection.publish('analytics', 'organizations.findMainErp', event);
    } catch (e) {
      console.log(e)
    }
    
    return payload;
  }

  @ApiOperation({ summary: 'Get an organization by tubeHostname' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Get('tubeHostname/:tubeHostname')
  async findMainTube(
    @Req() req: Request,
    @Param('tubeHostname') tubeHostname: string
  ): Promise<Organization> {
    const payload = await this.organizationService.findByTubeHostname(tubeHostname);

    try {
      const event = new OrganizationEvent();
      event.url = req.url;
      event.method = req.method;
      event.headers = req.headers;
      event.body = req.body;
      event.crud = CRUDType.READ;
      event.charge = ChargeType.ORGANIZATION;
      event.organizationId = payload.id;
      event.payload = payload;
      event.eventAt = new Date().toISOString();
      this.amqpConnection.publish('analytics', 'organizations.findMainTube', event);
    } catch (e) {
      console.log(e)
    }
    
    return payload;
  }

  @ApiOperation({ summary: 'Get an organization by deskHostname' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Get('deskHostname/:deskHostname')
  async findMainDesk(
    @Req() req: Request,
    @Param('deskHostname') deskHostname: string
  ): Promise<Organization> {
    const payload = await this.organizationService.findByDeskHostname(deskHostname);

    try {
      const event = new OrganizationEvent();
      event.url = req.url;
      event.method = req.method;
      event.headers = req.headers;
      event.body = req.body;
      event.crud = CRUDType.READ;
      event.charge = ChargeType.ORGANIZATION;
      event.organizationId = payload.id;
      event.payload = payload;
      event.eventAt = new Date().toISOString();
      this.amqpConnection.publish('analytics', 'organizations.findMainDesk', event);
    } catch (e) {
      console.log(e)
    }
    
    return payload;
  }

  @ApiOperation({ summary: 'Create an organization' })
  @ApiBody({ type: Organization })
  @ApiResponse({ status: 201, description: 'Success', type: Organization })
  @Post()
  @AuthStatus(['Verified'])
  @EmployeeStatus(['Working'])
  @UseGuards(AuthStatusGuard, EmployeeStatusGuard)
  async create(
    @Req() req: Request,
    @Body() organizationData: Organization
  ): Promise<Organization> {
    // TODO: auto add onwer to list of accounts and make them admin
    const payload = await this.organizationService.create(organizationData);
    const record = await this.organizationService.findOne(payload.id);

    try {
      const event = new OrganizationEvent();
      event.url = req.url;
      event.method = req.method;
      event.headers = req.headers;
      event.body = req.body;
      event.crud = CRUDType.CREATE;
      event.charge = ChargeType.ORGANIZATION;
      event.organizationId = record.id;
      event.payload = payload;
      event.eventAt = new Date().toISOString();
      this.amqpConnection.publish('analytics', 'organizations.create', event);
    } catch (e) {
      console.log(e)
    }
    
    return payload;
  }

  @ApiOperation({ summary: 'Update an organization' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Patch(':id')
  @AuthStatus(['Verified'])
  @EmployeeStatus(['Working'])
  @UseGuards(AuthStatusGuard, EmployeeStatusGuard)
  async update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() updatedOrganizationData: Organization
  ): Promise<Organization> {
    const record = await this.organizationService.findOne(id);
    const payload = await this.organizationService.update(id, updatedOrganizationData);

    try {
      const event = new OrganizationEvent();
      event.url = req.url;
      event.method = req.method;
      event.headers = req.headers;
      event.body = req.body;
      event.crud = CRUDType.UPDATE;
      event.charge = ChargeType.ORGANIZATION;
      event.organizationId = record.id;
      event.payload = payload;
      event.eventAt = new Date().toISOString();
      this.amqpConnection.publish('analytics', 'organizations.update', event);
    } catch (e) {
      console.log(e)
    }
    
    return payload;
  }

  @ApiOperation({ summary: 'Update an organizations sub orgs' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Patch('childRelated/:id')
  @AuthStatus(['Verified'])
  @EmployeeStatus(['Working'])
  @UseGuards(AuthStatusGuard, EmployeeStatusGuard)
  async updateChildOrganizations(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() updatedOrganizationData: Organization
  ): Promise<Organization> {
    const record = await this.organizationService.findOne(id);
    const payload = await this.organizationService.updateChildOrganizations(id, updatedOrganizationData);

    try {
      const event = new OrganizationEvent();
      event.url = req.url;
      event.method = req.method;
      event.headers = req.headers;
      event.body = req.body;
      event.crud = CRUDType.UPDATE;
      event.charge = ChargeType.ORGANIZATION;
      event.organizationId = record.id;
      event.payload = payload;
      event.eventAt = new Date().toISOString();
      this.amqpConnection.publish('analytics', 'organizations.updateChildOrganizations', event);
    } catch (e) {
      console.log(e)
    }
    
    return payload;
  }

  @ApiOperation({ summary: 'Update ebay access token for an organization' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Patch('ebayAccessToken/:id')
  @AuthStatus(['Verified'])
  @EmployeeStatus(['Working'])
  @UseGuards(AuthStatusGuard, EmployeeStatusGuard)
  async updateEbayAccessToken(
    @Req() req: Request,
    @Param('id') id: string,
    @Query('code') code: string
  ): Promise<Organization> {
    console.log('ebay code', code);
    const EbayAuthToken = require('ebay-oauth-nodejs-client');

    const ebayAuthToken = new EbayAuthToken({
        clientId: process.env.EBAY_CLIENT_ID,
        clientSecret: process.env.EBAY_CLIENT_SECRET,
        redirectUri: 'Travis_Burandt-TravisBu-subvin-ufmnppv'
    });
    
    const at = await ebayAuthToken.exchangeCodeForAccessToken('PRODUCTION', code);
    let accessToken = JSON.parse(at)
    console.log('ebay access token', accessToken);

    let organization: any;
    if (accessToken.access_token) {
      console.log('access token found')
      organization = {
        ebayAccessToken: accessToken.access_token
      }
    } else {
      console.log('access token not found')
      throw new NotFoundException(accessToken.error_description)
    }

    const payload = await this.organizationService.update(id, organization);

    try {
      const event = new OrganizationEvent();
      event.url = req.url;
      event.method = req.method;
      event.headers = req.headers;
      event.body = req.body;
      event.crud = CRUDType.UPDATE;
      event.charge = ChargeType.ORGANIZATION;
      event.organizationId = id;
      event.payload = payload;
      event.eventAt = new Date().toISOString();
      this.amqpConnection.publish('analytics', 'organizations.updateEbayAccessToken', event);
    } catch (e) {
      console.log(e)
    }
    
    return payload;
  }

  @ApiOperation({ summary: 'Delete an organization' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Delete(':id')
  @AuthStatus(['Verified'])
  @EmployeeStatus(['Working'])
  @UseGuards(AuthStatusGuard, EmployeeStatusGuard)
  async remove(
    @Req() req: Request,
    @Param('id') id: string
  ): Promise<void> {
    const payload = await this.organizationService.remove(id);

    try {
      const event = new OrganizationEvent();
      event.url = req.url;
      event.method = req.method;
      event.headers = req.headers;
      event.body = req.body;
      event.crud = CRUDType.DELETE;
      event.charge = ChargeType.ORGANIZATION;
      event.organizationId = id;
      event.payload = payload;
      event.eventAt = new Date().toISOString();
      this.amqpConnection.publish('analytics', 'organizations.remove', event);
    } catch (e) {
      console.log(e)
    }
    
    return payload;
  }

  @ApiOperation({ summary: 'Find organizations related to a user' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Get('userRelated/:id')
  async findUserOrgs(
    @Req() req: Request,
    @Param('id') userId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
  ): Promise<any> {
    const user = await this.userService.findOne(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { data, total } = await this.organizationService.findUserOrganizations(user, page, limit, search);
    const payload = { data, total };

    try {
      const event = new OrganizationEvent();
      event.url = req.url;
      event.method = req.method;
      event.headers = req.headers;
      event.body = req.body;
      event.crud = CRUDType.READ;
      event.charge = ChargeType.WEBMASTER;
      event.payload = payload;
      event.eventAt = new Date().toISOString();
      this.amqpConnection.publish('analytics', 'organizations.findUserOrgs', event);
    } catch (e) {
      console.log(e)
    }
    
    return payload;
  }

  @ApiOperation({ summary: 'Find organizations related to an organization' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Get('childRelated/:id')
  async findChildRelated(
    @Req() req: Request,
    @Param('id') orgId: string
  ): Promise<Organization> {
    const org = await this.organizationService.findOne(orgId);

    if (!org) {
      throw new NotFoundException('Organization not found');
    }

    const payload = await this.organizationService.findChildOrganizations(org);

    try {
      const event = new OrganizationEvent();
      event.url = req.url;
      event.method = req.method;
      event.headers = req.headers;
      event.body = req.body;
      event.crud = CRUDType.READ;
      event.charge = ChargeType.ORGANIZATION;
      event.organizationId = orgId;
      event.payload = payload;
      event.eventAt = new Date().toISOString();
      this.amqpConnection.publish('analytics', 'organizations.findChildRelated', event);
    } catch (e) {
      console.log(e)
    }
    
    return payload;
  }
}
