import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import config from './typeorm.config'; // Import your TypeORM configuration file

import { APP_FILTER } from '@nestjs/core';
import { TypeOrmExceptionFilter } from './typeorm-exception.filter';

import { NodeModule } from './flow/nodes/node.module';
import { CustomerModule } from './customers/customer.module';

@Module({
  imports: [
    RabbitMQModule.forRoot(RabbitMQModule, {
      exchanges: [
        {
          name: 'exchange1',
          type: 'topic',
        },
      ],
      uri: `amqp://${process.env.RABBITMQ_USER}:${process.env.RABBITMQ_PASSWORD}@localhost:5672`,
      connectionInitOptions: { wait: false },
    }),
    TypeOrmModule.forRoot(config),
    NodeModule,
    CustomerModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: TypeOrmExceptionFilter,
    },
  ],
})
export class AppModule {}
