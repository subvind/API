import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from './organization.entity';

import { compare } from 'bcrypt';

@Injectable()
export class OrganizationService {
  constructor(
    @InjectRepository(Organization)
    private readonly organizationRepository: Repository<Organization>,
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
  
  async findAll(page: number, limit: number, search?: string): Promise<{ data: Organization[]; total: number }> {
    const query = this.organizationRepository.createQueryBuilder('organization');
  
    if (search) {
      query.where(
        'organization.orgname LIKE :search',
        { search: `%${search}%` }
      );
    }
  
    // Include the 'users' relationship in the query
    query.leftJoinAndSelect('organization.owner', 'owner');
    
    const offset = (page - 1) * limit;
  
    const [data, total] = await query.skip(offset).take(limit).getManyAndCount();
  
    return { data, total };
  }

  async findOne(id: string): Promise<Organization> {
    return this.organizationRepository.findOneBy({ id: id });
  }

  async findByOrgname(orgname: string): Promise<Organization> {
    return this.organizationRepository.findOneBy({ orgname: orgname });
  }

  async create(organization: Organization): Promise<Organization> {
    const newObject = this.organizationRepository.create(organization);
    return this.organizationRepository.save(newObject);
  }

  async update(id: string, organization: Organization): Promise<Organization> {
    await this.organizationRepository.update(id, organization);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.organizationRepository.delete(id);
  }
}