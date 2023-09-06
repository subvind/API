import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from './organization.entity';
import { User } from '../users/user.entity';

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
  
    query.leftJoinAndSelect('organization.owner', 'owner');
    query.leftJoinAndSelect('organization.orgPhoto', 'orgPhoto');
    
    query.addSelect([
      'owner.id',
      'owner.username',
      'owner.firstName',
      'owner.lastName',
      'owner.role',
      'owner.createdAt'
    ]);
    
    const offset = (page - 1) * limit;
  
    const [data, total] = await query.skip(offset).take(limit).getManyAndCount();
  
    return { data, total };
  }

  async findOne(id: string): Promise<Organization> {
    return this.organizationRepository.findOne({ 
      where: {
        id: id
      },
      relations: [
        'owner',
        'orgPhoto',
        'orgPhoto.bucket',
      ]
    });
  }

  async findByOrgname(orgname: string): Promise<Organization> {
    return this.organizationRepository.findOne({
      where: {
        orgname: orgname,
      },
      relations: [
        'owner',
        'orgPhoto',
        'orgPhoto.bucket',
      ]
    });
  }

  async findByHostname(hostname: string): Promise<Organization> {
    function isSubdomainOfErpnomy(hostname) {
      const pattern = /^[\w-]+\.erpnomy\.com$/i; // Case-insensitive match
      return pattern.test(hostname);
    }
    
    let org: any;
    if (isSubdomainOfErpnomy(hostname)) {
      org = this.organizationRepository.findOne({
        where: {
          orgname: hostname.split('.')[0],
        },
        relations: [
          'owner',
          'orgPhoto',
          'orgPhoto.bucket',
        ]
      });
    } else {
      org = this.organizationRepository.findOne({
        where: {
          hostname: hostname,
        },
        relations: [
          'owner',
          'orgPhoto',
          'orgPhoto.bucket',
        ]
      });
    }
    
    return org
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

  async findUserOrganizations(user: User, page: number, limit: number, search?: string): Promise<{ data: Organization[]; total: number }> {
    const query = this.organizationRepository.createQueryBuilder('organization');
  
    query.where(
      'organization.ownerId = :ownerId',
      { ownerId: user.id }
    );

    if (search) {
      query.andWhere(
        'organization.orgname LIKE :search',
        { search: `%${search}%` }
      );
    }

    query.leftJoinAndSelect('organization.orgPhoto', 'orgPhoto');
    query.leftJoinAndSelect('orgPhoto.bucket', 'bucket');
  
    const offset = (page - 1) * limit;
    
    const [data, total] = await query.skip(offset).take(limit).getManyAndCount();
  
    return { data, total };
  }
}