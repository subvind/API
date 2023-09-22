import { Module, forwardRef } from '@nestjs/common';

import { AuthService } from './auth.service';
import { LocalUserStrategy } from './local-user.strategy';
import { LocalAccountStrategy } from './local-account.strategy';
import { UserModule } from '../users/user.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AccountModule } from '../accounts/account.module';

@Module({
  imports: [
    forwardRef(() => UserModule),
    AccountModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { 
        expiresIn: '365 days' 
      },
    }),
  ],
  controllers: [
    AuthController
  ],
  providers: [AuthService, LocalUserStrategy, LocalAccountStrategy],
  exports: [AuthService],
})
export class AuthModule {}