import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthStatus } from './auth-status.decorator';
import { JwtService } from '@nestjs/jwt'; 
import { UserService } from './users/user.service';

@Injectable()
export class AuthStatusGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
    private userService: UserService
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

    // Access the properties from the decoded token
    const userId = decoded.sub;
    const email = decoded.email;

    // authorization logic
    let user = await this.userService.findOne(userId)
    console.log('authorization logic', user)

    if (!user) {
      return false; // User not found, denying access
    }

    // Check if the user's authStatus matches any of the allowed statuses
    if (statuses.includes(user.authStatus)) {
      console.log('statuses.includes true', user.authStatus)
      return true; // Grant access if authStatus matches
    } else {
      console.log('statuses.includes false', user.authStatus)
      return false; // Deny access if authStatus does not match
    }
  }
}
