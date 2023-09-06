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
  
  async findAll(page: number, limit: number, search?: string): Promise<{ data: Showcase[]; total: number }> {
    const query = this.showcaseRepository.createQueryBuilder('showcase');
  
    if (search) {
      query.where(
        '(showcase.stockKeepingUnit LIKE :search OR showcase.name LIKE :search OR showcase.description LIKE :search OR showcase.detail LIKE :search)',
        { search: `%${search}%` }
      );
    }
  
    query.leftJoinAndSelect('showcase.category', 'category');
    query.leftJoinAndSelect('showcase.organization', 'organization');
    query.leftJoinAndSelect('showcase.bucket', 'bucket');
    query.leftJoinAndSelect('bucket.files', 'bucketFiles');
    query.leftJoinAndSelect('showcase.coverPhoto', 'coverPhoto');
    query.leftJoinAndSelect('coverPhoto.bucket', 'coverPhotoBucket');
    
    const offset = (page - 1) * limit;
  
    const [data, total] = await query.skip(offset).take(limit).getManyAndCount();
  
    return { data, total };
  }

  async findOne(id: string): Promise<Showcase> {
    return this.showcaseRepository.findOneBy({ id: id });
  }

  async findBySKU(sku: string, organizationId: string): Promise<Showcase> {
    return this.showcaseRepository.findOne({ 
      where: {
        stockKeepingUnit: sku,
        organization: {
          id: organizationId
        }
      },
      relations: [
        'category',
        'organization',
        'bucket',
        'bucket.files',
        'coverPhoto',
        'coverPhoto.bucket'
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
    
    query.leftJoinAndSelect('showcase.category', 'category');
    query.leftJoinAndSelect('showcase.organization', 'organization');
    query.leftJoinAndSelect('showcase.bucket', 'bucket');
    query.leftJoinAndSelect('bucket.files', 'bucketFiles');
    query.leftJoinAndSelect('showcase.coverPhoto', 'coverPhoto');
    query.leftJoinAndSelect('coverPhoto.bucket', 'coverPhotoBucket');
  
    const offset = (page - 1) * limit;
    
    const [data, total] = await query.skip(offset).take(limit).getManyAndCount();
  
    return { data, total };
  }

  async findCategoryShowcase(category: Category, page: number, limit: number, search?: string, type?: string): Promise<{ data: Showcase[]; total: number }> {
    const query = this.showcaseRepository.createQueryBuilder('showcase');
  
    query.where(
      'showcase.categoryId = :categoryId',
      { categoryId: category.id }
    );

    if (search) {
      query.andWhere(
        '(showcase.stockKeepingUnit LIKE :search OR showcase.name LIKE :search OR showcase.description LIKE :search OR showcase.detail LIKE :search)',
        { search: `%${search}%` }
      );
    }
    
    query.leftJoinAndSelect('showcase.category', 'category');
    query.leftJoinAndSelect('showcase.organization', 'organization');
    query.leftJoinAndSelect('showcase.bucket', 'bucket');
    query.leftJoinAndSelect('bucket.files', 'bucketFiles');
    query.leftJoinAndSelect('showcase.coverPhoto', 'coverPhoto');
    query.leftJoinAndSelect('coverPhoto.bucket', 'coverPhotoBucket');

    if (type === 'Archive') {
      query.andWhere('showcase.isArchive = :isArchive', { isArchive: true });
    } else {
      query.andWhere('showcase.isArchive = :isArchive', { isArchive: false });
    }
    
    if (type === 'PriceLowToHigh') {
      query.orderBy('showcase.price', 'ASC');
    } else if (type === 'PriceHighToLow') {
      query.orderBy('showcase.price', 'DESC');
    } else {
      // LatestShowcases
      query.orderBy('showcase.createdAt', 'DESC');
    }
  
    const offset = (page - 1) * limit;
    
    const [data, total] = await query.skip(offset).take(limit).getManyAndCount();
  
    return { data, total };
  }

  async findLatestOrgShowcase(organization: Organization, page: number, limit: number, search?: string, type?: string): Promise<{ data: Showcase[]; total: number }> {
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
    
    query.leftJoinAndSelect('showcase.category', 'category');
    query.leftJoinAndSelect('showcase.organization', 'organization');
    query.leftJoinAndSelect('showcase.bucket', 'bucket');
    query.leftJoinAndSelect('bucket.files', 'bucketFiles');
    query.leftJoinAndSelect('showcase.coverPhoto', 'coverPhoto');
    query.leftJoinAndSelect('coverPhoto.bucket', 'coverPhotoBucket');

    if (type === 'Archive') {
      query.andWhere('showcase.isArchive = :isArchive', { isArchive: true });
    } else {
      query.andWhere('showcase.isArchive = :isArchive', { isArchive: false });
    }

    // Add orderBy clause to order by createdAt in descending order
    query.orderBy('showcase.createdAt', 'DESC');
  
    const offset = (page - 1) * limit;
    
    const [data, total] = await query.skip(offset).take(limit).getManyAndCount();
  
    return { data, total };
  }
}