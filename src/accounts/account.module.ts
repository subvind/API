import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Module, forwardRef } from '@nestjs/common';
import { AccountController } from './account.controller';

import { AuthService } from '../auth/auth.service';
import { AccountService } from './account.service';
import { OrganizationModule } from '../organizations/organization.module';
import { JwtService } from '@nestjs/jwt';
import { EventEmitterModule } from '@nestjs/event-emitter';

import { Account } from './account.entity';
import { UserModule } from '../users/user.module';
import { AccountListener } from './account.listener';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    forwardRef(() => UserModule),
    forwardRef(() => OrganizationModule),
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
    TypeOrmModule.forFeature([Account]),
  ],
  exports: [
    AccountService
  ],
  controllers: [AccountController],
  providers: [AccountService, AuthService, JwtService, AccountListener],
})
export class AccountModule {}
