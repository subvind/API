import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import config from './typeorm.config'; // Import your TypeORM configuration file

import { APP_FILTER } from '@nestjs/core';
import { TypeOrmExceptionFilter } from './typeorm-exception.filter';

import { JwtAuthModule } from './auth/jwt.module';

import { AnalyticModule } from './analytics/analytic.module';
import { AuthModule } from './auth/auth.module';
import { AccountModule } from './accounts/account.module';
import { BucketModule } from './buckets/bucket.module';
import { CategoryModule } from './categories/category.module';
import { FileModule } from './files/file.module';
import { GuestModule } from './guests/guest.module';
import { InventoryModule } from './inventory/inventory.module';
import { OrganizationModule } from './organizations/organization.module';
import { PlaylistModule } from './playlists/playlist.module';
import { ProductModule } from './products/product.module';
import { ShowcaseModule } from './showcases/showcase.module';
import { UserModule } from './users/user.module';
import { VideoModule } from './videos/video.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
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
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot(config),
    JwtAuthModule,
    AnalyticModule,
    AuthModule,
    AccountModule,
    BucketModule,
    CategoryModule,
    FileModule,
    GuestModule,
    InventoryModule,
    OrganizationModule,
    PlaylistModule,
    ProductModule,
    ShowcaseModule,
    UserModule,
    VideoModule
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
