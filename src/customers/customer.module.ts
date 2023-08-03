import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Module } from '@nestjs/common';
import { CustomerController } from './customer.controller';
import { CustomerService } from './customer.service';

import { Customer } from './customer.entity';

@Module({
  imports: [
    RabbitMQModule.forRoot(RabbitMQModule, {
      exchanges: [
        {
          name: 'exchange1',
          type: 'topic',
        },
      ],
      uri: process.env.RABBITMQ,
      connectionInitOptions: { wait: false },
    }),
    TypeOrmModule.forFeature([Customer]),
  ],

  controllers: [CustomerController],
  providers: [CustomerService],
})
export class CustomerModule {}
