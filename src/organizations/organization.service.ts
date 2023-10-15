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

  async findRecord(id: string): Promise<Organization> {
    return this.organizationRepository.findOne({ 
      where: {
        id: id
      },
      relations: [
        'owner',
        'accounts',
        'accounts.customer',
        'accounts.employee',
        'accounts.supplier',
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

  async findByErpHostname(erpHostname: string): Promise<Organization> {
    function isSubdomainOfErpnomy(erpHostname) {
      const pattern = /^[\w-]+\.erpnomy\.com$/i; // Case-insensitive match
      return pattern.test(erpHostname);
    }
    
    let org: any;
    if (isSubdomainOfErpnomy(erpHostname)) {
      org = this.organizationRepository.findOne({
        where: {
          orgname: erpHostname.split('.')[0],
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
          erpHostname: erpHostname,
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


  async findByTubeHostname(tubeHostname: string): Promise<Organization> {
    function isSubdomainOfErpnomy(tubeHostname) {
      const pattern = /^[\w-]+\.tubenomy\.com$/i; // Case-insensitive match
      return pattern.test(tubeHostname);
    }
    
    let org: any;
    if (isSubdomainOfErpnomy(tubeHostname)) {
      org = this.organizationRepository.findOne({
        where: {
          orgname: tubeHostname.split('.')[0],
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
          tubeHostname: tubeHostname,
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


  async findByDeskHostname(deskHostname: string): Promise<Organization> {
    function isSubdomainOfErpnomy(deskHostname) {
      const pattern = /^[\w-]+\.desknomy\.com$/i; // Case-insensitive match
      return pattern.test(deskHostname);
    }
    
    let org: any;
    if (isSubdomainOfErpnomy(deskHostname)) {
      org = this.organizationRepository.findOne({
        where: {
          orgname: deskHostname.split('.')[0],
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
          deskHostname: deskHostname,
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