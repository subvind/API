import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Module } from '@nestjs/common';
import { UserController } from './user.controller';

import { AuthService } from '../auth/auth.service';
import { UserService } from './user.service';
import { JwtService } from '@nestjs/jwt';

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
      uri: process.env.RABBITMQ,
      connectionInitOptions: { wait: false },
    }),
    TypeOrmModule.forFeature([User]),
  ],
  exports: [
    UserService
  ],
  controllers: [UserController],
  providers: [UserService, AuthService, JwtService],
})
export class UserModule {}
