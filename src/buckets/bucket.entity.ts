import { Entity, PrimaryColumn, Column, BeforeInsert, Unique, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';

import { ApiProperty } from '@nestjs/swagger';

import { v4 as uuidv4 } from 'uuid';

import { File } from '../files/file.entity';
import { Organization } from '../organizations/organization.entity';

@Entity()
@Unique(['name']) 
export class Bucket {
  @PrimaryColumn('uuid')
  id: string;

  @ApiProperty({ example: '', description: 'The name of the bucket' })
  @Column()
  name: string;

  @ManyToOne(() => File, file => file.id)
  files: File;

  /**
   * Other properties and relationships as needed
   */

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
    console.log('before insert', this.id)
  }
}
