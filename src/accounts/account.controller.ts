import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common'; // Import the NotFoundException

import { AccountService } from './account.service';
import { OrganizationService } from '../organizations/organization.service';
import { Account } from './account.entity';

import { ApiTags, ApiResponse, ApiOperation, ApiBody } from '@nestjs/swagger';

import { AuthStatus } from '../auth-status.decorator';
import { AuthStatusGuard } from '../auth-status.guard';
import { EmployeeStatusGuard } from './employee-status.guard';
import { EmployeeStatus } from './employee-status.decorator';

import { v4 as uuidv4 } from 'uuid';
import { hash } from 'bcrypt';

@ApiTags('accounts')
@Controller('accounts')
export class AccountController {
  constructor(
    private readonly accountService: AccountService,
    private readonly organizationService: OrganizationService,
    private readonly amqpConnection: AmqpConnection
  ) {}

  @ApiOperation({ summary: 'Get all accounts' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Get()
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
  ) {
    const { data, total } = await this.accountService.findAll(page, limit, search);
    return { data, total };
  }

  @ApiOperation({ summary: 'Get an account by id' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Account> {
    return this.accountService.findOne(id);
  }

  @ApiOperation({ summary: 'Get an account by accountname' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Get('accountname/:accountname/:organizationId')
  async findSingle(@Param('accountname') accountname: string, @Param('organizationId') organizationId: string): Promise<Account> {
    return this.accountService.findByAccountname(accountname, organizationId);
  }

  @ApiOperation({ summary: 'Create an account' })
  @ApiBody({ type: Account })
  @ApiResponse({ status: 201, description: 'Success', type: Account })
  @Post()
  @AuthStatus(['Verified'])
  @EmployeeStatus(['Working'])
  @UseGuards(AuthStatusGuard, EmployeeStatusGuard)
  async create(@Body() accountData: Account): Promise<Account> {
    return this.accountService.create(accountData);
  }

  @ApiOperation({ summary: 'Update an account' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Patch(':id')
  @AuthStatus(['Verified'])
  @EmployeeStatus(['Working'])
  @UseGuards(AuthStatusGuard, EmployeeStatusGuard)
  async update(@Param('id') id: string, @Body() updatedAccountData: Account): Promise<Account> {
    let account = await this.accountService.findRecord(id);
    let data
    const { password, ...accountDataWithoutPassword } = updatedAccountData;
    if (account.email === 'test@test.com') {
      // don't allow the password to be changed on test account
      data = accountDataWithoutPassword 
    } else {
      // allow password to be changed this is not a test account
      data = updatedAccountData
    }

    // for security reasons don't allow these values to be changed
    const { email, isEmailVerified, authStatus, ...accountDataWithoutSecureInfo } = data;
    data = accountDataWithoutSecureInfo

    // if emailVerificationToken is being submitted then
    if (data.emailVerificationToken) {
      // check to make sure it matches with what is already there
      // if it matches then set authStatus to Verified
      // and then set isEmailVerified to true
      if (data.emailVerificationToken === account.emailVerificationToken) {
        // update secure info
        data.authStatus = 'Verified'
        data.isEmailVerified = true
      } else {
        // update secure info
        data.authStatus = 'Pending'
        data.isEmailVerified = false
      }
    }

    return this.accountService.update(id, data);
  }

  @ApiOperation({ summary: 'Delete an account' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Delete(':id')
  @AuthStatus(['Verified'])
  @EmployeeStatus(['Working'])
  @UseGuards(AuthStatusGuard, EmployeeStatusGuard)
  @UseGuards(AuthStatusGuard)
  async remove(@Param('id') id: string): Promise<void> {
    return this.accountService.remove(id);
  }

  @ApiOperation({ summary: 'Find accounts related to an organization' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Get('type/:type/orgRelated/:id')
  async findOrgProduct(
    @Param('type') type: string,
    @Param('id') organizationId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
  ): Promise<any> {
    const organization = await this.organizationService.findOne(organizationId);

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    const { data, total } = await this.accountService.findOrgAccount(type, organization, page, limit, search);
    return { data, total };
  }

  @ApiOperation({ summary: 'Verify an account\'s email address' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Post('verifyEmail/:id')
  async verifyEmail(@Param('id') id: string): Promise<Boolean> {
    let account = await this.accountService.findRecord(id);

    if (!account) {
      throw new NotFoundException('Account or organization not found');
    }

    // Send the verification email
    await this.accountService.sendVerificationEmail(account.email, account.emailVerificationToken);

    return true;
  }

  @ApiOperation({ summary: 'Recover an account\'s password by email address' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Post('recoverPassword/:email/:organizationId')
  async recoverPassword(@Param('email') email: string, @Param('organizationId') organizationId: string): Promise<Boolean> {
    let account = await this.accountService.findByEmail(email, organizationId)
    if (account) {
      account = await this.accountService.findRecord(account.id);
    }
    
    if (!account) {
      throw new NotFoundException('Account or organization not found');
    }

    // change
    account.recoverPasswordToken = uuidv4()
    
    // send changes to database
    await this.accountService.update(account.id, account);

    // Send the verification email
    await this.accountService.sendPasswordRevocery(account.email, account.recoverPasswordToken);

    return true;
  }

  @ApiOperation({ summary: 'Reset an account\'s password' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Patch('resetPassword/:email/:organizationId')
  async resetPassword(@Param('email') email: string, @Param('organizationId') organizationId: string, @Body() updatedAccountData: Account): Promise<Account> {
    let account = await this.accountService.findByEmail(email, organizationId)
    if (account) {
      account = await this.accountService.findRecord(account.id);
    }
    let data: any = {}

    // if recoverPasswordToken is being submitted then
    if (updatedAccountData.recoverPasswordToken) {
      // check to make sure it matches with what is already there
      // if it matches then set password to new password
      if (updatedAccountData.recoverPasswordToken === account.recoverPasswordToken) {
        // update secure info
        data = {
          password: await hash(updatedAccountData.password, 10)
        }
      } else {
        // do nothing
        throw new NotFoundException('Recover Password Token not found.')
      }
    }

    return this.accountService.update(account.id, data);
  }
}
