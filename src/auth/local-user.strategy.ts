import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from './auth.service';

@Injectable()
export class LocalUserStrategy extends PassportStrategy(Strategy, 'user-local') {
  constructor(private authService: AuthService) {
    super({ 
      usernameField: 'email'
    });
  }

  async validate(email: string, password: string): Promise<any> {
    // console.log('LocalUserStrategy', email, password)
    const user = await this.authService.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}