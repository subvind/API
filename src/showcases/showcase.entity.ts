import { Entity, PrimaryColumn, Column, BeforeInsert, Unique, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';

import { ApiProperty } from '@nestjs/swagger';

import { v4 as uuidv4 } from 'uuid';

import { Organization } from '../organizations/organization.entity';
import { Category } from '../categories/category.entity';
import { File } from '../files/file.entity';

@Entity()
@Unique(['startAt', 'finishAt']) 
export class Showcase {
  @PrimaryColumn('uuid')
  id: string;

  @ApiProperty({ example: '', description: 'The name of the showcase' })
  @Column({ default: 'my showcase' })
  title: string;

  @ManyToOne(() => File, file => file.id)
  bannerPhoto: File;

  @ApiProperty({ example: '', description: 'The url of the showcase' })
  @Column({ nullable: true })
  url: string;

  @ApiProperty({ example: '', description: 'The start showing time of the showcase' })
  @Column({ type: 'timestamp' })
  startAt: Date;

  @ApiProperty({ example: '', description: 'The finish showing time of the showcase' })
  @Column({ type: 'timestamp' })
  finishAt: Date;

  /**
   * Other properties and relationships as needed
   */

  // category
  @ManyToOne(() => Category, category => category.id)
  category: Category;

  // tenant id
  @ManyToOne(() => Organization, organization => organization.id)
  organization: Organization;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @BeforeInsert()
  generateUUID() {
    if (!this.id) {
      this.id = uuidv4();
    }
    console.log('showcase insert', this.id)
  }
}
