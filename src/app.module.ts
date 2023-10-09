import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import config from './typeorm.config'; // Import your TypeORM configuration file

import { APP_FILTER } from '@nestjs/core';
import { TypeOrmExceptionFilter } from './typeorm-exception.filter';

import { JwtAuthModule } from './auth/jwt.module';
import { AuthModule } from './auth/auth.module';

import { AccountModule } from './accounts/account.module';
import { BucketModule } from './buckets/bucket.module';
import { CategoryModule } from './categories/category.module';
import { FileModule } from './files/file.module';
import { InventoryModule } from './inventory/inventory.module';
import { OrganizationModule } from './organizations/organization.module';
import { ProductModule } from './products/product.module';
import { ShowcaseModule } from './showcases/showcase.module';
import { UserModule } from './users/user.module';

@Module({
  imports: [
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
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot(config),
    JwtAuthModule,
    AuthModule,
    AccountModule,
    BucketModule,
    CategoryModule,
    FileModule,
    InventoryModule,
    OrganizationModule,
    ProductModule,
    ShowcaseModule,
    UserModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: TypeOrmExceptionFilter,
    },
  ],
})
export class AppModule {}
