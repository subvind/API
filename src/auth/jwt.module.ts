import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';

const expiresInInSeconds = 356 * 24 * 60 * 60; // 356 days in seconds

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async () => ({
        secret: process.env.JWT_SECRET,
        signOptions: { 
          expiresIn: expiresInInSeconds
        }
      }),
    }),
  ],
  exports: [JwtModule],
})
export class JwtAuthModule {}
