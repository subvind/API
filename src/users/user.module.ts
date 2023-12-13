import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Module, forwardRef } from '@nestjs/common';
import { UserController } from './user.controller';

import { AuthService } from '../auth/auth.service';
import { UserService } from './user.service';
import { OrganizationModule } from '../organizations/organization.module';
import { JwtService } from '@nestjs/jwt';

import { User } from './user.entity';
import { AuthModule } from '../auth/auth.module';
import { AccountModule } from '../accounts/account.module';
import { AnalyticModule } from 'src/analytics/analytic.module';
import { UserListener } from './user.listener';

@Module({
  imports: [
    forwardRef(() => AnalyticModule),
    forwardRef(() => AccountModule),
    forwardRef(() => AuthModule),
    forwardRef(() => OrganizationModule),
    RabbitMQModule.forRoot(RabbitMQModule, {
      exchanges: [
        {
          name: 'analytics',
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
  providers: [UserService, AuthService, JwtService, UserListener],
})
export class UserModule {}
