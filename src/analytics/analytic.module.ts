import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { TypeOrmModule } from '@nestjs/typeorm';

import { JwtService } from '@nestjs/jwt';
import { Module, forwardRef } from '@nestjs/common';
import { AnalyticController } from './analytic.controller';
import { AnalyticService } from './analytic.service';

import { Analytic } from './analytic.entity';
import { OrganizationModule } from '../organizations/organization.module';
import { AccountModule } from '../accounts/account.module';
import { UserModule } from '../users/user.module';

@Module({
  imports: [
    forwardRef(() => UserModule),
    forwardRef(() => OrganizationModule),
    forwardRef(() => AccountModule),
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
    TypeOrmModule.forFeature([Analytic]),
  ],
  exports: [
    AnalyticService
  ],
  controllers: [AnalyticController],
  providers: [AnalyticService, JwtService],
})
export class AnalyticModule {}
