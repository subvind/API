import { Entity, PrimaryColumn, Column, BeforeInsert, Unique, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from 'typeorm';

import { ApiProperty } from '@nestjs/swagger';

import { v4 as uuidv4 } from 'uuid';

import { File } from '../files/file.entity';
import { Organization } from '../organizations/organization.entity';
import { Product } from '../products/product.entity';

@Entity()
@Unique(['name', 'organization']) 
export class Bucket {
  @PrimaryColumn('uuid')
  id: string;

  @ApiProperty({ example: '', description: 'The name of the bucket' })
  @Column()
  name: string;

  // files
  @OneToMany(() => File, file => file.bucket, { nullable: true })
  files: File[];

  // products
  @OneToMany(() => Product, product => product.bucket, { nullable: true })
  products: Product[]

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
