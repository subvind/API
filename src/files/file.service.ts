import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { File } from './file.entity';
import { Organization } from '../organizations/organization.entity';
import { Bucket } from '../buckets/bucket.entity';

import * as Minio from 'minio';

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

  async uploadFileToMinio(fileBuffer: Buffer, filename: string, bucket: Bucket, organization: Organization): Promise<File> {
    const minioClient = new Minio.Client({
      endPoint: process.env.MINIO_HOST, // Replace with your MinIO host
      port: 80, // Replace with your MinIO port
      useSSL: true, // Set to true if you're using SSL
      accessKey: process.env.MINIO_ACCESS_KEY, // Replace with your MinIO access key
      secretKey: process.env.MINIO_SECRET_KEY, // Replace with your MinIO secret key
    });

    let bucketName = `${organization.orgname}.${bucket.name}`
    await minioClient.makeBucket(bucketName, 'us-east-1'); // Replace with your desired region
    await minioClient.putObject(bucketName, filename, fileBuffer);

    // Save the file information to the database
    const file = this.fileRepository.create({ 
      filename, 
      bucket: {
        id: bucket.id
      },
      organization: {
        id: organization.id
      }
    });

    return this.fileRepository.save(file);
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

  async findBucketFile(bucket: Bucket, page: number, limit: number, search?: string): Promise<{ data: File[]; total: number }> {
    const query = this.fileRepository.createQueryBuilder('file');
  
    query.where(
      'file.bucketId = :bucketId',
      { bucketId: bucket.id }
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