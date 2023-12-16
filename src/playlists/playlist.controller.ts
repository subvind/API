import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';

import { PlaylistService } from './playlist.service';
import { OrganizationService } from '../organizations/organization.service';

import { Playlist } from './playlist.entity';
import { NotFoundException } from '@nestjs/common'; // Import the NotFoundException

import { ApiTags, ApiResponse, ApiOperation, ApiBody } from '@nestjs/swagger';

import { AuthStatus } from '../auth-status.decorator';
import { AuthStatusGuard } from '../auth-status.guard';
import { EmployeeStatusGuard } from './employee-status.guard';
import { EmployeeStatus } from './employee-status.decorator';
import { PlaylistEvent, CRUDType, ChargeType } from './playlist.event';

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
    @Req() req: Request,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
  ) {
    const { data, total } = await this.playlistService.findAll(page, limit, search);
    const payload = { data, total };

    try {
      const event = new PlaylistEvent();
      event.url = req.url;
      event.method = req.method;
      event.headers = req.headers;
      event.body = req.body;
      event.crud = CRUDType.READ;
      event.charge = ChargeType.WEBMASTER;
      event.payload = payload;
      event.eventAt = new Date().toISOString();
      this.amqpConnection.publish('analytics', 'playlists.findAll', event);
    } catch (e) {
      console.log(e)
    }
    
    return payload;
  }

  @ApiOperation({ summary: 'Get a playlist by id' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Get(':id')
  async findOne(
    @Req() req: Request,
    @Param('id') id: string
  ): Promise<Playlist> {
    const payload = await this.playlistService.findOne(id);

    try {
      const event = new PlaylistEvent();
      event.url = req.url;
      event.method = req.method;
      event.headers = req.headers;
      event.body = req.body;
      event.crud = CRUDType.READ;
      event.charge = ChargeType.ORGANIZATION;
      event.organizationId = payload.organization.id;
      event.payload = payload;
      event.eventAt = new Date().toISOString();
      this.amqpConnection.publish('analytics', 'playlists.findOne', event);
    } catch (e) {
      console.log(e)
    }
    
    return payload;
  }

  @ApiOperation({ summary: 'Get a playlist by URL slug' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Get('slug/:slug/:organizationId')
  async findSingle(
    @Req() req: Request,
    @Param('slug') slug: string,
    @Param('organizationId') organizationId: string
  ): Promise<Playlist> {
    const payload = await this.playlistService.findBySlug(slug, organizationId);

    try {
      const event = new PlaylistEvent();
      event.url = req.url;
      event.method = req.method;
      event.headers = req.headers;
      event.body = req.body;
      event.crud = CRUDType.READ;
      event.charge = ChargeType.ORGANIZATION;
      event.organizationId = organizationId;
      event.payload = payload;
      event.eventAt = new Date().toISOString();
      this.amqpConnection.publish('analytics', 'playlists.findSingle', event);
    } catch (e) {
      console.log(e)
    }
    
    return payload;
  }

  @ApiOperation({ summary: 'Create a playlist' })
  @ApiBody({ type: Playlist })
  @ApiResponse({ status: 201, description: 'Success', type: Playlist })
  @Post()
  @AuthStatus(['Verified'])
  @EmployeeStatus(['Working'])
  @UseGuards(AuthStatusGuard, EmployeeStatusGuard)
  async create(
    @Req() req: Request,
    @Body() playlistData: Playlist
  ): Promise<Playlist> {
    const payload = await this.playlistService.create(playlistData);
    const record = await this.playlistService.findOne(payload.id);

    try {
      const event = new PlaylistEvent();
      event.url = req.url;
      event.method = req.method;
      event.headers = req.headers;
      event.body = req.body;
      event.crud = CRUDType.CREATE;
      event.charge = ChargeType.ORGANIZATION;
      event.organizationId = record.organization.id;
      event.payload = payload;
      event.eventAt = new Date().toISOString();
      this.amqpConnection.publish('analytics', 'playlists.create', event);
    } catch (e) {
      console.log(e)
    }
    
    return payload;
  }

  @ApiOperation({ summary: 'Update a playlist' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Patch(':id')
  @AuthStatus(['Verified'])
  @EmployeeStatus(['Working'])
  @UseGuards(AuthStatusGuard, EmployeeStatusGuard)
  async update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() updatedPlaylistData: Playlist
  ): Promise<Playlist> {
    const record = await this.playlistService.findOne(id);
    const payload = await this.playlistService.update(id, updatedPlaylistData);

    try {
      const event = new PlaylistEvent();
      event.url = req.url;
      event.method = req.method;
      event.headers = req.headers;
      event.body = req.body;
      event.crud = CRUDType.UPDATE;
      event.charge = ChargeType.ORGANIZATION;
      event.organizationId = record.organization.id;
      event.payload = payload;
      event.eventAt = new Date().toISOString();
      this.amqpConnection.publish('analytics', 'playlists.update', event);
    } catch (e) {
      console.log(e)
    }
    
    return payload;
  }

  @ApiOperation({ summary: 'Delete a playlist' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Delete(':id')
  @AuthStatus(['Verified'])
  @EmployeeStatus(['Working'])
  @UseGuards(AuthStatusGuard, EmployeeStatusGuard)
  async remove(
    @Req() req: Request,
    @Param('id') id: string
  ): Promise<void> {
    const record = await this.playlistService.findOne(id);
    const payload = await this.playlistService.remove(id);

    try {
      const event = new PlaylistEvent();
      event.url = req.url;
      event.method = req.method;
      event.headers = req.headers;
      event.body = req.body;
      event.crud = CRUDType.DELETE;
      event.charge = ChargeType.ORGANIZATION;
      event.organizationId = record.organization.id;
      event.payload = payload;
      event.eventAt = new Date().toISOString();
      this.amqpConnection.publish('analytics', 'playlists.remove', event);
    } catch (e) {
      console.log(e)
    }
    
    return payload;
  }

  @ApiOperation({ summary: 'Find playlists related to an organization' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Get('orgRelated/:id')
  async findOrgPlaylist(
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

    const { data, total } = await this.playlistService.findOrgPlaylist(organization, page, limit, search);
    const payload = { data, total };

    try {
      const event = new PlaylistEvent();
      event.url = req.url;
      event.method = req.method;
      event.headers = req.headers;
      event.body = req.body;
      event.crud = CRUDType.READ;
      event.charge = ChargeType.ORGANIZATION;
      event.organizationId = organizationId;
      event.payload = payload;
      event.eventAt = new Date().toISOString();
      this.amqpConnection.publish('analytics', 'playlists.findOrgPlaylist', event);
    } catch (e) {
      console.log(e)
    }
    
    return payload;
  }

  @ApiOperation({ summary: 'Find playlists related to an organization by tubeHostname' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Get('tubeHostname/:tubeHostname')
  async findOrgPlaylistByHostname(
    @Req() req: Request,
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
    const payload = { data, total };

    try {
      const event = new PlaylistEvent();
      event.url = req.url;
      event.method = req.method;
      event.headers = req.headers;
      event.body = req.body;
      event.crud = CRUDType.READ;
      event.charge = ChargeType.ORGANIZATION;
      event.organizationId = organization.id;
      event.payload = payload;
      event.eventAt = new Date().toISOString();
      this.amqpConnection.publish('analytics', 'playlists.findOrgPlaylistByHostname', event);
    } catch (e) {
      console.log(e)
    }
    
    return payload;
  }

  @ApiOperation({ summary: 'Find sub playlists related to a playlist' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Get('playlistRelated/:id')
  async findSubPlaylists(
    @Req() req: Request,
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
    const payload = { data, total };

    try {
      const event = new PlaylistEvent();
      event.url = req.url;
      event.method = req.method;
      event.headers = req.headers;
      event.body = req.body;
      event.crud = CRUDType.READ;
      event.charge = ChargeType.ORGANIZATION;
      event.organizationId = playlist.organization.id;
      event.payload = payload;
      event.eventAt = new Date().toISOString();
      this.amqpConnection.publish('analytics', 'playlists.findSubPlaylists', event);
    } catch (e) {
      console.log(e)
    }
    
    return payload;
  }
}
