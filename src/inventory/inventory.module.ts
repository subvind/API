import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Module, forwardRef } from '@nestjs/common';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';

import { Inventory } from './inventory.entity';
import { OrganizationModule } from '../organizations/organization.module';

@Module({
  imports: [
    OrganizationModule,
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
    TypeOrmModule.forFeature([Inventory]),
  ],
  exports: [
    InventoryService
  ],
  controllers: [InventoryController],
  providers: [InventoryService],
})
export class InventoryModule {}
