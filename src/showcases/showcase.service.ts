import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Showcase } from './showcase.entity';
import { Organization } from '../organizations/organization.entity';
import { Category } from '../categories/category.entity';

@Injectable()
export class ShowcaseService {
  constructor(
    @InjectRepository(Showcase)
    private readonly showcaseRepository: Repository<Showcase>,
  ) {}
  
  getHello(): string {
    return 'Hello World!';
  }
  
  async findAll(page: number, limit: number, search?: string): Promise<{ data: Showcase[]; total: number }> {
    const query = this.showcaseRepository.createQueryBuilder('showcase');
  
    if (search) {
      query.where(
        '(showcase.stockKeepingUnit LIKE :search OR showcase.name LIKE :search OR showcase.description LIKE :search OR showcase.detail LIKE :search)',
        { search: `%${search}%` }
      );
    }
  
    query.leftJoinAndSelect('showcase.organization', 'organization');
    query.leftJoinAndSelect('showcase.bannerPhoto', 'bannerPhoto');
    query.leftJoinAndSelect('bannerPhoto.bucket', 'bannerPhotoBucket');
    
    const offset = (page - 1) * limit;
  
    const [data, total] = await query.skip(offset).take(limit).getManyAndCount();
  
    return { data, total };
  }

  async findOne(id: string): Promise<Showcase> {
    return this.showcaseRepository.findOne({
      where: { 
        id: id 
      },
      relations: [
        'organization',
        'organization.owner',
        'bannerPhoto',
        'bannerPhoto.bucket'
      ]
    });
  }

  async create(showcase: Showcase): Promise<Showcase> {
    const newObject = this.showcaseRepository.create(showcase);
    return this.showcaseRepository.save(newObject);
  }

  async update(id: string, showcase: Showcase): Promise<Showcase> {
    await this.showcaseRepository.update(id, showcase);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.showcaseRepository.delete(id);
  }

  async findOrgShowcase(organization: Organization, page: number, limit: number, search?: string): Promise<{ data: Showcase[]; total: number }> {
    const query = this.showcaseRepository.createQueryBuilder('showcase');
  
    query.where(
      'showcase.organizationId = :tenantId',
      { tenantId: organization.id }
    );

    if (search) {
      query.andWhere(
        '(showcase.stockKeepingUnit LIKE :search OR showcase.name LIKE :search OR showcase.description LIKE :search OR showcase.detail LIKE :search)',
        { search: `%${search}%` }
      );
    }
    
    query.leftJoinAndSelect('showcase.organization', 'organization');
    query.leftJoinAndSelect('showcase.bannerPhoto', 'bannerPhoto');
    query.leftJoinAndSelect('bannerPhoto.bucket', 'bannerPhotoBucket');
  
    const offset = (page - 1) * limit;
    
    const [data, total] = await query.skip(offset).take(limit).getManyAndCount();
  
    return { data, total };
  }

  async findLatestOrgShowcase(organization: Organization, page: number, limit: number, search?: string): Promise<{ data: Showcase[]; total: number }> {
    const query = this.showcaseRepository.createQueryBuilder('showcase');
  
    query.where(
      'showcase.organizationId = :tenantId',
      { tenantId: organization.id }
    );

    // Add condition to filter showcases between startAt and finishAt
    query.andWhere('showcase.startAt <= NOW() AND showcase.finishAt >= NOW()');

    if (search) {
      query.andWhere(
        '(showcase.title LIKE :search)',
        { search: `%${search}%` }
      );
    }
    
    query.leftJoinAndSelect('showcase.organization', 'organization');
    query.leftJoinAndSelect('showcase.bannerPhoto', 'bannerPhoto');
    query.leftJoinAndSelect('bannerPhoto.bucket', 'bannerPhotoBucket');

    // Add orderBy clause to order by createdAt in descending order
    query.orderBy('showcase.startAt', 'ASC');
  
    const offset = (page - 1) * limit;
    
    const [data, total] = await query.skip(offset).take(limit).getManyAndCount();
  
    return { data, total };
  }
}