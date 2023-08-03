import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.entity';

import { ApiTags, ApiResponse, ApiOperation, ApiBody } from '@nestjs/swagger';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly amqpConnection: AmqpConnection
  ) {}

  @Get()
  getHello(): string {
    this.amqpConnection.publish('exchange1', 'subscribe-route', { msg: 'hello world' });

    return this.userService.getHello();
  }

  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Get()
  async findAll(): Promise<User[]> {
    return this.userService.findAll();
  }

  @ApiOperation({ summary: 'Get a user by id' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<User> {
    return this.userService.findOne(id);
  }

  @ApiOperation({ summary: 'Create a user' })
  @ApiBody({ type: User })
  @ApiResponse({ status: 201, description: 'Success', type: User })
  @Post()
  async create(@Body() userData: User): Promise<User> {
    return this.userService.create(userData);
  }

  @ApiOperation({ summary: 'Update a user' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updatedUserData: User): Promise<User> {
    return this.userService.update(id, updatedUserData);
  }

  @ApiOperation({ summary: 'Delete a user' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.userService.remove(id);
  }
}
