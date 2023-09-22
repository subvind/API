import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from './auth.service';

@Injectable()
export class LocalAccountStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'email' });
  }

  async validate(email: string, password: string, organizationId: string): Promise<any> {
    const user = await this.authService.validateAccount(email, password, organizationId);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}