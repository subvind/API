import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UploadedFile, UseInterceptors, UseGuards } from '@nestjs/common';

import { FileService } from './file.service';
import { OrganizationService } from '../organizations/organization.service';
import { BucketService } from '../buckets/bucket.service';

import { File } from './file.entity';
import { NotFoundException } from '@nestjs/common'; // Import the NotFoundException
import { FileInterceptor } from '@nestjs/platform-express';

import { ApiTags, ApiResponse, ApiOperation, ApiBody } from '@nestjs/swagger';

import { AuthStatus } from '../auth-status.decorator';
import { AuthStatusGuard } from '../auth-status.guard';
import { EmployeeStatusGuard } from './employee-status.guard';
import { EmployeeStatus } from './employee-status.decorator';

@ApiTags('files')
@Controller('files')
export class FileController {
  constructor(
    private readonly fileService: FileService,
    private readonly bucketService: BucketService,
    private readonly organizationService: OrganizationService,
    private readonly amqpConnection: AmqpConnection
  ) {}

  @ApiOperation({ summary: 'Upload a file' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Post('upload/:bucketId/:organizationId')
  @UseInterceptors(FileInterceptor('file'))
  @AuthStatus(['Verified'])
  @EmployeeStatus(['Working'])
  @UseGuards(AuthStatusGuard, EmployeeStatusGuard)
  async uploadFile(@UploadedFile() file: Express.Multer.File, @Param('bucketId') bucketId: string, @Param('organizationId') organizationId: string): Promise<File> {
    const buffer = file.buffer;
    const filename = file.originalname;

    let organization = await this.organizationService.findOne(organizationId);
    let bucket = await this.bucketService.findOne(bucketId);
    
    return this.fileService.uploadFileToMinio(buffer, filename, bucket, organization);
  }

  @ApiOperation({ summary: 'Get all files' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Get()
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
  ) {
    const { data, total } = await this.fileService.findAll(page, limit, search);
    return { data, total };
  }

  @ApiOperation({ summary: 'Get a file by id' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<File> {
    return this.fileService.findOne(id);
  }

  @ApiOperation({ summary: 'Get a file by filename' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Get('filename/:filename/:organizationId')
  async findSingle(@Param('filename') filename: string, @Param('organizationId') organizationId: string): Promise<File> {
    return this.fileService.findByFilename(filename, organizationId);
  }

  @ApiOperation({ summary: 'Update a file' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Patch(':id')
  @AuthStatus(['Verified'])
  @EmployeeStatus(['Working'])
  @UseGuards(AuthStatusGuard, EmployeeStatusGuard)
  async update(@Param('id') id: string, @Body() updatedFileData: File): Promise<File> {
    return this.fileService.update(id, updatedFileData);
  }

  @ApiOperation({ summary: 'Delete a file' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Delete(':id')
  @AuthStatus(['Verified'])
  @EmployeeStatus(['Working'])
  @UseGuards(AuthStatusGuard, EmployeeStatusGuard)
  async remove(@Param('id') id: string): Promise<void> {
    return this.fileService.remove(id);
  }

  @ApiOperation({ summary: 'Find files related to an organization' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Get('orgRelated/:id')
  async findOrgFile(
    @Param('id') organizationId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
  ): Promise<any> {
    const organization = await this.organizationService.findOne(organizationId);

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    const { data, total } = await this.fileService.findOrgFile(organization, page, limit, search);
    return { data, total };
  }

  @ApiOperation({ summary: 'Find files related to a bucket' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Get('bucketRelated/:id')
  async findBucketFile(
    @Param('id') bucketId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string
  ): Promise<any> {
    const bucket = await this.bucketService.findOne(bucketId);

    if (!bucket) {
      throw new NotFoundException('Bucket not found');
    }

    const { data, total } = await this.fileService.findBucketFile(bucket, page, limit, search);
    return { data, total };
  }
}
