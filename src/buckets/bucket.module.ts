import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { TypeOrmModule } from '@nestjs/typeorm';

import { JwtService } from '@nestjs/jwt';
import { Module, forwardRef } from '@nestjs/common';
import { BucketController } from './bucket.controller';
import { BucketService } from './bucket.service';

import { Bucket } from './bucket.entity';
import { OrganizationModule } from '../organizations/organization.module';
import { CategoryModule } from '../categories/category.module';
import { UserModule } from '../users/user.module';
import { AccountModule } from '../accounts/account.module';
import { BucketListener } from './bucket.listener';
import { AnalyticModule } from 'src/analytics/analytic.module';
import { InfluxDBService } from '../influxdb.service';

@Module({
  imports: [
    forwardRef(() => AnalyticModule),
    OrganizationModule,
    CategoryModule,
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
    TypeOrmModule.forFeature([Bucket]),
  ],
  exports: [
    BucketService
  ],
  controllers: [BucketController],
  providers: [BucketService, JwtService, BucketListener, InfluxDBService],
})
export class BucketModule {}
