import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { TypeOrmModule } from '@nestjs/typeorm';

import { JwtService } from '@nestjs/jwt';
import { Module, forwardRef } from '@nestjs/common';
import { ShowcaseController } from './showcase.controller';
import { ShowcaseService } from './showcase.service';

import { Showcase } from './showcase.entity';
import { OrganizationModule } from '../organizations/organization.module';
import { UserModule } from '../users/user.module';
import { AccountModule } from '../accounts/account.module';
import { ShowcaseListener } from './showcase.listener';
import { AnalyticModule } from 'src/analytics/analytic.module';

@Module({
  imports: [
    forwardRef(() => AnalyticModule),
    OrganizationModule,
    UserModule,
    AccountModule,
    // forwardRef(() => OrganizationModule),
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
    TypeOrmModule.forFeature([Showcase]),
  ],
  exports: [
    ShowcaseService
  ],
  controllers: [ShowcaseController],
  providers: [ShowcaseService, JwtService, ShowcaseListener],
})
export class ShowcaseModule {}
