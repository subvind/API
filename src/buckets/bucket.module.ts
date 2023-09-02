import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Module, forwardRef } from '@nestjs/common';
import { BucketController } from './bucket.controller';
import { BucketService } from './bucket.service';

import { Bucket } from './bucket.entity';
import { OrganizationModule } from '../organizations/organization.module';
import { CategoryModule } from '../categories/category.module';

@Module({
  imports: [
    OrganizationModule,
    CategoryModule,
    // forwardRef(() => OrganizationModule),
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
    TypeOrmModule.forFeature([Bucket]),
  ],
  exports: [
    BucketService
  ],
  controllers: [BucketController],
  providers: [BucketService],
})
export class BucketModule {}
