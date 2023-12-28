import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { TypeOrmModule } from '@nestjs/typeorm';

import { JwtService } from '@nestjs/jwt';
import { Module, forwardRef } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';

import { Product } from './product.entity';
import { OrganizationModule } from '../organizations/organization.module';
import { CategoryModule } from '../categories/category.module';
import { UserModule } from '../users/user.module';
import { AccountModule } from '../accounts/account.module';
import { ProductListener } from './product.listener';
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
    TypeOrmModule.forFeature([Product]),
  ],
  exports: [
    ProductService
  ],
  controllers: [ProductController],
  providers: [ProductService, JwtService, ProductListener, InfluxDBService],
})
export class ProductModule {}
