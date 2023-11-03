import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';

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
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
  ) {
    const { data, total } = await this.videoService.findAll(page, limit, search);
    return { data, total };
  }

  @ApiOperation({ summary: 'Get a video by id' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Video> {
    return this.videoService.findOne(id);
  }

  @ApiOperation({ summary: 'Get a video by slug' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Get('slug/:slug/:organizationId')
  async findSingle(@Param('slug') slug: string, @Param('organizationId') organizationId: string): Promise<Video> {
    return this.videoService.findBySlug(slug, organizationId);
  }

  @ApiOperation({ summary: 'Create a video' })
  @ApiBody({ type: Video })
  @ApiResponse({ status: 201, description: 'Success', type: Video })
  @Post()
  @AuthStatus(['Verified'])
  @EmployeeStatus(['Working'])
  @UseGuards(AuthStatusGuard, EmployeeStatusGuard)
  async create(@Body() videoData: Video): Promise<Video> {
    return this.videoService.create(videoData);
  }

  @ApiOperation({ summary: 'Update a video' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Patch(':id')
  @AuthStatus(['Verified'])
  @EmployeeStatus(['Working'])
  @UseGuards(AuthStatusGuard, EmployeeStatusGuard)
  async update(@Param('id') id: string, @Body() updatedVideoData: Video): Promise<Video> {
    return this.videoService.update(id, updatedVideoData);
  }

  @ApiOperation({ summary: 'Delete a video' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Delete(':id')
  @AuthStatus(['Verified'])
  @EmployeeStatus(['Working'])
  @UseGuards(AuthStatusGuard, EmployeeStatusGuard)
  async remove(@Param('id') id: string): Promise<void> {
    return this.videoService.remove(id);
  }

  @ApiOperation({ summary: 'Find videos related to an organization' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Get('orgRelated/:id')
  async findOrgVideo(
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
    return { data, total };
  }

  @ApiOperation({ summary: 'Find videos related to a playlist' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Get('playlistRelated/:id')
  async findPlaylistVideo(
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
    return { data, total };
  }

  @ApiOperation({ summary: 'Find the latest videos related to an organization' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Get('latestOrgRelated/:id')
  async findLatestOrgVideo(
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
    return { data, total };
  }
}
