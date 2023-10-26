import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';

import { OrganizationService } from './organization.service';
import { UserService } from 'src/users/user.service';

import { Organization } from './organization.entity';
import { NotFoundException } from '@nestjs/common'; // Import the NotFoundException

import { ApiTags, ApiResponse, ApiOperation, ApiBody } from '@nestjs/swagger';

import { AuthStatus } from '../auth-status.decorator';
import { AuthStatusGuard } from '../auth-status.guard';
import { EmployeeStatusGuard } from './employee-status.guard';
import { EmployeeStatus } from './employee-status.decorator';

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
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
  ) {
    const { data, total } = await this.organizationService.findAll(page, limit, search);
    return { data, total };
  }

  @ApiOperation({ summary: 'Get a organization by id' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Organization> {
    return this.organizationService.findOne(id);
  }

  @ApiOperation({ summary: 'Get a organization by orgname' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Get('orgname/:orgname')
  async findSingle(@Param('orgname') orgname: string): Promise<Organization> {
    return await this.organizationService.findByOrgname(orgname);
  }

  @ApiOperation({ summary: 'Get a organization by homeHostname' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Get('homeHostname/:homeHostname')
  async findMainHome(@Param('homeHostname') homeHostname: string): Promise<Organization> {
    return await this.organizationService.findByHomeHostname(homeHostname);
  }

  @ApiOperation({ summary: 'Get a organization by erpHostname' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Get('erpHostname/:erpHostname')
  async findMainErp(@Param('erpHostname') erpHostname: string): Promise<Organization> {
    return await this.organizationService.findByErpHostname(erpHostname);
  }

  @ApiOperation({ summary: 'Get a organization by tubeHostname' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Get('tubeHostname/:tubeHostname')
  async findMainTube(@Param('tubeHostname') tubeHostname: string): Promise<Organization> {
    return await this.organizationService.findByTubeHostname(tubeHostname);
  }

  @ApiOperation({ summary: 'Get a organization by deskHostname' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Get('deskHostname/:deskHostname')
  async findMainDesk(@Param('deskHostname') deskHostname: string): Promise<Organization> {
    return await this.organizationService.findByDeskHostname(deskHostname);
  }

  @ApiOperation({ summary: 'Create a organization' })
  @ApiBody({ type: Organization })
  @ApiResponse({ status: 201, description: 'Success', type: Organization })
  @Post()
  @AuthStatus(['Verified'])
  @EmployeeStatus(['Working'])
  @UseGuards(AuthStatusGuard, EmployeeStatusGuard)
  async create(@Body() organizationData: Organization): Promise<Organization> {
    // TODO: auto add onwer to list of accounts and make them admin
    return this.organizationService.create(organizationData);
  }

  @ApiOperation({ summary: 'Update a organization' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Patch(':id')
  @AuthStatus(['Verified'])
  @EmployeeStatus(['Working'])
  @UseGuards(AuthStatusGuard, EmployeeStatusGuard)
  async update(@Param('id') id: string, @Body() updatedOrganizationData: Organization): Promise<Organization> {
    return this.organizationService.update(id, updatedOrganizationData);
  }

  @ApiOperation({ summary: 'Update ebay access token for a organization' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Patch('ebayAccessToken/:id')
  @AuthStatus(['Verified'])
  @EmployeeStatus(['Working'])
  @UseGuards(AuthStatusGuard, EmployeeStatusGuard)
  async updateEbayAccessToken(@Param('id') id: string, @Query('code') code: string): Promise<Organization> {

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

    return this.organizationService.update(id, organization);
  }

  @ApiOperation({ summary: 'Delete a organization' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Delete(':id')
  @AuthStatus(['Verified'])
  @EmployeeStatus(['Working'])
  @UseGuards(AuthStatusGuard, EmployeeStatusGuard)
  async remove(@Param('id') id: string): Promise<void> {
    return this.organizationService.remove(id);
  }

  @ApiOperation({ summary: 'Find organizations related to a user' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Get('userRelated/:id')
  async findUserOrgs(
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
    return { data, total };
  }
}
