import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { Customer } from './customer.entity';

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
  async findAll(): Promise<Customer[]> {
    return this.customerService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Customer> {
    return this.customerService.findOne(id);
  }

  @Post()
  async create(@Body() customerData: Customer): Promise<Customer> {
    return this.customerService.create(customerData);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updatedCustomerData: Customer): Promise<Customer> {
    return this.customerService.update(id, updatedCustomerData);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.customerService.remove(id);
  }
}
