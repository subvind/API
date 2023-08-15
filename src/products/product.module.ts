import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Module, forwardRef } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';

import { Product } from './product.entity';
import { OrganizationModule } from '../organizations/organization.module';

@Module({
  imports: [
    OrganizationModule,
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
    TypeOrmModule.forFeature([Product]),
  ],
  exports: [
    ProductService
  ],
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule {}
