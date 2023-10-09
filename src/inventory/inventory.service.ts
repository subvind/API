import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inventory } from './inventory.entity';
import { Organization } from '../organizations/organization.entity';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Inventory)
    private readonly inventoryRepository: Repository<Inventory>,
  ) {}
  
  getHello(): string {
    return 'Hello World!';
  }
  
  async findAll(page: number, limit: number, search?: string): Promise<{ data: Inventory[]; total: number }> {
    const query = this.inventoryRepository.createQueryBuilder('inventory');
  
    if (search) {
      query.where(
        'inventory.orgname LIKE :search',
        { search: `%${search}%` }
      );
    }
  
    query.leftJoinAndSelect('inventory.organization', 'organization');
    
    const offset = (page - 1) * limit;
  
    const [data, total] = await query.skip(offset).take(limit).getManyAndCount();
  
    return { data, total };
  }

  async findOne(id: string): Promise<Inventory> {
    return this.inventoryRepository.findOneBy({ id: id });
  }

  async create(inventory: Inventory): Promise<Inventory> {
    const newObject = this.inventoryRepository.create(inventory);
    return this.inventoryRepository.save(newObject);
  }

  async update(id: string, inventory: Inventory): Promise<Inventory> {
    await this.inventoryRepository.update(id, inventory);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.inventoryRepository.delete(id);
  }

  async findOrgInventory(organization: Organization, page: number, limit: number, search?: string): Promise<{ data: Inventory[]; total: number }> {
    const query = this.inventoryRepository.createQueryBuilder('inventory');
  
    query.where(
      'inventory.organizationId = :tenantId',
      { tenantId: organization.id }
    );

    if (search) {
      query.andWhere(
        'inventory.orgname LIKE :search',
        { search: `%${search}%` }
      );
    }
    
    query.leftJoinAndSelect('inventory.organization', 'organization');
  
    const offset = (page - 1) * limit;
    
    const [data, total] = await query.skip(offset).take(limit).getManyAndCount();
  
    return { data, total };
  }
}