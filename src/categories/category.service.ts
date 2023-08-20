import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './category.entity';
import { Organization } from '../organizations/organization.entity';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
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
  
  async findAll(page: number, limit: number, search?: string): Promise<{ data: Category[]; total: number }> {
    const query = this.categoryRepository.createQueryBuilder('category');
  
    if (search) {
      query.where(
        'category.name LIKE :sku',
        { sku: `%${search}%` }
      );
    }
  
    query.leftJoinAndSelect('category.organization', 'organization');
    
    const offset = (page - 1) * limit;
  
    const [data, total] = await query.skip(offset).take(limit).getManyAndCount();
  
    return { data, total };
  }

  async findOne(id: string): Promise<Category> {
    return this.categoryRepository.findOneBy({ id: id });
  }

  async findBySlug(slug: string): Promise<Category> {
    return this.categoryRepository.findOne({ 
      where: {
        slug: slug
      },
      relations: ['parentCategory', 'subCategories', 'products']
    });
  }

  async create(category: Category): Promise<Category> {
    const newObject = this.categoryRepository.create(category);
    return this.categoryRepository.save(newObject);
  }

  async update(id: string, category: Category): Promise<Category> {
    await this.categoryRepository.update(id, category);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.categoryRepository.delete(id);
  }

  async findOrgCategory(organization: Organization, page: number, limit: number, search?: string): Promise<{ data: Category[]; total: number }> {
    const query = this.categoryRepository.createQueryBuilder('category');
  
    query.where(
      'category.organizationId = :tenantId',
      { tenantId: organization.id }
    );

    if (search) {
      query.andWhere(
        'category.name LIKE :sku',
        { sku: `%${search}%` }
      );
    }
    
    query.leftJoinAndSelect('category.products', 'products');
    query.leftJoinAndSelect('category.parentCategory', 'parentCategory');
    query.leftJoinAndSelect('category.subCategories', 'subCategories');
    query.leftJoinAndSelect('category.organization', 'organization');
  
    const offset = (page - 1) * limit;
    
    const [data, total] = await query.skip(offset).take(limit).getManyAndCount();
  
    return { data, total };
  }
}