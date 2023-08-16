import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Module, forwardRef } from '@nestjs/common';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';

import { Category } from './category.entity';
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
    TypeOrmModule.forFeature([Category]),
  ],
  exports: [
    CategoryService
  ],
  controllers: [CategoryController],
  providers: [CategoryService],
})
export class CategoryModule {}
