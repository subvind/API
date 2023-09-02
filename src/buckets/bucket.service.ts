import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bucket } from './bucket.entity';
import { Organization } from '../organizations/organization.entity';

@Injectable()
export class BucketService {
  constructor(
    @InjectRepository(Bucket)
    private readonly bucketRepository: Repository<Bucket>,
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
  
  async findAll(page: number, limit: number, search?: string): Promise<{ data: Bucket[]; total: number }> {
    const query = this.bucketRepository.createQueryBuilder('bucket');
  
    if (search) {
      query.where(
        '(bucket.name LIKE :search)',
        { search: `%${search}%` }
      );
    }
  
    query.leftJoinAndSelect('bucket.organization', 'organization');
    
    const offset = (page - 1) * limit;
  
    const [data, total] = await query.skip(offset).take(limit).getManyAndCount();
  
    return { data, total };
  }

  async findOne(id: string): Promise<Bucket> {
    return this.bucketRepository.findOneBy({ id: id });
  }

  async findByName(name: string, organizationId: string): Promise<Bucket> {
    return this.bucketRepository.findOne({ 
      where: {
        name: name,
        organization: {
          id: organizationId
        }
      },
      relations: [
        'files',
        'organization',
      ]
    });
  }

  async create(bucket: Bucket): Promise<Bucket> {
    const newObject = this.bucketRepository.create(bucket);
    return this.bucketRepository.save(newObject);
  }

  async update(id: string, bucket: Bucket): Promise<Bucket> {
    await this.bucketRepository.update(id, bucket);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.bucketRepository.delete(id);
  }

  async findOrgBucket(organization: Organization, page: number, limit: number, search?: string): Promise<{ data: Bucket[]; total: number }> {
    const query = this.bucketRepository.createQueryBuilder('bucket');
  
    query.where(
      'bucket.organizationId = :tenantId',
      { tenantId: organization.id }
    );

    if (search) {
      query.andWhere(
        '(bucket.name LIKE :search)',
        { search: `%${search}%` }
      );
    }
    
    query.leftJoinAndSelect('bucket.organization', 'organization');
  
    const offset = (page - 1) * limit;
    
    const [data, total] = await query.skip(offset).take(limit).getManyAndCount();
  
    return { data, total };
  }
}