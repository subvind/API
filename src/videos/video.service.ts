import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Video } from './video.entity';
import { Organization } from '../organizations/organization.entity';
import { Playlist } from '../playlists/playlist.entity';

@Injectable()
export class VideoService {
  constructor(
    @InjectRepository(Video)
    private readonly videoRepository: Repository<Video>,
  ) {}
  
  getHello(): string {
    return 'Hello World!';
  }
  
  async findAll(page: number, limit: number, search?: string): Promise<{ data: Video[]; total: number }> {
    const query = this.videoRepository.createQueryBuilder('video');
  
    if (search) {
      query.where(
        '(video.slug LIKE :search OR video.title LIKE :search OR video.description LIKE :search OR video.detail LIKE :search)',
        { search: `%${search}%` }
      );
    }
  
    query.leftJoinAndSelect('video.playlist', 'playlist');
    query.leftJoinAndSelect('video.organization', 'organization');
    query.leftJoinAndSelect('video.thumbnail', 'thumbnail');
    query.leftJoinAndSelect('thumbnail.bucket', 'thumbnailBucket');
    
    const offset = (page - 1) * limit;
  
    const [data, total] = await query.skip(offset).take(limit).getManyAndCount();
  
    return { data, total };
  }

  async findOne(id: string): Promise<Video> {
    return this.videoRepository.findOne({ 
      where: {
        id: id
      },
      relations: [
        'playlist',
        'organization',
        'organization.owner',
        'thumbnail',
        'thumbnail.bucket'
      ]
    });
  }

  async findBySlug(slug: string, organizationId: string): Promise<Video> {
    return this.videoRepository.findOne({ 
      where: {
        slug: slug,
        organization: {
          id: organizationId
        }
      },
      relations: [
        'playlist',
        'organization',
        'organization.owner',
        'thumbnail',
        'thumbnail.bucket'
      ]
    });
  }

  async create(video: Video): Promise<Video> {
    const newObject = this.videoRepository.create(video);
    return this.videoRepository.save(newObject);
  }

  async update(id: string, video: Video): Promise<Video> {
    await this.videoRepository.update(id, video);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.videoRepository.delete(id);
  }

  async findOrgVideo(organization: Organization, page: number, limit: number, search?: string): Promise<{ data: Video[]; total: number }> {
    const query = this.videoRepository.createQueryBuilder('video');
  
    query.where(
      'video.organizationId = :tenantId',
      { tenantId: organization.id }
    );

    if (search) {
      query.andWhere(
        '(video.slug LIKE :search OR video.title LIKE :search OR video.description LIKE :search OR video.detail LIKE :search)',
        { search: `%${search}%` }
      );
    }
    
    query.leftJoinAndSelect('video.playlist', 'playlist');
    query.leftJoinAndSelect('video.organization', 'organization');
    query.leftJoinAndSelect('video.thumbnail', 'thumbnail');
    query.leftJoinAndSelect('thumbnail.bucket', 'thumbnailBucket');
  
    const offset = (page - 1) * limit;
    
    const [data, total] = await query.skip(offset).take(limit).getManyAndCount();
  
    return { data, total };
  }

  async findPlaylistVideo(playlist: Playlist, page: number, limit: number, search?: string, type?: string): Promise<{ data: Video[]; total: number }> {
    const query = this.videoRepository.createQueryBuilder('video');
  
    query.where(
      'video.playlistId = :playlistId',
      { playlistId: playlist.id }
    );

    if (search) {
      query.andWhere(
        '(video.slug LIKE :search OR video.title LIKE :search OR video.description LIKE :search OR video.detail LIKE :search)',
        { search: `%${search}%` }
      );
    }
    
    query.leftJoinAndSelect('video.playlist', 'playlist');
    query.leftJoinAndSelect('video.organization', 'organization');
    query.leftJoinAndSelect('video.thumbnail', 'thumbnail');
    query.leftJoinAndSelect('thumbnail.bucket', 'thumbnailBucket');
    
    if (type === 'ViewsLowToHigh') {
      query.orderBy('video.views', 'ASC');
    } else if (type === 'ViewsHighToLow') {
      query.orderBy('video.views', 'DESC');
    } else {
      // LatestVideos
      query.orderBy('video.createdAt', 'DESC');
    }
  
    const offset = (page - 1) * limit;
    
    const [data, total] = await query.skip(offset).take(limit).getManyAndCount();
  
    return { data, total };
  }

  async findLatestOrgVideo(organization: Organization, page: number, limit: number, search?: string, type?: string): Promise<{ data: Video[]; total: number }> {
    const query = this.videoRepository.createQueryBuilder('video');
  
    query.where(
      'video.organizationId = :tenantId',
      { tenantId: organization.id }
    );

    if (search) {
      query.andWhere(
        '(video.slug LIKE :search OR video.title LIKE :search OR video.description LIKE :search OR video.detail LIKE :search)',
        { search: `%${search}%` }
      );
    }
    
    query.leftJoinAndSelect('video.playlist', 'playlist');
    query.leftJoinAndSelect('video.organization', 'organization');
    query.leftJoinAndSelect('video.thumbnail', 'thumbnail');
    query.leftJoinAndSelect('thumbnail.bucket', 'thumbnailBucket');

    // Add orderBy clause to order by createdAt in descending order
    query.orderBy('video.createdAt', 'DESC');
  
    const offset = (page - 1) * limit;
    
    const [data, total] = await query.skip(offset).take(limit).getManyAndCount();
  
    return { data, total };
  }
}