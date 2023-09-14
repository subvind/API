import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async () => ({
        secret: process.env.JWT_SECRET,
        signOptions: { 
          expiresIn: "365 days"
        }
      }),
    }),
  ],
  exports: [JwtModule],
})
export class JwtAuthModule {}
