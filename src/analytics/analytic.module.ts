import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { TypeOrmModule } from '@nestjs/typeorm';

import { JwtService } from '@nestjs/jwt';
import { Module, forwardRef } from '@nestjs/common';
import { AnalyticController } from './analytic.controller';
import { AnalyticService } from './analytic.service';

import { Analytic } from './analytic.entity';
import { OrganizationModule } from '../organizations/organization.module';
import { AccountModule } from '../accounts/account.module';
import { UserModule } from '../users/user.module';
import { AnalyticListener } from './analytic.listener';
import { BucketModule } from 'src/buckets/bucket.module';
import { CategoryModule } from 'src/categories/category.module';
import { FileModule } from 'src/files/file.module';
import { PlaylistModule } from 'src/playlists/playlist.module';
import { ProductModule } from 'src/products/product.module';
import { ShowcaseModule } from 'src/showcases/showcase.module';
import { VideoModule } from 'src/videos/video.module';
import { AnalyticCron } from './analytic.cron';

@Module({
  imports: [
    forwardRef(() => AccountModule),
    forwardRef(() => BucketModule),
    forwardRef(() => CategoryModule),
    forwardRef(() => FileModule),
    forwardRef(() => OrganizationModule),
    forwardRef(() => PlaylistModule),
    forwardRef(() => ProductModule),
    forwardRef(() => ShowcaseModule),
    forwardRef(() => UserModule),
    forwardRef(() => VideoModule),
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
    TypeOrmModule.forFeature([Analytic]),
  ],
  exports: [
    AnalyticService
  ],
  controllers: [AnalyticController],
  providers: [AnalyticService, JwtService, AnalyticListener, AnalyticCron],
})
export class AnalyticModule {}
