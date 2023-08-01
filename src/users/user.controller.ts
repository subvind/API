import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.entity';

@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly amqpConnection: AmqpConnection
  ) {}

  // @Get()
  // getHello(): string {
  //   this.amqpConnection.publish('exchange1', 'subscribe-route', { msg: 'hello world' });

  //   return this.userService.getHello();
  // }

  @Get()
  async findAll(): Promise<User[]> {
    return this.userService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<User> {
    return this.userService.findOne(id);
  }

  @Post()
  async create(@Body() userData: User): Promise<User> {
    return this.userService.create(userData);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updatedUserData: User): Promise<User> {
    return this.userService.update(id, updatedUserData);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.userService.remove(id);
  }
}
