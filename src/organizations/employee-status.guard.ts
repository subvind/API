import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { EmployeeStatus } from './employee-status.decorator';
import { JwtService } from '@nestjs/jwt'; 
import { UserService } from '../users/user.service';
import { AccountService } from '../accounts/account.service';
import { OrganizationService } from '../organizations/organization.service';

@Injectable()
export class EmployeeStatusGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
    private userService: UserService,
    private accountService: AccountService,
    private organizationService: OrganizationService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const statuses = this.reflector.get(EmployeeStatus, context.getHandler());
    console.log('authorization statuses', statuses)

    if (!statuses || statuses.length === 0) {
      return true; // No employeeStatus decorator found or no statuses specified, allowing access by default
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

    let organization: any;
    if (request.method === 'POST') {
      // get org from request.body.organization.id
      let organizationId = request.body.organization.id
      console.log('authorization org id found', organizationId)
      if (!organizationId) {
        return false; // org not found, denying access
      }
      organization = await this.organizationService.findRecord(organizationId)
      
    } else if (request.method === 'GET' || request.method === 'DELETE' || request.method === 'PATCH') {
      // get org from request.params.id object
      let organizationId = request.params.id
      console.log('authorization organization id found', organizationId)
      if (!organizationId) {
        return false; // organization not found, denying access
      }
      let organization = await this.organizationService.findOne(organizationId)
      organization = await this.organizationService.findRecord(organization.id)
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
       * is this person the owner of this org?
       */
      if (organization.owner.id === person.id) {
        console.log('authorization organization.owner true')
        return true; // this person is the owner of this org, granting access
      } else {
        console.log('authorization organization.owner false')
        return false; // this person is not the owner of this org, denying access
      }
    } else if (decoded.type === 'account') {
      person = await this.accountService.findRecord(personId)
      // console.log('authorization accountService', person)
      /**
       * is this person an employee of this org?
       */
      let match = false;
      organization.accounts.forEach((account) => {
        if (account.id === person.id) {
          match = true; // both accounts were found and match
        }
      })

      if (match) {
        // Check if the user's/account's employeeStatus matches any of the allowed statuses
        if (statuses.includes(person.employee.employeeStatus)) {
          console.log('authorization employeeStatus includes true', person.employee.employeeStatus, 'should be', statuses)
          return true; // Grant access if employeeStatus matches
        } else {
          console.log('authorization employeeStatus includes false', person.employee.employeeStatus, 'should be', statuses)
          return false; // Deny access if employeeStatus does not match
        }
      } else {
        return false; // account not found within org, denying access
      }
    } else {
      return false; // type === 'other', denying access
    }
  }
}
