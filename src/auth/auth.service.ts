import { Injectable } from '@nestjs/common';
import { UserService } from '../users/user.service';
import { AccountService } from '../accounts/account.service';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/user.entity';
import { Account } from '../accounts/account.entity';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private accountService: AccountService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userService.findByEmail(email);
    if (user && (await this.userService.verifyPassword(user, password))) {
      return user;
    }
    return null;
  }

  async validateAccount(email: string, organizationId: string, password: string): Promise<Account | null> {
    const account = await this.accountService.findByEmail(email, organizationId);
    if (account && (await this.accountService.verifyPassword(account, password))) {
      return account;
    }
    return null;
  }

  async userLogin(user: User) {
    // Generate and return a JWT token
    const payload: any = { 
      sub: user.id, 
      username: user.username,
      fullName: user.firstName + ' ' + user.lastName,
      email: user.email,
      type: 'user'
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

  async accountLogin(account: Account) {
    // Generate and return a JWT token
    const payload: any = { 
      sub: account.id, 
      accountname: account.accountname,
      fullName: account.firstName + ' ' + account.lastName,
      email: account.email,
      type: 'account'
    };
    
    // sometimes org may not be selected
    if (account.organization) {
      payload.orgname = account.organization.orgname
    }

    // console.log('login payload', payload)

    return {
      access_token: this.jwtService.sign(payload, {
        secret: process.env.JWT_SECRET
      }),
    };
  }
}
