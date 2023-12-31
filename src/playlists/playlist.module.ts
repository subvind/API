import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { TypeOrmModule } from '@nestjs/typeorm';

import { JwtService } from '@nestjs/jwt';
import { Module, forwardRef } from '@nestjs/common';
import { PlaylistController } from './playlist.controller';
import { PlaylistService } from './playlist.service';

import { Playlist } from './playlist.entity';
import { OrganizationModule } from '../organizations/organization.module';
import { UserModule } from '../users/user.module';
import { AccountModule } from '../accounts/account.module';
import { PlaylistListener } from './playlist.listener';
import { AnalyticModule } from 'src/analytics/analytic.module';
import { InfluxDBService } from '../influxdb.service';

@Module({
  imports: [
    forwardRef(() => AnalyticModule),
    OrganizationModule,
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
    TypeOrmModule.forFeature([Playlist]),
  ],
  exports: [
    PlaylistService
  ],
  controllers: [PlaylistController],
  providers: [PlaylistService, JwtService, PlaylistListener, InfluxDBService],
})
export class PlaylistModule {}
