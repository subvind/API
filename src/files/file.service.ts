import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { File } from './file.entity';
import { Organization } from '../organizations/organization.entity';
import { Bucket } from '../buckets/bucket.entity';

import * as AWS from 'aws-sdk';
import * as sharp from 'sharp';

@Injectable()
export class FileService {
  constructor(
    @InjectRepository(File)
    private readonly fileRepository: Repository<File>,
  ) {}

  getHello(): string {
    return 'Hello World!';
  }

  async uploadFileToMinio(fileBuffer: Buffer, filename: string, bucket: Bucket, organization: Organization): Promise<File> {    
    const bucketRegion = 'us-east-2';  // Replace with your AWS region
    const s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY,
      secretAccessKey: process.env.AWS_SECRET_KEY,
      region: bucketRegion
    });

    const bucketName = `${organization.orgname}.${bucket.name}`;
    const s3Params = {
      Bucket: bucketName,
      Key: filename,
      Body: fileBuffer,
    };

    try {
      // Check if the bucket exists, and if not, create it
      const bucketExists = await s3.headBucket({ Bucket: bucketName }).promise();
      console.log('bucketExists', bucketExists)
    } catch (error) {
      console.log('bucketExists', error);
      console.log(`Bucket ${bucketName} does not exist.`);
      console.log(`Creating bucket in region ${bucketRegion}`);
      await s3.createBucket({ 
        Bucket: bucketName,
        CreateBucketConfiguration: {
          LocationConstraint: bucketRegion,
        },
      }).promise();

      console.log(`Bucket ${bucketName} created successfully.`);
    }

    const params = {
      Bucket: bucketName,
      PublicAccessBlockConfiguration: {
        BlockPublicAcls: false, // Disable "Block all public access"
        IgnorePublicAcls: false, // Enable ACLs
      },
    };

    try {
      // enable public access on the bucket
      await s3.putPublicAccessBlock(params).promise();
      console.log(`Bucket configuration updated for: ${bucketName}`);
    } catch (error) {
      console.error(`Error configuring bucket: ${bucketName}`, error);
      throw error; // Handle the error as needed
    }

    const bucketPolicy = {
      Version: '2012-10-17',
      Statement: [
        {
          Sid: 'PublicReadGetObject',
          Effect: 'Allow',
          Principal: '*',
          Action: 's3:GetObject',
          Resource: `arn:aws:s3:::${bucketName}/*`,
        },
      ],
    };

    try {
      // update the bucket policy so that files are publicly accessible
      await s3.putBucketPolicy({
        Bucket: bucketName,
        Policy: JSON.stringify(bucketPolicy),
      }).promise();
      console.log(`Bucket policy updated for: ${bucketName}`);
    } catch (error) {
      console.error(`Error updating bucket policy for: ${bucketName}`, error);
      throw error; // Handle the error as needed
    }

    try {
      // Upload the file to S3
      await s3.upload(s3Params).promise();
      console.log(`Success uploading file to S3: ${bucketName}`);
    } catch (error) {
      // Handle the error, e.g., log it or throw an exception
      console.error('Error uploading file to S3:', error);
      throw new Error(`Error uploading file to S3: ${error.message}`);
    }

    // Use sharp to get the width and height of the image
    const imageInfo = await sharp(fileBuffer).metadata();

    // Save the file information to the database
    const file = this.fileRepository.create({ 
      filename,
      width: imageInfo.width,
      height: imageInfo.height,
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
    return this.fileRepository.findOne({ 
      where: {
        id: id
      },
      relations: [
        'bucket',
        'organization',
        'organization.owner',
      ]
    });
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
        'organization.owner',
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