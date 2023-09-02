import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Module, forwardRef } from '@nestjs/common';
import { FileController } from './file.controller';
import { FileService } from './file.service';

import { File } from './file.entity';
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
    TypeOrmModule.forFeature([File]),
  ],
  exports: [
    FileService
  ],
  controllers: [FileController],
  providers: [FileService],
})
export class FileModule {}
