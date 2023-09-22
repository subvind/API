import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from './auth.service';

@Injectable()
export class LocalAccountStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'email', organizationField: 'organizationId' });
  }

  async validate(email: string, organizationId: string, password: string): Promise<any> {
    const user = await this.authService.validateAccount(email, organizationId, password);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}