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
  
  async findAll(page: number, limit: number, search?: string): Promise<{ data: Product[]; total: number }> {
    const query = this.productRepository.createQueryBuilder('product');
  
    if (search) {
      query.where(
        'product.stockKeepingUnit LIKE :sku',
        { sku: `%${search}%` }
      );
    }
  
    query.leftJoinAndSelect('product.organization', 'organization');
    
    const offset = (page - 1) * limit;
  
    const [data, total] = await query.skip(offset).take(limit).getManyAndCount();
  
    return { data, total };
  }

  async findOne(id: string): Promise<Product> {
    return this.productRepository.findOneBy({ id: id });
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
        'product.stockKeepingUnit LIKE :sku',
        { sku: `%${search}%` }
      );
    }
    
    query.leftJoinAndSelect('product.organization', 'organization');
  
    const offset = (page - 1) * limit;
    
    const [data, total] = await query.skip(offset).take(limit).getManyAndCount();
  
    return { data, total };
  }

  async findCategoryProduct(category: Category, page: number, limit: number, search?: string): Promise<{ data: Product[]; total: number }> {
    const query = this.productRepository.createQueryBuilder('product');
  
    query.where(
      'product.categoryId = :categoryId',
      { categoryId: category.id }
    );

    if (search) {
      query.andWhere(
        'product.stockKeepingUnit LIKE :sku',
        { sku: `%${search}%` }
      );
    }
    
    query.leftJoinAndSelect('product.organization', 'organization');
  
    const offset = (page - 1) * limit;
    
    const [data, total] = await query.skip(offset).take(limit).getManyAndCount();
  
    return { data, total };
  }

  async findLatestOrgProduct(organization: Organization, page: number, limit: number, search?: string): Promise<{ data: Product[]; total: number }> {
    const query = this.productRepository.createQueryBuilder('product');
  
    query.where(
      'product.organizationId = :tenantId',
      { tenantId: organization.id }
    );

    if (search) {
      query.andWhere(
        'product.stockKeepingUnit LIKE :sku',
        { sku: `%${search}%` }
      );
    }
    
    query.leftJoinAndSelect('product.organization', 'organization');

    // Add orderBy clause to order by createdAt in descending order
    query.orderBy('product.createdAt', 'DESC');
  
    const offset = (page - 1) * limit;
    
    const [data, total] = await query.skip(offset).take(limit).getManyAndCount();
  
    return { data, total };
  }
}