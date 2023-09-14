import { Injectable } from '@nestjs/common';
import { UserService } from '../users/user.service';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/user.entity';

@Injectable()
export class AuthService {
  constructor(private userService: UserService, private jwtService: JwtService) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userService.findByEmail(email);
    if (user && (await this.userService.verifyPassword(user, password))) {
      return user;
    }
    return null;
  }

  async login(user: User) {
    // Generate and return a JWT token
    const payload: any = { 
      sub: user.id, 
      username: user.username,
      fullName: user.firstName + ' ' + user.lastName,
      email: user.email
    };
    
    // sometimes org may not be selected
    if (user.defaultOrganization) {
      payload.orgname = user.defaultOrganization.orgname
    }

    // console.log('login payload', payload)

    return {
      access_token: this.jwtService.sign(payload, {
        secret: process.env.JWT_SECRET
      }),
    };
  }
}
