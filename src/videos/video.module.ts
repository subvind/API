import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { TypeOrmModule } from '@nestjs/typeorm';

import { JwtService } from '@nestjs/jwt';
import { Module, forwardRef } from '@nestjs/common';
import { VideoController } from './video.controller';
import { VideoService } from './video.service';

import { Video } from './video.entity';
import { OrganizationModule } from '../organizations/organization.module';
import { PlaylistModule } from '../playlists/playlist.module';
import { UserModule } from '../users/user.module';
import { AccountModule } from '../accounts/account.module';
import { VideoListener } from './video.listener';
import { AnalyticModule } from 'src/analytics/analytic.module';

@Module({
  imports: [
    forwardRef(() => AnalyticModule),
    OrganizationModule,
    PlaylistModule,
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
    TypeOrmModule.forFeature([Video]),
  ],
  exports: [
    VideoService
  ],
  controllers: [VideoController],
  providers: [VideoService, JwtService, VideoListener],
})
export class VideoModule {}
