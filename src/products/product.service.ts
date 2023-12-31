import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';
import { Organization } from '../organizations/organization.entity';
import { Category } from '../categories/category.entity';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}
  
  getHello(): string {
    return 'Hello World!';
  }
  
  async findAll(page: number, limit: number, search?: string): Promise<{ data: Product[]; total: number }> {
    const query = this.productRepository.createQueryBuilder('product');
  
    if (search) {
      query.where(
        '(product.stockKeepingUnit LIKE :search OR product.name LIKE :search OR product.description LIKE :search OR product.detail LIKE :search)',
        { search: `%${search}%` }
      );
    }
  
    query.leftJoinAndSelect('product.category', 'category');
    query.leftJoinAndSelect('product.organization', 'organization');
    query.leftJoinAndSelect('product.bucket', 'bucket');
    query.leftJoinAndSelect('bucket.files', 'bucketFiles');
    query.leftJoinAndSelect('product.coverPhoto', 'coverPhoto');
    query.leftJoinAndSelect('coverPhoto.bucket', 'coverPhotoBucket');
    
    const offset = (page - 1) * limit;
  
    const [data, total] = await query.skip(offset).take(limit).getManyAndCount();
  
    return { data, total };
  }

  async findOne(id: string): Promise<Product> {
    return this.productRepository.findOne({ 
      where: {
        id: id
      },
      relations: [
        'category',
        'organization',
        'organization.owner',
        'bucket',
        'bucket.files',
        'coverPhoto',
        'coverPhoto.bucket'
      ]
    });
  }

  async findBySKU(sku: string, organizationId: string): Promise<Product> {
    return this.productRepository.findOne({ 
      where: {
        stockKeepingUnit: sku,
        organization: {
          id: organizationId
        }
      },
      relations: [
        'category',
        'organization',
        'organization.owner',
        'bucket',
        'bucket.files',
        'coverPhoto',
        'coverPhoto.bucket'
      ]
    });
  }

  async create(product: Product): Promise<Product> {
    const newObject = this.productRepository.create(product);
    return this.productRepository.save(newObject);
  }

  async update(id: string, product: Product): Promise<Product> {
    await this.productRepository.update(id, product);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.productRepository.delete(id);
  }

  async findOrgProduct(organization: Organization, page: number, limit: number, search?: string): Promise<{ data: Product[]; total: number }> {
    const query = this.productRepository.createQueryBuilder('product');
  
    query.where(
      'product.organizationId = :tenantId',
      { tenantId: organization.id }
    );

    if (search) {
      query.andWhere(
        '(product.stockKeepingUnit LIKE :search OR product.name LIKE :search OR product.description LIKE :search OR product.detail LIKE :search)',
        { search: `%${search}%` }
      );
    }
    
    query.leftJoinAndSelect('product.category', 'category');
    query.leftJoinAndSelect('product.organization', 'organization');
    query.leftJoinAndSelect('product.bucket', 'bucket');
    query.leftJoinAndSelect('bucket.files', 'bucketFiles');
    query.leftJoinAndSelect('product.coverPhoto', 'coverPhoto');
    query.leftJoinAndSelect('coverPhoto.bucket', 'coverPhotoBucket');
  
    const offset = (page - 1) * limit;
    
    const [data, total] = await query.skip(offset).take(limit).getManyAndCount();
  
    return { data, total };
  }

  async findCategoryProduct(category: Category, page: number, limit: number, search?: string, type?: string): Promise<{ data: Product[]; total: number }> {
    const query = this.productRepository.createQueryBuilder('product');
  
    query.where(
      'product.categoryId = :categoryId',
      { categoryId: category.id }
    );

    if (search) {
      query.andWhere(
        '(product.stockKeepingUnit LIKE :search OR product.name LIKE :search OR product.description LIKE :search OR product.detail LIKE :search)',
        { search: `%${search}%` }
      );
    }
    
    query.leftJoinAndSelect('product.category', 'category');
    query.leftJoinAndSelect('product.organization', 'organization');
    query.leftJoinAndSelect('product.bucket', 'bucket');
    query.leftJoinAndSelect('bucket.files', 'bucketFiles');
    query.leftJoinAndSelect('product.coverPhoto', 'coverPhoto');
    query.leftJoinAndSelect('coverPhoto.bucket', 'coverPhotoBucket');

    if (type === 'Archive') {
      query.andWhere('product.isArchive = :isArchive', { isArchive: true });
    } else {
      query.andWhere('product.isArchive = :isArchive', { isArchive: false });
    }
    
    if (type === 'PriceLowToHigh') {
      query.orderBy('product.price', 'ASC');
    } else if (type === 'PriceHighToLow') {
      query.orderBy('product.price', 'DESC');
    } else {
      // LatestProducts
      query.orderBy('product.createdAt', 'DESC');
    }
  
    const offset = (page - 1) * limit;
    
    const [data, total] = await query.skip(offset).take(limit).getManyAndCount();
  
    return { data, total };
  }

  async findLatestOrgProduct(organization: Organization, page: number, limit: number, search?: string, type?: string): Promise<{ data: Product[]; total: number }> {
    const query = this.productRepository.createQueryBuilder('product');
  
    query.where(
      'product.organizationId = :tenantId',
      { tenantId: organization.id }
    );

    if (search) {
      query.andWhere(
        '(product.stockKeepingUnit LIKE :search OR product.name LIKE :search OR product.description LIKE :search OR product.detail LIKE :search)',
        { search: `%${search}%` }
      );
    }
    
    query.leftJoinAndSelect('product.category', 'category');
    query.leftJoinAndSelect('product.organization', 'organization');
    query.leftJoinAndSelect('product.bucket', 'bucket');
    query.leftJoinAndSelect('bucket.files', 'bucketFiles');
    query.leftJoinAndSelect('product.coverPhoto', 'coverPhoto');
    query.leftJoinAndSelect('coverPhoto.bucket', 'coverPhotoBucket');

    if (type === 'Archive') {
      query.andWhere('product.isArchive = :isArchive', { isArchive: true });
    } else {
      query.andWhere('product.isArchive = :isArchive', { isArchive: false });
    }

    // Add orderBy clause to order by createdAt in descending order
    query.orderBy('product.createdAt', 'DESC');
  
    const offset = (page - 1) * limit;
    
    const [data, total] = await query.skip(offset).take(limit).getManyAndCount();
  
    return { data, total };
  }
}