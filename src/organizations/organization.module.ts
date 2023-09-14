import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Module, forwardRef } from '@nestjs/common';
import { OrganizationController } from './organization.controller';
import { OrganizationService } from './organization.service';

import { Organization } from './organization.entity';
import { UserModule } from '../users/user.module';

import { AuthStatusGuard } from '../auth-status.guard';
import { JwtService } from '@nestjs/jwt';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET, // Replace with your actual secret key
      signOptions: { expiresIn: '1h' }, // You can customize other options here
    }),
    forwardRef(() => UserModule),
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
    TypeOrmModule.forFeature([Organization]),
  ],
  exports: [
    OrganizationService
  ],
  controllers: [OrganizationController],
  providers: [
    OrganizationService,
    AuthStatusGuard,
    JwtService
  ],
})
export class OrganizationModule {}
