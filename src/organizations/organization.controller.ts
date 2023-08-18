import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common';

import { OrganizationService } from './organization.service';
import { UserService } from 'src/users/user.service';

import { Organization } from './organization.entity';
import { NotFoundException } from '@nestjs/common'; // Import the NotFoundException

import { ApiTags, ApiResponse, ApiOperation, ApiBody } from '@nestjs/swagger';

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
  async create(@Body() organizationData: Organization): Promise<Organization> {
    return this.organizationService.create(organizationData);
  }

  @ApiOperation({ summary: 'Update a organization' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updatedOrganizationData: Organization): Promise<Organization> {
    return this.organizationService.update(id, updatedOrganizationData);
  }

  @ApiOperation({ summary: 'Delete a organization' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Delete(':id')
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
