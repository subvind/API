import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { TypeOrmModule } from '@nestjs/typeorm';

import { JwtService } from '@nestjs/jwt';
import { Module, forwardRef } from '@nestjs/common';
import { FileController } from './file.controller';
import { FileService } from './file.service';

import { File } from './file.entity';
import { OrganizationModule } from '../organizations/organization.module';
import { BucketModule } from '../buckets/bucket.module';
import { UserModule } from '../users/user.module';
import { AccountModule } from '../accounts/account.module';

@Module({
  imports: [
    OrganizationModule,
    BucketModule,
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
    TypeOrmModule.forFeature([File]),
  ],
  exports: [
    FileService
  ],
  controllers: [FileController],
  providers: [FileService, JwtService],
})
export class FileModule {}
