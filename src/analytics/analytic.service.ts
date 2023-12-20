import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Analytic } from './analytic.entity';
import { Organization } from '../organizations/organization.entity';

@Injectable()
export class AnalyticService {
  constructor(
    @InjectRepository(Analytic)
    private readonly analyticRepository: Repository<Analytic>,
  ) {}
  
  getHello(): string {
    return 'Hello World!';
  }
  
  async findAll(page: number, limit: number, search?: string): Promise<{ data: Analytic[]; total: number }> {
    const query = this.analyticRepository.createQueryBuilder('analytic');
  
    if (search) {
      query.where(
        'analytic.name LIKE :search OR analytic.description LIKE :search',
        { search: `%${search}%` }
      );
    }
  
    query.leftJoinAndSelect('analytic.organization', 'organization');
    
    const offset = (page - 1) * limit;
  
    const [data, total] = await query.skip(offset).take(limit).getManyAndCount();
  
    return { data, total };
  }

  async findOne(id: string): Promise<Analytic> {
    return this.analyticRepository.findOne({ 
      where: {
        id: id
      },
      relations: [
        'organization',
      ]
    });
  }

  async create(analytic: Analytic): Promise<Analytic> {
    const newObject = this.analyticRepository.create(analytic);
    return this.analyticRepository.save(newObject);
  }

  async update(id: string, analytic: Analytic): Promise<Analytic> {
    await this.analyticRepository.update(id, analytic);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.analyticRepository.delete(id);
  }

  async findOrgAnalytic(organization: Organization, page: number, limit: number, search?: string): Promise<{ data: Analytic[]; total: number }> {
    const query = this.analyticRepository.createQueryBuilder('analytic');
  
    query.where(
      'analytic.organizationId = :tenantId',
      { tenantId: organization.id }
    );

    if (search) {
      query.andWhere(
        'analytic.url LIKE :search OR analytic.method LIKE :search',
        { search: `%${search}%` }
      );
    }
    
    query.leftJoinAndSelect('analytic.organization', 'organization');
  
    const offset = (page - 1) * limit;
    
    const [data, total] = await query.skip(offset).take(limit).getManyAndCount();
  
    return { data, total };
  }

  async deleteOldAnalytics(): Promise<any> {
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    console.log('deleting analytics where eventAt < :oneDayAgo or ', oneDayAgo)

    const deletedAnalytics = await this.analyticRepository.delete({
      eventAt: LessThan(oneDayAgo),
    });

    return deletedAnalytics
  }
}