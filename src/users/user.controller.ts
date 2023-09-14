import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Controller, Get, Post, Patch, Delete, Body, Param, Query, BadRequestException } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common'; // Import the NotFoundException

import { UserService } from './user.service';
import { OrganizationService } from '../organizations/organization.service';
import { User } from './user.entity';

import { ApiTags, ApiResponse, ApiOperation, ApiBody } from '@nestjs/swagger';

import { AuthStatus } from '../auth-status.decorator';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly organizationService: OrganizationService,
    private readonly amqpConnection: AmqpConnection
  ) {}

  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Get()
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
  ) {
    const { data, total } = await this.userService.findAll(page, limit, search);
    return { data, total };
  }

  @ApiOperation({ summary: 'Get a user by id' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<User> {
    return this.userService.findOne(id);
  }

  @ApiOperation({ summary: 'Get a user by username' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Get('username/:username')
  async findSingle(@Param('username') username: string): Promise<User> {
    return this.userService.findByUsername(username);
  }

  @ApiOperation({ summary: 'Create a user' })
  @ApiBody({ type: User })
  @ApiResponse({ status: 201, description: 'Success', type: User })
  @Post()
  @AuthStatus(['Pending', 'Verified'])
  async create(@Body() userData: User): Promise<User> {
    return this.userService.create(userData);
  }

  @ApiOperation({ summary: 'Update a user' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Patch(':id')
  @AuthStatus(['Pending', 'Verified'])
  async update(@Param('id') id: string, @Body() updatedUserData: User): Promise<User> {
    let user = await this.userService.findOne(id);
    let data
    const { username, email, password, ...userDataWithoutEmailAndUsername } = updatedUserData;
    if (user.username === 'testing' || user.email === 'test@test.com') {
      data = userDataWithoutEmailAndUsername
    } else {
      data = updatedUserData
    }

    return this.userService.update(id, data);
  }

  @ApiOperation({ summary: 'Delete a user' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Delete(':id')
  @AuthStatus(['Pending', 'Verified'])
  async remove(@Param('id') id: string): Promise<void> {
    return this.userService.remove(id);
  }


  @ApiOperation({ summary: 'Set a default organization for a user' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Get('defaultOrganization/:username/:orgname')
  async setDefaultOrg(@Param('username') username: string, @Param('orgname') orgname: string): Promise<User> {
    let user = await this.userService.findByUsername(username);
    let organization = await this.organizationService.findByOrgname(orgname);

    // console.log('setDefaultOrg user', user)
    // console.log('setDefaultOrg organization', organization)

    if (!user || !organization) {
      // Throw an exception if user or organization is not found
      throw new NotFoundException('User or organization not found');
    }
    
    // TODO: make sure user is employee of org
    let change: any = {
      defaultOrganization: organization.id,
    }

    // console.log('setDefaultOrg change', change)
    
    // send changes to database
    return this.userService.update(user.id, change);
  }
}
