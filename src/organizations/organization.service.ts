import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Organization } from './organization.entity';
import { User } from '../users/user.entity';

function getHostnameEnding(hostname) {
  const parts = hostname.split('.');
  if (parts.length >= 3) {
    const domain = parts[parts.length - 2];
    const tld = parts[parts.length - 1];
    return domain + '.' + tld;
  } else {
    return hostname
  }
}

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
    query.leftJoinAndSelect('orgPhoto.bucket', 'orgBucket');
    query.leftJoinAndSelect('organization.splashPhoto', 'splashPhoto');
    query.leftJoinAndSelect('splashPhoto.bucket', 'splashBucket');
    
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
        'splashPhoto',
        'splashPhoto.bucket',
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
        'accounts.client',
        'orgPhoto',
        'orgPhoto.bucket',
        'splashPhoto',
        'splashPhoto.bucket',
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
        'splashPhoto',
        'splashPhoto.bucket',
      ]
    });
  }

  async findByFrontendHostname(frontendHostname: string): Promise<Organization> {
    let org = this.organizationRepository.findOne({
      where: {
        frontendHostname: getHostnameEnding(frontendHostname),
      },
      relations: [
        'owner',
        'orgPhoto',
        'orgPhoto.bucket',
        'splashPhoto',
        'splashPhoto.bucket',
      ]
    });

    return org
  }

  async findByBackendHostname(backendHostname: string): Promise<Organization> {
    let org = this.organizationRepository.findOne({
      where: {
        backendHostname: getHostnameEnding(backendHostname),
      },
      relations: [
        'owner',
        'orgPhoto',
        'orgPhoto.bucket',
        'splashPhoto',
        'splashPhoto.bucket',
      ]
    });

    return org
  }

  async findByHomeHostname(homeHostname: string): Promise<Organization> {
    function isNomySubdomain(hostname) {
      return hostname.split('.').length === 4
    }
    
    let org: any;
    if (isNomySubdomain(homeHostname)) {
      org = this.organizationRepository.findOne({
        where: {
          orgname: homeHostname.split('.')[0],
        },
        relations: [
          'owner',
          'orgPhoto',
          'orgPhoto.bucket',
          'splashPhoto',
          'splashPhoto.bucket',
        ]
      });
    } else {
      org = this.organizationRepository.findOne({
        where: {
          homeHostname: homeHostname,
        },
        relations: [
          'owner',
          'orgPhoto',
          'orgPhoto.bucket',
          'splashPhoto',
          'splashPhoto.bucket',
        ]
      });
    }
    
    return org
  }

  async findByErpHostname(erpHostname: string): Promise<Organization> {
    function isNomySubdomain(hostname) {
      return hostname.split('.').length === 4
    }
    
    let org: any;
    if (isNomySubdomain(erpHostname)) {
      org = this.organizationRepository.findOne({
        where: {
          orgname: erpHostname.split('.')[0],
        },
        relations: [
          'owner',
          'orgPhoto',
          'orgPhoto.bucket',
          'splashPhoto',
          'splashPhoto.bucket',
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
          'splashPhoto',
          'splashPhoto.bucket',
        ]
      });
    }
    
    return org
  }

  async findByTubeHostname(tubeHostname: string): Promise<Organization> {
    function isNomySubdomain(hostname) {
      return hostname.split('.').length === 4
    }
    
    let org: any;
    if (isNomySubdomain(tubeHostname)) {
      org = this.organizationRepository.findOne({
        where: {
          orgname: tubeHostname.split('.')[0],
        },
        relations: [
          'owner',
          'orgPhoto',
          'orgPhoto.bucket',
          'splashPhoto',
          'splashPhoto.bucket',
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
          'splashPhoto',
          'splashPhoto.bucket',
        ]
      });
    }
    
    return org
  }


  async findByDeskHostname(deskHostname: string): Promise<Organization> {
    function isNomySubdomain(hostname) {
      return hostname.split('.').length === 4
    }
    
    let org: any;
    if (isNomySubdomain(deskHostname)) {
      org = this.organizationRepository.findOne({
        where: {
          orgname: deskHostname.split('.')[0],
        },
        relations: [
          'owner',
          'orgPhoto',
          'orgPhoto.bucket',
          'splashPhoto',
          'splashPhoto.bucket',
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
          'splashPhoto',
          'splashPhoto.bucket',
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

  async updateChildOrganizations(id: string, updatedOrganization: Organization): Promise<Organization> {
    // Find the existing organization
    const organization: any = await this.organizationRepository.find({
      where: {
        id: id
      }
    });
  
    if (!organization) {
      throw new NotFoundException(`Organization with id ${id} not found`);
    }
  
    // Update the organization properties
    // organization.name = updatedOrganization.name;
  
    // Clear existing subOrganizations
    organization.subOrganizations = [];
  
    // Extract the array of IDs
    const subOrgIds = updatedOrganization.subOrganizations.map(subOrg => subOrg.id);

    // Add the updated subOrganizations
    if (subOrgIds.length > 0) {
      const subOrgs = await this.organizationRepository.find({
        where: {
          id: In(subOrgIds)
        }
      });
      organization.subOrganizations = subOrgs;
    }

    console.log('organization', JSON.stringify(organization, null, 2));
  
    // Save the updated organization
    await this.organizationRepository.save(organization);
  
    // Return the updated organization
    return organization;
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
    query.leftJoinAndSelect('orgPhoto.bucket', 'orgBucket');
    query.leftJoinAndSelect('organization.splashPhoto', 'splashPhoto');
    query.leftJoinAndSelect('splashPhoto.bucket', 'splashBucket');
  
    const offset = (page - 1) * limit;
    
    const [data, total] = await query.skip(offset).take(limit).getManyAndCount();
  
    return { data, total };
  }

  async findChildOrganizations(organization: Organization): Promise<Organization> {
    return await this.organizationRepository.findOne({
      where: {
        id: organization.id,
      },
      relations: [
        'subOrganizations',
        'subOrganizations.orgPhoto',
        'subOrganizations.orgPhoto.bucket',
        'subOrganizations.splashPhoto',
        'subOrganizations.splashPhoto.bucket',
        'parentOrganizations',
        'parentOrganizations.orgPhoto',
        'parentOrganizations.orgPhoto.bucket',
        'parentOrganizations.splashPhoto',
        'parentOrganizations.splashPhoto.bucket',
      ]
    });
  }
}