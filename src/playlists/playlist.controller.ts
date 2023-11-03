import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';

import { PlaylistService } from './playlist.service';
import { OrganizationService } from '../organizations/organization.service';

import { Playlist } from './playlist.entity';
import { NotFoundException } from '@nestjs/common'; // Import the NotFoundException

import { ApiTags, ApiResponse, ApiOperation, ApiBody } from '@nestjs/swagger';

import { AuthStatus } from '../auth-status.decorator';
import { AuthStatusGuard } from '../auth-status.guard';
import { EmployeeStatusGuard } from './employee-status.guard';
import { EmployeeStatus } from './employee-status.decorator';

@ApiTags('playlists')
@Controller('playlists')
export class PlaylistController {
  constructor(
    private readonly playlistService: PlaylistService,
    private readonly organizationService: OrganizationService,
    private readonly amqpConnection: AmqpConnection
  ) {}

  @ApiOperation({ summary: 'Get all playlists' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Get()
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
  ) {
    const { data, total } = await this.playlistService.findAll(page, limit, search);
    return { data, total };
  }

  @ApiOperation({ summary: 'Get a playlist by id' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Playlist> {
    return this.playlistService.findOne(id);
  }

  @ApiOperation({ summary: 'Get a playlist by URL slug' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Get('slug/:slug/:organizationId')
  async findSingle(@Param('slug') slug: string, @Param('organizationId') organizationId: string): Promise<Playlist> {
    return this.playlistService.findBySlug(slug, organizationId);
  }

  @ApiOperation({ summary: 'Create a playlist' })
  @ApiBody({ type: Playlist })
  @ApiResponse({ status: 201, description: 'Success', type: Playlist })
  @Post()
  @AuthStatus(['Verified'])
  @EmployeeStatus(['Working'])
  @UseGuards(AuthStatusGuard, EmployeeStatusGuard)
  async create(@Body() playlistData: Playlist): Promise<Playlist> {
    return this.playlistService.create(playlistData);
  }

  @ApiOperation({ summary: 'Update a playlist' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Patch(':id')
  @AuthStatus(['Verified'])
  @EmployeeStatus(['Working'])
  @UseGuards(AuthStatusGuard, EmployeeStatusGuard)
  async update(@Param('id') id: string, @Body() updatedPlaylistData: Playlist): Promise<Playlist> {
    return this.playlistService.update(id, updatedPlaylistData);
  }

  @ApiOperation({ summary: 'Delete a playlist' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Delete(':id')
  @AuthStatus(['Verified'])
  @EmployeeStatus(['Working'])
  @UseGuards(AuthStatusGuard, EmployeeStatusGuard)
  async remove(@Param('id') id: string): Promise<void> {
    return this.playlistService.remove(id);
  }

  @ApiOperation({ summary: 'Find playlists related to an organization' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Get('orgRelated/:id')
  async findOrgPlaylist(
    @Param('id') organizationId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
  ): Promise<any> {
    const organization = await this.organizationService.findOne(organizationId);

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    const { data, total } = await this.playlistService.findOrgPlaylist(organization, page, limit, search);
    return { data, total };
  }

  @ApiOperation({ summary: 'Find playlists related to an organization by tubeHostname' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Get('tubeHostname/:tubeHostname')
  async findOrgPlaylistByHostname(
    @Param('tubeHostname') tubeHostname: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
  ): Promise<any> {
    const organization = await this.organizationService.findByTubeHostname(tubeHostname);

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    const { data, total } = await this.playlistService.findOrgPlaylist(organization, page, limit, search);
    return { data, total };
  }

  @ApiOperation({ summary: 'Find sub playlists related to a playlist' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Get('playlistRelated/:id')
  async findSubPlaylists(
    @Param('id') playlistId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
  ): Promise<any> {
    const playlist = await this.playlistService.findOne(playlistId);

    if (!playlist) {
      throw new NotFoundException('Playlist not found');
    }

    const { data, total } = await this.playlistService.findSubPlaylists(playlist, page, limit, search);
    return { data, total };
  }
}
