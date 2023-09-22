import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from './auth.service';

@Injectable()
export class LocalAccountStrategy extends PassportStrategy(Strategy, 'account-local') {
  constructor(private authService: AuthService) {
    super({ 
      usernameField: 'email',
      passReqToCallback: true
    });
  }

  async validate(request, email: string, password: string): Promise<any> {
    // console.log('LocalAccountStrategy request.body:', request.body);

    // Access body parameters from the request object
    const { organizationId } = request.body;

    console.log('LocalAccountStrategy', email, password)
    const user = await this.authService.validateAccount(email, password, organizationId);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}