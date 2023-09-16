import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common'; // Import the NotFoundException

import { UserService } from './user.service';
import { OrganizationService } from '../organizations/organization.service';
import { User } from './user.entity';

import { ApiTags, ApiResponse, ApiOperation, ApiBody } from '@nestjs/swagger';

import { AuthStatus } from '../auth-status.decorator';
import { AuthStatusGuard } from '../auth-status.guard';

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
  // @UseGuards() // anyone can create a user
  async create(@Body() userData: User): Promise<User> {
    return this.userService.create(userData);
  }

  @ApiOperation({ summary: 'Update a user' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Patch(':id')
  @AuthStatus(['Pending', 'Verified'])
  @UseGuards(AuthStatusGuard)
  async update(@Param('id') id: string, @Body() updatedUserData: User): Promise<User> {
    let user = await this.userService.findRecord(id);
    let data
    const { password, ...userDataWithoutPassword } = updatedUserData;
    if (user.email === 'test@test.com') {
      // don't allow the password to be changed on test account
      data = userDataWithoutPassword 
    } else {
      // allow password to be changed this is not a test account
      data = updatedUserData
    }

    // for security reasons don't allow these values to be changed
    const { email, isEmailVerified, authStatus, ...userDataWithoutSecureInfo } = data;
    data = userDataWithoutSecureInfo

    // if emailVerificationToken is being submitted then
    if (data.emailVerificationToken) {
      // check to make sure it matches with what is already there
      // if it matches then set authStatus to Verified
      // and then set isEmailVerified to true
      if (data.emailVerificationToken === user.emailVerificationToken) {
        // update secure info
        data.authStatus = 'Verified'
        data.isEmailVerified = true
      } else {
        // update secure info
        data.authStatus = 'Pending'
        data.isEmailVerified = false
      }
    }

    return this.userService.update(id, data);
  }

  @ApiOperation({ summary: 'Delete a user' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Delete(':id')
  @AuthStatus(['Pending', 'Verified'])
  @UseGuards(AuthStatusGuard)
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

  @ApiOperation({ summary: 'Verify a user\'s email address' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Post('verifyEmail/:id')
  async verifyEmail(@Param('id') id: string): Promise<Boolean> {
    let user = await this.userService.findRecord(id);

    if (!user) {
      throw new NotFoundException('User or organization not found');
    }

    // Send the verification email
    await this.userService.sendVerificationEmail(user.email, user.emailVerificationToken);

    return true;
  }
}
