import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from './auth.service';

@Injectable()
export class LocalAccountStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ 
      usernameField: 'email',
      passReqToCallback: true
    });
  }

  async validate(request, email: string, password: string): Promise<any> {
    // Access the request object, e.g., request.user for user information
    console.log('LocalAccountStrategy request:', JSON.stringify(request));

    console.log('LocalAccountStrategy', email, password)
    const user = await this.authService.validateAccount(email, password, request.organizationId);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}