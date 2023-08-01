import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { Customer } from './customer.entity';

import { LocalAuth } from './local-auth.decorator';

@Controller('customers')
export class CustomerController {
  constructor(
    private readonly customerService: CustomerService,
    private readonly amqpConnection: AmqpConnection
  ) {}

  // @Get()
  // getHello(): string {
  //   this.amqpConnection.publish('exchange1', 'subscribe-route', { msg: 'hello world' });

  //   return this.customerService.getHello();
  // }

  @Get()
  @LocalAuth()
  async findAll(): Promise<Customer[]> {
    return this.customerService.findAll();
  }

  @Get(':id')
  @LocalAuth()
  async findOne(@Param('id') id: string): Promise<Customer> {
    return this.customerService.findOne(id);
  }

  @Post()
  @LocalAuth()
  async create(@Body() customerData: Customer): Promise<Customer> {
    return this.customerService.create(customerData);
  }

  @Patch(':id')
  @LocalAuth()
  async update(@Param('id') id: string, @Body() updatedCustomerData: Customer): Promise<Customer> {
    return this.customerService.update(id, updatedCustomerData);
  }

  @Delete(':id')
  @LocalAuth()
  async remove(@Param('id') id: string): Promise<void> {
    return this.customerService.remove(id);
  }
}
