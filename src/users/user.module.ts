import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';

import { User } from './user.entity';

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
    TypeOrmModule.forFeature([User]),
  ],
  exports: [
    UserService
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
