import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from './account.entity';
import { Organization } from '../organizations/organization.entity';

import { compare } from 'bcrypt';
import * as mailgun from 'mailgun-js';

@Injectable()
export class AccountService {
  private readonly mg;

  constructor(
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
  ) {
    this.mg = mailgun({
      apiKey: process.env.MAILGUN_API_KEY || '123',
      domain: process.env.MAILGUN_DOMAIN || '123',
    });
  }

  @RabbitSubscribe({
    exchange: 'exchange1',
    routingKey: 'subscribe-route',
    queue: 'subscribe-queue',
  })
  public async pubSubHandler(msg: {}) {
    console.log(`Received message: ${JSON.stringify(msg)}`);
  }
  
  getHello(): string {
    return 'Hello World!';
  }
  
  async findAll(page: number, limit: number, search?: string): Promise<{ data: Account[]; total: number }> {
    const query = this.accountRepository.createQueryBuilder('account');
  
    if (search) {
      query.where(
        'account.accountname LIKE :search',
        { search: `%${search}%` }
      );
    }
  
    const offset = (page - 1) * limit;
  
    query.select([
      'account.id',
      'account.accountname',
      'account.firstName',
      'account.lastName',
      'account.authStatus',
      'account.twitter',
      'account.youtube',
      'account.organization',
      'account.isEmailVerified',
      'account.createdAt'
    ]);
    
    const [data, total] = await query.skip(offset).take(limit).getManyAndCount();
  
    return { data, total };
  }

  async findRecord(id: string): Promise<Account> {
    return this.accountRepository.findOne({ 
      where: {
        id: id
      },
      relations: ['organization', 'suppleir', 'employee', 'customer'],
      select: ['id', 'accountname', 'firstName', 'lastName', 'email', 'password', 'authStatus', 'twitter', 'youtube', 'emailVerificationToken', 'isEmailVerified', 'recoverPasswordToken', 'createdAt']
    });
  }

  async findOne(id: string): Promise<Account> {
    return this.accountRepository.findOne({ 
      where: {
        id: id
      },
      relations: ['organization', 'suppleir', 'employee', 'customer'],
      select: ['id', 'accountname', 'firstName', 'lastName', 'authStatus', 'twitter', 'youtube', 'isEmailVerified', 'createdAt'] 
    });
  }

  async findByEmail(email: string): Promise<Account> {
    // select password is needed here because of
    // auth bcrypt compare step at verifyPassword
    return this.accountRepository.findOne({ 
      where: {
        email: email
      },
      relations: ['organization', 'suppleir', 'employee', 'customer'],
      select: ['id', 'accountname', 'firstName', 'lastName', 'password', 'authStatus', 'twitter', 'youtube', 'isEmailVerified', 'createdAt'] 
    });
  }

  async findByAccountname(accountname: string): Promise<Account> {
    return this.accountRepository.findOne({ 
      where: {
        accountname: accountname
      },
      relations: ['organization', 'suppleir', 'employee', 'customer'],
      select: ['id', 'accountname', 'firstName', 'lastName', 'authStatus', 'twitter', 'youtube', 'isEmailVerified', 'createdAt'] 
    });
  }

  async create(account: Account): Promise<Account> {
    const newObject = this.accountRepository.create(account);
    return this.accountRepository.save(newObject);
  }

  async update(id: string, account: Account): Promise<Account> {
    await this.accountRepository.update(id, account);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.accountRepository.delete(id);
  }

  async findOrgAccount(type: string, organization: Organization, page: number, limit: number, search?: string): Promise<{ data: Account[]; total: number }> {
    const query = this.accountRepository.createQueryBuilder('account');
  
    query.where(
      'account.organizationId = :tenantId',
      { tenantId: organization.id }
    );

    if (search) {
      query.andWhere(
        '(account.accountname LIKE :search OR account.firstName LIKE :search OR account.lastName LIKE :search)',
        { search: `%${search}%` }
      );
    }

    if (type === 'customer') {
      query.where(
        'account.customer.customerStatus != :status',
        { status: 'Void' }
      );
    } else if (type === 'employee') {
      query.where(
        'account.employee.employeeStatus != :status',
        { status: 'Void' }
      );
    } else if (type === 'supplier') {
      query.where(
        'account.supplier.supplierStatus != :status',
        { status: 'Void' }
      );
    } else {
      // fetch all
    }
    
    query.leftJoinAndSelect('account.organization', 'organization');
    query.leftJoinAndSelect('account.customer', 'customer');
    query.leftJoinAndSelect('account.employee', 'employee');
    query.leftJoinAndSelect('account.supplier', 'supplier');
  
    const offset = (page - 1) * limit;
    
    const [data, total] = await query.skip(offset).take(limit).getManyAndCount();
  
    return { data, total };
  }

  async verifyPassword(account: Account, password: string): Promise<boolean> {
    return compare(password, account.password);
  }

  async sendVerificationEmail(email: string, emailVerificationToken: string): Promise<void> {
    const data = {
      from: 'subscribers@mail.subvind.com', // Replace with your sender email
      to: email,
      subject: 'Email Verification - Powered by subvind.com',
      text: `Copy/paste the following token to verify this email: ${emailVerificationToken}`,
    };

    try {
      await this.mg.messages().send(data);
      console.log('Verification email sent successfully');
    } catch (error) {
      console.error('Error sending verification email:', error);
      throw error;
    }
  }

  async sendPasswordRevocery(email: string, recoverPasswordToken: string): Promise<void> {
    const data = {
      from: 'subscribers@mail.subvind.com', // Replace with your sender email
      to: email,
      subject: 'Password Recovery - Powered by subvind.com',
      text: `Copy/paste the following token to verify this email: ${recoverPasswordToken}`,
    };

    try {
      await this.mg.messages().send(data);
      console.log('Verification email sent successfully');
    } catch (error) {
      console.error('Error sending verification email:', error);
      throw error;
    }
  }
}