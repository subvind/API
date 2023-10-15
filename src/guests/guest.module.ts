import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { TypeOrmModule } from '@nestjs/typeorm';

import { JwtService } from '@nestjs/jwt';
import { Module, forwardRef } from '@nestjs/common';
import { GuestController } from './guest.controller';

import { AuthService } from '../auth/auth.service';
import { GuestService } from './guest.service';

import { Guest } from './guest.entity';
import { OrganizationModule } from '../organizations/organization.module';
import { AccountModule } from '../accounts/account.module';
import { UserModule } from '../users/user.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    forwardRef(() => OrganizationModule),
    forwardRef(() => AccountModule),
    forwardRef(() => UserModule),
    forwardRef(() => AuthModule),
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
    TypeOrmModule.forFeature([Guest]),
  ],
  exports: [
    GuestService
  ],
  controllers: [GuestController],
  providers: [GuestService, AuthService, JwtService],
})
export class GuestModule {}
