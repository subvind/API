import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common'; // Import the NotFoundException

import { UserService } from './user.service';
import { OrganizationService } from '../organizations/organization.service';
import { User } from './user.entity';

import { ApiTags, ApiResponse, ApiOperation, ApiBody } from '@nestjs/swagger';

import { AuthStatus } from '../auth-status.decorator';
import { AuthStatusGuard } from '../auth-status.guard';
import { UserStatusGuard } from './user-status.guard';
import { UserStatus } from './user-status.decorator';
import { UserEvent, CRUDType, ChargeType } from './user.event';

import { v4 as uuidv4 } from 'uuid';
import { hash } from 'bcrypt';

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
    @Req() req: Request,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
  ) {
    const { data, total } = await this.userService.findAll(page, limit, search);
    const payload = { data, total };

    try {
      const event = new UserEvent();
      event.url = req.url;
      event.method = req.method;
      event.headers = req.headers;
      event.body = req.body;
      event.crud = CRUDType.READ;
      event.charge = ChargeType.WEBMASTER;
      event.payload = payload;
      event.eventAt = new Date().toISOString();
      this.amqpConnection.publish('analytics', 'users.findAll', event);
    } catch (e) {
      console.log(e)
    }
    
    return payload;
  }

  @ApiOperation({ summary: 'Get a user by id' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Get(':id')
  async findOne(
    @Req() req: Request,
    @Param('id') id: string
  ): Promise<User> {
    const payload = await this.userService.findOne(id);

    try {
      const event = new UserEvent();
      event.url = req.url;
      event.method = req.method;
      event.headers = req.headers;
      event.body = req.body;
      event.crud = CRUDType.READ;
      event.charge = ChargeType.WEBMASTER;
      event.payload = payload;
      event.eventAt = new Date().toISOString();
      this.amqpConnection.publish('analytics', 'users.findOne', event);
    } catch (e) {
      console.log(e)
    }
    
    return payload;
  }

  @ApiOperation({ summary: 'Get a user by username' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Get('username/:username')
  async findSingle(
    @Req() req: Request,
    @Param('username') username: string
  ): Promise<User> {
    const payload = await this.userService.findByUsername(username);

    try {
      const event = new UserEvent();
      event.url = req.url;
      event.method = req.method;
      event.headers = req.headers;
      event.body = req.body;
      event.crud = CRUDType.READ;
      event.charge = ChargeType.WEBMASTER;
      event.payload = payload;
      event.eventAt = new Date().toISOString();
      this.amqpConnection.publish('analytics', 'users.findSingle', event);
    } catch (e) {
      console.log(e)
    }
    
    return payload;
  }

  @ApiOperation({ summary: 'Create a user' })
  @ApiBody({ type: User })
  @ApiResponse({ status: 201, description: 'Success', type: User })
  @Post()
  // @UseGuards() // anyone can create a user
  async create(
    @Req() req: Request,
    @Body() userData: User
  ): Promise<User> {
    const payload = await this.userService.create(userData);

    try {
      const event = new UserEvent();
      event.url = req.url;
      event.method = req.method;
      event.headers = req.headers;
      event.body = req.body;
      event.crud = CRUDType.CREATE;
      event.charge = ChargeType.WEBMASTER;
      event.payload = payload;
      event.eventAt = new Date().toISOString();
      this.amqpConnection.publish('analytics', 'users.create', event);
    } catch (e) {
      console.log(e)
    }
    
    return payload;
  }

  @ApiOperation({ summary: 'Update a user' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Patch(':id')
  @AuthStatus(['Pending', 'Verified'])
  @UserStatus(['Owner'])
  @UseGuards(AuthStatusGuard, UserStatusGuard)
  async update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() updatedUserData: User
  ): Promise<User> {
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

    const payload = await this.userService.update(id, data);

    try {
      const event = new UserEvent();
      event.url = req.url;
      event.method = req.method;
      event.headers = req.headers;
      event.body = req.body;
      event.crud = CRUDType.UPDATE;
      event.charge = ChargeType.WEBMASTER;
      event.payload = payload;
      event.eventAt = new Date().toISOString();
      this.amqpConnection.publish('analytics', 'users.update', event);
    } catch (e) {
      console.log(e)
    }
    
    return payload;
  }

  @ApiOperation({ summary: 'Delete a user' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Delete(':id')
  @AuthStatus(['Pending', 'Verified'])
  @UserStatus(['Owner'])
  @UseGuards(AuthStatusGuard, UserStatusGuard)
  async remove(
    @Req() req: Request,
    @Param('id') id: string
  ): Promise<void> {
    const payload = await this.userService.remove(id);

    try {
      const event = new UserEvent();
      event.url = req.url;
      event.method = req.method;
      event.headers = req.headers;
      event.body = req.body;
      event.crud = CRUDType.DELETE;
      event.charge = ChargeType.WEBMASTER;
      event.payload = payload;
      event.eventAt = new Date().toISOString();
      this.amqpConnection.publish('analytics', 'users.remove', event);
    } catch (e) {
      console.log(e)
    }
    
    return payload;
  }


  @ApiOperation({ summary: 'Set a default organization for a user' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Get('defaultOrganization/:username/:orgname')
  async setDefaultOrg(
    @Req() req: Request,
    @Param('username') username: string, 
    @Param('orgname') orgname: string
  ): Promise<User> {
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
    const payload = await this.userService.update(user.id, change);

    try {
      const event = new UserEvent();
      event.url = req.url;
      event.method = req.method;
      event.headers = req.headers;
      event.body = req.body;
      event.crud = CRUDType.READ;
      event.charge = ChargeType.ORGANIZATION;
      event.organizationId = organization.id;
      event.payload = payload;
      event.eventAt = new Date().toISOString();
      this.amqpConnection.publish('analytics', 'users.setDefaultOrg', event);
    } catch (e) {
      console.log(e)
    }
    
    return payload;
  }

  @ApiOperation({ summary: 'Verify a user\'s email address' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Post('verifyEmail/:id')
  async verifyEmail(
    @Req() req: Request,
    @Param('id') id: string
  ): Promise<Boolean> {
    let user = await this.userService.findRecord(id);

    if (!user) {
      throw new NotFoundException('User or organization not found');
    }

    // Send the verification email
    await this.userService.sendVerificationEmail(user.email, user.emailVerificationToken);

    const payload = true;

    try {
      const event = new UserEvent();
      event.url = req.url;
      event.method = req.method;
      event.headers = req.headers;
      event.body = req.body;
      event.crud = CRUDType.READ;
      event.charge = ChargeType.WEBMASTER;
      event.payload = payload;
      event.eventAt = new Date().toISOString();
      this.amqpConnection.publish('analytics', 'users.verifyEmail', event);
    } catch (e) {
      console.log(e)
    }
    
    return payload;
  }


  @ApiOperation({ summary: 'Recover a user\'s password by email address' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Post('recoverPassword/:email')
  async recoverPassword(
    @Req() req: Request,
    @Param('email') email: string
  ): Promise<Boolean> {
    let user = await this.userService.findByEmail(email)
    if (user) {
      user = await this.userService.findRecord(user.id);
    }
    
    if (!user) {
      throw new NotFoundException('User or organization not found');
    }

    // change
    user.recoverPasswordToken = uuidv4()
    
    // send changes to database
    await this.userService.update(user.id, user);

    // Send the verification email
    await this.userService.sendPasswordRevocery(user.email, user.recoverPasswordToken);

    const payload = true;

    try {
      const event = new UserEvent();
      event.url = req.url;
      event.method = req.method;
      event.headers = req.headers;
      event.body = req.body;
      event.crud = CRUDType.READ;
      event.charge = ChargeType.WEBMASTER;
      event.payload = payload;
      event.eventAt = new Date().toISOString();
      this.amqpConnection.publish('analytics', 'users.recoverPassword', event);
    } catch (e) {
      console.log(e)
    }
    
    return payload;
  }

  @ApiOperation({ summary: 'Reset a user\'s password' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Patch('resetPassword/:email')
  async resetPassword(
    @Req() req: Request,
    @Param('email') email: string,
    @Body() updatedUserData: User
  ): Promise<User> {
    let user = await this.userService.findByEmail(email)
    if (user) {
      user = await this.userService.findRecord(user.id);
    }
    let data: any = {}

    // if recoverPasswordToken is being submitted then
    if (updatedUserData.recoverPasswordToken) {
      // check to make sure it matches with what is already there
      // if it matches then set password to new password
      if (updatedUserData.recoverPasswordToken === user.recoverPasswordToken) {
        // update secure info
        data = {
          password: await hash(updatedUserData.password, 10)
        }
      } else {
        // do nothing
        throw new NotFoundException('Recover Password Token not found.')
      }
    }

    const payload = await this.userService.update(user.id, data);

    try {
      const event = new UserEvent();
      event.url = req.url;
      event.method = req.method;
      event.headers = req.headers;
      event.body = req.body;
      event.crud = CRUDType.READ;
      event.charge = ChargeType.WEBMASTER;
      event.payload = payload;
      event.eventAt = new Date().toISOString();
      this.amqpConnection.publish('analytics', 'users.resetPassword', event);
    } catch (e) {
      console.log(e)
    }
    
    return payload;
  }
}
