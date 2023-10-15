import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';

import { AnalyticService } from './analytic.service';
import { OrganizationService } from '../organizations/organization.service';

import { Analytic } from './analytic.entity';
import { NotFoundException } from '@nestjs/common'; // Import the NotFoundException

import { ApiTags, ApiResponse, ApiOperation, ApiBody } from '@nestjs/swagger';

import { AuthStatus } from '../auth-status.decorator';
import { AuthStatusGuard } from '../auth-status.guard';
import { EmployeeStatusGuard } from './employee-status.guard';
import { EmployeeStatus } from './employee-status.decorator';

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
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
  ) {
    const { data, total } = await this.analyticService.findAll(page, limit, search);
    return { data, total };
  }

  @ApiOperation({ summary: 'Get a analytic by id' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Analytic> {
    return this.analyticService.findOne(id);
  }

  @ApiOperation({ summary: 'Create a analytic' })
  @ApiBody({ type: Analytic })
  @ApiResponse({ status: 201, description: 'Success', type: Analytic })
  @Post()
  @AuthStatus(['Verified'])
  @EmployeeStatus(['Working'])
  @UseGuards(AuthStatusGuard, EmployeeStatusGuard)
  async create(@Body() analyticData: Analytic): Promise<Analytic> {
    return this.analyticService.create(analyticData);
  }

  @ApiOperation({ summary: 'Update a analytic' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Patch(':id')
  @AuthStatus(['Verified'])
  @EmployeeStatus(['Working'])
  @UseGuards(AuthStatusGuard, EmployeeStatusGuard)
  async update(@Param('id') id: string, @Body() updatedAnalyticData: Analytic): Promise<Analytic> {
    return this.analyticService.update(id, updatedAnalyticData);
  }

  @ApiOperation({ summary: 'Delete a analytic' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Delete(':id')
  @AuthStatus(['Verified'])
  @EmployeeStatus(['Working'])
  @UseGuards(AuthStatusGuard, EmployeeStatusGuard)
  async remove(@Param('id') id: string): Promise<void> {
    return this.analyticService.remove(id);
  }

  @ApiOperation({ summary: 'Find analytics related to an organization' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Get('orgRelated/:id')
  async findOrgAnalytic(
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
    return { data, total };
  }
}
