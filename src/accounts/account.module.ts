import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Module, forwardRef } from '@nestjs/common';
import { AccountController } from './account.controller';

import { AuthService } from '../auth/auth.service';
import { AccountService } from './account.service';
import { JwtService } from '@nestjs/jwt';

import { OrganizationModule } from '../organizations/organization.module';
import { AnalyticModule } from 'src/analytics/analytic.module';
import { UserModule } from '../users/user.module';

import { Account } from './account.entity';
import { AccountListener } from './account.listener';
import { InfluxDBService } from '../influxdb.service';

@Module({
  imports: [
    forwardRef(() => AnalyticModule),
    forwardRef(() => UserModule),
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
    TypeOrmModule.forFeature([Account]),
  ],
  exports: [
    AccountService
  ],
  controllers: [AccountController],
  providers: [AccountService, AuthService, JwtService, AccountListener, InfluxDBService],
})
export class AccountModule {}
