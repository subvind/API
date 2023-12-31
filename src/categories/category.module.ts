import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { TypeOrmModule } from '@nestjs/typeorm';

import { JwtService } from '@nestjs/jwt';
import { Module, forwardRef } from '@nestjs/common';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';

import { Category } from './category.entity';
import { OrganizationModule } from '../organizations/organization.module';
import { UserModule } from '../users/user.module';
import { AccountModule } from '../accounts/account.module';
import { CategoryListener } from './category.listener';
import { AnalyticModule } from 'src/analytics/analytic.module';
import { InfluxDBService } from '../influxdb.service';

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
    TypeOrmModule.forFeature([Category]),
  ],
  exports: [
    CategoryService
  ],
  controllers: [CategoryController],
  providers: [CategoryService, JwtService, CategoryListener, InfluxDBService],
})
export class CategoryModule {}
