import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common';

import { InventoryService } from './inventory.service';
import { OrganizationService } from '../organizations/organization.service';

import { Inventory } from './inventory.entity';
import { NotFoundException } from '@nestjs/common'; // Import the NotFoundException

import { ApiTags, ApiResponse, ApiOperation, ApiBody } from '@nestjs/swagger';

@ApiTags('inventory')
@Controller('inventory')
export class InventoryController {
  constructor(
    private readonly inventoryService: InventoryService,
    private readonly organizationService: OrganizationService,
    private readonly amqpConnection: AmqpConnection
  ) {}

  @ApiOperation({ summary: 'Get all inventory' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Get()
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
  ) {
    const { data, total } = await this.inventoryService.findAll(page, limit, search);
    return { data, total };
  }

  @ApiOperation({ summary: 'Get a inventory by id' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Inventory> {
    return this.inventoryService.findOne(id);
  }

  @ApiOperation({ summary: 'Create a inventory' })
  @ApiBody({ type: Inventory })
  @ApiResponse({ status: 201, description: 'Success', type: Inventory })
  @Post()
  async create(@Body() inventoryData: Inventory): Promise<Inventory> {
    return this.inventoryService.create(inventoryData);
  }

  @ApiOperation({ summary: 'Update a inventory' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updatedInventoryData: Inventory): Promise<Inventory> {
    return this.inventoryService.update(id, updatedInventoryData);
  }

  @ApiOperation({ summary: 'Delete a inventory' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.inventoryService.remove(id);
  }

  @ApiOperation({ summary: 'Find inventory related to an organization' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Get('orgRelated/:id')
  async findOrgInventory(
    @Param('id') organizationId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
  ): Promise<any> {
    const organization = await this.organizationService.findOne(organizationId);

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    const { data, total } = await this.inventoryService.findOrgInventory(organization, page, limit, search);
    return { data, total };
  }
}
