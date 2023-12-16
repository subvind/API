import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';

import { VideoService } from './video.service';
import { OrganizationService } from '../organizations/organization.service';
import { PlaylistService } from '../playlists/playlist.service';

import { Video } from './video.entity';
import { NotFoundException } from '@nestjs/common'; // Import the NotFoundException

import { ApiTags, ApiResponse, ApiOperation, ApiBody } from '@nestjs/swagger';

import { AuthStatus } from '../auth-status.decorator';
import { AuthStatusGuard } from '../auth-status.guard';
import { EmployeeStatusGuard } from './employee-status.guard';
import { EmployeeStatus } from './employee-status.decorator';
import { VideoEvent, CRUDType, ChargeType } from './video.event';

@ApiTags('videos')
@Controller('videos')
export class VideoController {
  constructor(
    private readonly videoService: VideoService,
    private readonly playlistService: PlaylistService,
    private readonly organizationService: OrganizationService,
    private readonly amqpConnection: AmqpConnection
  ) {}

  @ApiOperation({ summary: 'Get all videos' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Get()
  async findAll(
    @Req() req: Request,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
  ) {
    const { data, total } = await this.videoService.findAll(page, limit, search);
    const payload = { data, total };

    try {
      const event = new VideoEvent();
      event.url = req.url;
      event.method = req.method;
      event.headers = req.headers;
      event.body = req.body;
      event.crud = CRUDType.READ;
      event.charge = ChargeType.WEBMASTER;
      event.payload = payload;
      event.eventAt = new Date().toISOString();
      this.amqpConnection.publish('analytics', 'videos.findAll', event);
    } catch (e) {
      console.log(e)
    }
    
    return payload;
  }

  @ApiOperation({ summary: 'Get a video by id' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Get(':id')
  async findOne(
    @Req() req: Request,
    @Param('id') id: string
  ): Promise<Video> {
    const payload = await this.videoService.findOne(id);

    try {
      const event = new VideoEvent();
      event.url = req.url;
      event.method = req.method;
      event.headers = req.headers;
      event.body = req.body;
      event.crud = CRUDType.READ;
      event.charge = ChargeType.ORGANIZATION;
      event.organizationId = payload.organization.id;
      event.payload = payload;
      event.eventAt = new Date().toISOString();
      this.amqpConnection.publish('analytics', 'videos.findOne', event);
    } catch (e) {
      console.log(e)
    }
    
    return payload;
  }

  @ApiOperation({ summary: 'Get a video by slug' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Get('slug/:slug/:organizationId')
  async findSingle(
    @Req() req: Request,
    @Param('slug') slug: string,
    @Param('organizationId') organizationId: string
  ): Promise<Video> {
    const payload = await this.videoService.findBySlug(slug, organizationId);

    try {
      const event = new VideoEvent();
      event.url = req.url;
      event.method = req.method;
      event.headers = req.headers;
      event.body = req.body;
      event.crud = CRUDType.READ;
      event.charge = ChargeType.ORGANIZATION;
      event.organizationId = organizationId;
      event.payload = payload;
      event.eventAt = new Date().toISOString();
      this.amqpConnection.publish('analytics', 'videos.findSingle', event);
    } catch (e) {
      console.log(e)
    }
    
    return payload;
  }

  @ApiOperation({ summary: 'Create a video' })
  @ApiBody({ type: Video })
  @ApiResponse({ status: 201, description: 'Success', type: Video })
  @Post()
  @AuthStatus(['Verified'])
  @EmployeeStatus(['Working'])
  @UseGuards(AuthStatusGuard, EmployeeStatusGuard)
  async create(
    @Req() req: Request,
    @Body() videoData: Video
  ): Promise<Video> {
    const payload = await this.videoService.create(videoData);
    const record = await this.videoService.findOne(payload.id);

    try {
      const event = new VideoEvent();
      event.url = req.url;
      event.method = req.method;
      event.headers = req.headers;
      event.body = req.body;
      event.crud = CRUDType.CREATE;
      event.charge = ChargeType.ORGANIZATION;
      event.organizationId = record.organization.id;
      event.payload = payload;
      event.eventAt = new Date().toISOString();
      this.amqpConnection.publish('analytics', 'videos.create', event);
    } catch (e) {
      console.log(e)
    }
    
    return payload;
  }

  @ApiOperation({ summary: 'Update a video' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Patch(':id')
  @AuthStatus(['Verified'])
  @EmployeeStatus(['Working'])
  @UseGuards(AuthStatusGuard, EmployeeStatusGuard)
  async update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() updatedVideoData: Video
  ): Promise<Video> {
    const record = await this.videoService.findOne(id);
    const payload = await this.videoService.update(id, updatedVideoData);

    try {
      const event = new VideoEvent();
      event.url = req.url;
      event.method = req.method;
      event.headers = req.headers;
      event.body = req.body;
      event.crud = CRUDType.UPDATE;
      event.charge = ChargeType.ORGANIZATION;
      event.organizationId = record.organization.id;
      event.payload = payload;
      event.eventAt = new Date().toISOString();
      this.amqpConnection.publish('analytics', 'videos.update', event);
    } catch (e) {
      console.log(e)
    }
    
    return payload;
  }

  @ApiOperation({ summary: 'Delete a video' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Delete(':id')
  @AuthStatus(['Verified'])
  @EmployeeStatus(['Working'])
  @UseGuards(AuthStatusGuard, EmployeeStatusGuard)
  async remove(
    @Req() req: Request,
    @Param('id') id: string
  ): Promise<void> {
    const record = await this.videoService.findOne(id);
    const payload = await this.videoService.remove(id);

    try {
      const event = new VideoEvent();
      event.url = req.url;
      event.method = req.method;
      event.headers = req.headers;
      event.body = req.body;
      event.crud = CRUDType.DELETE;
      event.charge = ChargeType.ORGANIZATION;
      event.organizationId = record.organization.id;
      event.payload = payload;
      event.eventAt = new Date().toISOString();
      this.amqpConnection.publish('analytics', 'videos.remove', event);
    } catch (e) {
      console.log(e)
    }
    
    return payload;
  }

  @ApiOperation({ summary: 'Find videos related to an organization' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Get('orgRelated/:id')
  async findOrgVideo(
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

    const { data, total } = await this.videoService.findOrgVideo(organization, page, limit, search);
    const payload = { data, total };

    try {
      const event = new VideoEvent();
      event.url = req.url;
      event.method = req.method;
      event.headers = req.headers;
      event.body = req.body;
      event.crud = CRUDType.READ;
      event.charge = ChargeType.ORGANIZATION;
      event.organizationId = organizationId;
      event.payload = payload;
      event.eventAt = new Date().toISOString();
      this.amqpConnection.publish('analytics', 'videos.findOrgVideo', event);
    } catch (e) {
      console.log(e)
    }
    
    return payload;
  }

  @ApiOperation({ summary: 'Find videos related to a playlist' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Get('playlistRelated/:id')
  async findPlaylistVideo(
    @Req() req: Request,
    @Param('id') playlistId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
    @Query('type') type?: string,
  ): Promise<any> {
    const playlist = await this.playlistService.findOne(playlistId);

    if (!playlist) {
      throw new NotFoundException('Playlist not found');
    }

    const { data, total } = await this.videoService.findPlaylistVideo(playlist, page, limit, search, type);
    const payload = { data, total };

    try {
      const event = new VideoEvent();
      event.url = req.url;
      event.method = req.method;
      event.headers = req.headers;
      event.body = req.body;
      event.crud = CRUDType.READ;
      event.charge = ChargeType.ORGANIZATION;
      event.organizationId = playlist.organization.id;
      event.payload = payload;
      event.eventAt = new Date().toISOString();
      this.amqpConnection.publish('analytics', 'videos.findPlaylistVideo', event);
    } catch (e) {
      console.log(e)
    }
    
    return payload;
  }

  @ApiOperation({ summary: 'Find the latest videos related to an organization' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Get('latestOrgRelated/:id')
  async findLatestOrgVideo(
    @Req() req: Request,
    @Param('id') organizationId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
    @Query('type') type?: string,
  ): Promise<any> {
    const organization = await this.organizationService.findOne(organizationId);

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    const { data, total } = await this.videoService.findLatestOrgVideo(organization, page, limit, search, type);
    const payload = { data, total };

    try {
      const event = new VideoEvent();
      event.url = req.url;
      event.method = req.method;
      event.headers = req.headers;
      event.body = req.body;
      event.crud = CRUDType.READ;
      event.charge = ChargeType.ORGANIZATION;
      event.organizationId = organizationId;
      event.payload = payload;
      event.eventAt = new Date().toISOString();
      this.amqpConnection.publish('analytics', 'videos.findLatestOrgVideo', event);
    } catch (e) {
      console.log(e)
    }
    
    return payload;
  }
}
