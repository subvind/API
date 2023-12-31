import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

import { compare } from 'bcrypt';
import * as mailgun from 'mailgun-js';

@Injectable()
export class UserService {
  private readonly mg;

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    this.mg = mailgun({
      apiKey: process.env.MAILGUN_API_KEY || '123',
      domain: process.env.MAILGUN_DOMAIN || '123',
    });
  }
  
  getHello(): string {
    return 'Hello World!';
  }
  
  async findAll(page: number, limit: number, search?: string): Promise<{ data: User[]; total: number }> {
    const query = this.userRepository.createQueryBuilder('user');
  
    if (search) {
      query.where(
        'user.username LIKE :search',
        { search: `%${search}%` }
      );
    }
  
    const offset = (page - 1) * limit;
  
    query.select([
      'user.id',
      'user.username',
      'user.firstName',
      'user.lastName',
      'user.authStatus',
      'user.twitter',
      'user.youtube',
      'user.defaultOrganization',
      'user.isEmailVerified',
      'user.createdAt'
    ]);
    
    const [data, total] = await query.skip(offset).take(limit).getManyAndCount();
  
    return { data, total };
  }

  async findRecord(id: string): Promise<User> {
    return this.userRepository.findOne({ 
      where: {
        id: id
      },
      relations: ['defaultOrganization'],
      select: ['id', 'username', 'firstName', 'lastName', 'email', 'password', 'authStatus', 'twitter', 'youtube', 'emailVerificationToken', 'isEmailVerified', 'recoverPasswordToken', 'createdAt']
    });
  }

  async findOne(id: string): Promise<User> {
    return this.userRepository.findOne({ 
      where: {
        id: id
      },
      relations: ['defaultOrganization'],
      select: ['id', 'username', 'firstName', 'lastName', 'authStatus', 'twitter', 'youtube', 'isEmailVerified', 'createdAt'] 
    });
  }

  async findByEmail(email: string): Promise<User> {
    // select password is needed here because of
    // auth bcrypt compare step at verifyPassword
    return this.userRepository.findOne({ 
      where: {
        email: email
      },
      relations: ['defaultOrganization'],
      select: ['id', 'username', 'firstName', 'lastName', 'password', 'authStatus', 'twitter', 'youtube', 'isEmailVerified', 'createdAt'] 
    });
  }

  async findByUsername(username: string): Promise<User> {
    return this.userRepository.findOne({ 
      where: {
        username: username
      },
      relations: ['defaultOrganization'],
      select: ['id', 'username', 'firstName', 'lastName', 'authStatus', 'twitter', 'youtube', 'isEmailVerified', 'createdAt'] 
    });
  }

  async create(user: User): Promise<User> {
    const newObject = this.userRepository.create(user);
    return this.userRepository.save(newObject);
  }

  async update(id: string, user: User): Promise<User> {
    await this.userRepository.update(id, user);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.userRepository.delete(id);
  }

  async verifyPassword(user: User, password: string): Promise<boolean> {
    return compare(password, user.password);
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