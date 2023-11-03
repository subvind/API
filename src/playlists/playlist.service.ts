import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Playlist } from './playlist.entity';
import { Organization } from '../organizations/organization.entity';

@Injectable()
export class PlaylistService {
  constructor(
    @InjectRepository(Playlist)
    private readonly playlistRepository: Repository<Playlist>,
  ) {}
  
  getHello(): string {
    return 'Hello World!';
  }
  
  async findAll(page: number, limit: number, search?: string): Promise<{ data: Playlist[]; total: number }> {
    const query = this.playlistRepository.createQueryBuilder('playlist');
  
    if (search) {
      query.where(
        'playlist.name LIKE :search OR playlist.description LIKE :search',
        { search: `%${search}%` }
      );
    }
  
    query.leftJoinAndSelect('playlist.videos', 'videos');
    query.leftJoinAndSelect('playlist.organization', 'organization');
    query.leftJoinAndSelect('playlist.parentPlaylist', 'parentPlaylist');
    query.leftJoinAndSelect('playlist.subPlaylists', 'subPlaylists');
    query.leftJoinAndSelect('playlist.playlistPhoto', 'playlistPhoto');
    query.leftJoinAndSelect('playlistPhoto.bucket', 'playlistPhotoBucket');
    
    const offset = (page - 1) * limit;
  
    const [data, total] = await query.skip(offset).take(limit).getManyAndCount();
  
    return { data, total };
  }

  async findOne(id: string): Promise<Playlist> {
    return this.playlistRepository.findOne({ 
      where: {
        id: id
      },
      relations: [
        'parentPlaylist', 
        'subPlaylists', 
        'videos',
        'organization',
        'organization.owner',
        'playlistPhoto',
        'playlistPhoto.bucket'
      ]
    });
  }

  async findBySlug(slug: string, organizationId: string): Promise<Playlist> {
    return this.playlistRepository.findOne({ 
      where: {
        slug: slug,
        organization: {
          id: organizationId
        }
      },
      relations: [
        'parentPlaylist', 
        'subPlaylists', 
        'videos',
        'organization',
        'organization.owner',
        'playlistPhoto',
        'playlistPhoto.bucket'
      ]
    });
  }

  async create(playlist: Playlist): Promise<Playlist> {
    const newObject = this.playlistRepository.create(playlist);
    return this.playlistRepository.save(newObject);
  }

  async update(id: string, playlist: Playlist): Promise<Playlist> {
    await this.playlistRepository.update(id, playlist);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.playlistRepository.delete(id);
  }

  async findOrgPlaylist(organization: Organization, page: number, limit: number, search?: string): Promise<{ data: Playlist[]; total: number }> {
    const query = this.playlistRepository.createQueryBuilder('playlist');
  
    query.where(
      'playlist.organizationId = :tenantId',
      { tenantId: organization.id }
    );

    if (search) {
      query.andWhere(
        'playlist.name LIKE :search OR playlist.description LIKE :search',
        { search: `%${search}%` }
      );
    }
    
    query.leftJoinAndSelect('playlist.videos', 'videos');
    query.leftJoinAndSelect('playlist.parentPlaylist', 'parentPlaylist');
    query.leftJoinAndSelect('playlist.subPlaylists', 'subPlaylists');
    query.leftJoinAndSelect('playlist.organization', 'organization');
    query.leftJoinAndSelect('playlist.playlistPhoto', 'playlistPhoto');
    query.leftJoinAndSelect('playlistPhoto.bucket', 'playlistPhotoBucket');
  
    const offset = (page - 1) * limit;
    
    const [data, total] = await query.skip(offset).take(limit).getManyAndCount();
  
    return { data, total };
  }

  async findSubPlaylists(playlist: Playlist, page: number, limit: number, search?: string): Promise<{ data: Playlist[]; total: number }> {
    const query = this.playlistRepository.createQueryBuilder('playlist');
  
    query.where(
      'playlist.parentPlaylistId = :playlistId',
      { playlistId: playlist.id }
    );

    if (search) {
      query.andWhere(
        'playlist.name LIKE :search OR playlist.description LIKE :search',
        { search: `%${search}%` }
      );
    }
    
    query.leftJoinAndSelect('playlist.videos', 'videos');
    query.leftJoinAndSelect('playlist.parentPlaylist', 'parentPlaylist');
    query.leftJoinAndSelect('playlist.subPlaylists', 'subPlaylists');
    query.leftJoinAndSelect('playlist.organization', 'organization');
    query.leftJoinAndSelect('playlist.playlistPhoto', 'playlistPhoto');
    query.leftJoinAndSelect('playlistPhoto.bucket', 'playlistPhotoBucket');
  
    const offset = (page - 1) * limit;
    
    const [data, total] = await query.skip(offset).take(limit).getManyAndCount();
  
    return { data, total };
  }
}