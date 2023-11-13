import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserStatus } from './user-status.decorator';
import { JwtService } from '@nestjs/jwt'; 
import { UserService } from './user.service';

@Injectable()
export class UserStatusGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
    private userService: UserService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const statuses = this.reflector.get(UserStatus, context.getHandler());
    console.log('authorization statuses', statuses)

    if (!statuses || statuses.length === 0) {
      return true; // No userStatus decorator found or no statuses specified, allowing access by default
    } else {
      // unused setting so anything may be used here
      // such as @UserStatus(['Owner'])
    }
    
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    if (!authHeader) {
      console.log('authorization no header')
      return false; // No Authorization header found, denying access
    }

    // Extract the token (remove "Bearer " prefix if present)
    const token = authHeader.replace('Bearer ', '');
    // console.log('authorization token', token)

    let decoded
    try {
      // Verify and decode the token using the JwtService
      decoded = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET
      });
      // console.log('authorization decoded', decoded)
    } catch (error) {
      console.log('authorization token verification failed', error)
      return false; // Token verification failed, denying access
    }

    let user: any;
    if (request.method === 'GET' || request.method === 'POST') {
      return true;
      
    } else if (request.method === 'DELETE' || request.method === 'PATCH') {
      // get org from request.params.id
      let userId = request.params.id
      console.log('user id found', userId)
      if (!userId) {
        return false; // user not found, denying access
      }
      user = await this.userService.findRecord(userId)
    }
    // console.log('authorization organization', organization)

    let person: any;

    // Access the properties from the decoded token
    const personId = decoded.sub;
    const email = decoded.email;

    // authorization logic
    if (decoded.type === 'user') {
      person = await this.userService.findRecord(personId)
      // console.log('authorization userService', person)
      /**
       * is this person the owner of this user?
       */
      if (user.id === person.id) {
        console.log('authorization user/person true')
        return true; // this person is the owner of this user, granting access
      } else {
        console.log('authorization user/person false')
        return false; // this person is not the owner of this user, denying access
      }
    } else {
      return false; // type === 'other', denying access
    }
  }
}
