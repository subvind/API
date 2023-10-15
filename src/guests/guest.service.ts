import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Guest } from './guest.entity';

@Injectable()
export class GuestService {
  private readonly mg;

  constructor(
    @InjectRepository(Guest)
    private readonly guestRepository: Repository<Guest>,
  ) {}
  
  getHello(): string {
    return 'Hello World!';
  }
  
  async findAll(page: number, limit: number, search?: string): Promise<{ data: Guest[]; total: number }> {
    const query = this.guestRepository.createQueryBuilder('guest');
  
    if (search) {
      query.where(
        'guest.ipAddress LIKE :search',
        { search: `%${search}%` }
      );
    }
  
    const offset = (page - 1) * limit;
    
    const [data, total] = await query.skip(offset).take(limit).getManyAndCount();
  
    return { data, total };
  }

  async findRecord(id: string): Promise<Guest> {
    return this.guestRepository.findOne({ 
      where: {
        id: id
      },
      relations: [
        'organization',
        'account'
      ],
    });
  }

  async findOne(id: string): Promise<Guest> {
    return this.guestRepository.findOne({ 
      where: {
        id: id
      },
      relations: [
        'organization',
        'account'
      ],
    });
  }

  async findByIpAddress(ipAddress: string, organizationId: string): Promise<Guest> {
    return this.guestRepository.findOne({ 
      where: {
        ipAddress: ipAddress,
        organization: {
          id: organizationId
        }
      },
      relations: [
        'organization',
        'account'
      ],
    });
  }

  async create(guest: Guest): Promise<Guest> {
    const newObject = this.guestRepository.create(guest);
    return this.guestRepository.save(newObject);
  }

  async update(id: string, guest: Guest): Promise<Guest> {
    await this.guestRepository.update(id, guest);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.guestRepository.delete(id);
  }
}