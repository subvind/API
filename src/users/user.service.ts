import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

import { compare } from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

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
      'user.role',
      'user.createdAt'
    ]);
    
    const [data, total] = await query.skip(offset).take(limit).getManyAndCount();
  
    return { data, total };
  }

  async findOne(id: string): Promise<User> {
    return this.userRepository.findOneBy({ id: id });
  }

  async findByEmail(email: string): Promise<User> {
    return this.userRepository.findOneBy({ email: email });
  }

  async findByUsername(username: string): Promise<User> {
    return this.userRepository.findOneBy({ username: username });
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
}