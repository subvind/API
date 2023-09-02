import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { File } from './file.entity';
import { Organization } from '../organizations/organization.entity';
import { Category } from '../categories/category.entity';

@Injectable()
export class FileService {
  constructor(
    @InjectRepository(File)
    private readonly fileRepository: Repository<File>,
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
  
  async findAll(page: number, limit: number, search?: string): Promise<{ data: File[]; total: number }> {
    const query = this.fileRepository.createQueryBuilder('file');
  
    if (search) {
      query.where(
        '(file.filename LIKE :search)',
        { search: `%${search}%` }
      );
    }
  
    query.leftJoinAndSelect('file.bucket', 'bucket');
    query.leftJoinAndSelect('file.organization', 'organization');
    
    const offset = (page - 1) * limit;
  
    const [data, total] = await query.skip(offset).take(limit).getManyAndCount();
  
    return { data, total };
  }

  async findOne(id: string): Promise<File> {
    return this.fileRepository.findOneBy({ id: id });
  }

  async findByFilename(filename: string, organizationId: string): Promise<File> {
    return this.fileRepository.findOne({ 
      where: {
        filename: filename,
        organization: {
          id: organizationId
        }
      },
      relations: [
        'bucket',
        'organization',
      ]
    });
  }

  async create(file: File): Promise<File> {
    const newObject = this.fileRepository.create(file);
    return this.fileRepository.save(newObject);
  }

  async update(id: string, file: File): Promise<File> {
    await this.fileRepository.update(id, file);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.fileRepository.delete(id);
  }

  async findOrgFile(organization: Organization, page: number, limit: number, search?: string): Promise<{ data: File[]; total: number }> {
    const query = this.fileRepository.createQueryBuilder('file');
  
    query.where(
      'file.organizationId = :tenantId',
      { tenantId: organization.id }
    );

    if (search) {
      query.andWhere(
        '(file.filename LIKE :search)',
        { search: `%${search}%` }
      );
    }
    
    query.leftJoinAndSelect('file.bucket', 'bucket');
    query.leftJoinAndSelect('file.organization', 'organization');
  
    const offset = (page - 1) * limit;
    
    const [data, total] = await query.skip(offset).take(limit).getManyAndCount();
  
    return { data, total };
  }

  async findCategoryFile(category: Category, page: number, limit: number, search?: string, type?: string): Promise<{ data: File[]; total: number }> {
    const query = this.fileRepository.createQueryBuilder('file');
  
    query.where(
      'file.categoryId = :categoryId',
      { categoryId: category.id }
    );

    if (search) {
      query.andWhere(
        '(file.filename LIKE :search)',
        { search: `%${search}%` }
      );
    }
    
    query.leftJoinAndSelect('file.bucket', 'bucket');
    query.leftJoinAndSelect('file.organization', 'organization');
  
    const offset = (page - 1) * limit;
    
    const [data, total] = await query.skip(offset).take(limit).getManyAndCount();
  
    return { data, total };
  }
}