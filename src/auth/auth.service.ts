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
    let orgname = ''; // this can't be null because secretOrPrivateKey must have a value
    // sometimes org may not be selected
    if (user.defaultOrganization) {
      orgname = user.defaultOrganization.orgname
    }
    
    // Generate and return a JWT token
    const payload = { 
      sub: user.id, 
      username: user.username,
      fullName: user.firstName + ' ' + user.lastName,
      email: user.email,
      orgname: orgname,
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
