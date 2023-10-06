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

  @ApiOperation({ summary: 'Get a organization by hostname' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Get('hostname/:hostname')
  async findMain(@Param('hostname') orgname: string): Promise<Organization> {
    return await this.organizationService.findByHostname(orgname);
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
    
    const accessToken = await ebayAuthToken.exchangeCodeForAccessToken('PRODUCTION', code);
    console.log('ebay access token', accessToken);

    let organization: any;
    if (accessToken.accessToken) {
      organization = {
        ebayAccessToken: accessToken.accessToken
      }
    } else {
      throw new NotFoundException(accessToken.error_description)
    }

    return await this.organizationService.update(id, organization);
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
