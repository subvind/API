import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthStatus } from './auth-status.decorator';
import { JwtService } from '@nestjs/jwt'; 
import { UserService } from './users/user.service';
import { AccountService } from './accounts/account.service';

@Injectable()
export class AuthStatusGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
    private userService: UserService,
    private accountService: AccountService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const statuses = this.reflector.get(AuthStatus, context.getHandler());
    console.log('statuses', statuses)

    if (!statuses || statuses.length === 0) {
      return true; // No authStatus decorator found or no statuses specified, allowing access by default
    }
    
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    if (!authHeader) {
      console.log('no authorization header')
      return false; // No Authorization header found, denying access
    }

    // Extract the token (remove "Bearer " prefix if present)
    const token = authHeader.replace('Bearer ', '');
    console.log('token', token)

    let decoded
    try {
      // Verify and decode the token using the JwtService
      decoded = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET
      });
      console.log('decoded', decoded)
    } catch (error) {
      console.log('Token verification failed', error)
      return false; // Token verification failed, denying access
    }

    let person: any;

    // Access the properties from the decoded token
    const personId = decoded.sub;
    const email = decoded.email;

    // authorization logic
    if (decoded.type === 'user') {
      person = await this.userService.findOne(personId)
      console.log('userService', person)
    } else if (decoded.type === 'account') {
      person = await this.accountService.findOne(personId)
      console.log('accountService', person)
    } else {
      return false; // type === 'other'
    }

    if (!person) {
      return false; // Person not found, denying access
    }

    // Check if the user's/account's authStatus matches any of the allowed statuses
    if (statuses.includes(person.authStatus)) {
      console.log('statuses.includes true', person.authStatus)
      return true; // Grant access if authStatus matches
    } else {
      console.log('statuses.includes false', person.authStatus)
      return false; // Deny access if authStatus does not match
    }
  }
}
