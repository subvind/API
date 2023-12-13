import { Entity, PrimaryColumn, Column, BeforeInsert, Unique, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from 'typeorm';

import { ApiProperty } from '@nestjs/swagger';

import { v4 as uuidv4 } from 'uuid';

import { Organization } from '../organizations/organization.entity';

export enum ChargeType {
  ORGANIZATION = 'Organization',
  WEBMASTER = 'Webmaster',
}

export enum CRUDType {
  CREATE = 'Create',
  READ = 'Read',
  UPDATE = 'Update',
  DELETE = 'Delete',
}

@Entity()
export class Analytic {
  @PrimaryColumn('uuid')
  id: string;

  @ApiProperty({ example: 'accounts', description: 'The kind of the analytic' })
  @Column({ nullable: true })
  kind: string;

  @ApiProperty({ example: '', description: 'The url of the analytic' })
  @Column({ nullable: true })
  url: string;

  @ApiProperty({ example: '', description: 'The method of the analytic' })
  @Column({ nullable: true })
  method: string;

  @ApiProperty({ example: '', description: 'The headers of the analytic' })
  @Column({ nullable: true })
  headers: string;

  @ApiProperty({ example: '', description: 'The body of the analytic' })
  @Column({ nullable: true })
  body: string;

  @ApiProperty({ example: '', description: 'The CRUD type of the analytic' })
  crud: CRUDType;

  @ApiProperty({ example: '', description: 'The charge type of the analytic' })
  charge: ChargeType;

  @ManyToOne(() => Organization, organization => organization.id, { nullable: true })
  organization: Organization;

  @ApiProperty({ example: '', description: 'The payload of the analytic' })
  @Column({ nullable: true })
  payload: string;

  @ApiProperty({ example: '', description: 'The event at of the analytic' })
  @Column({ nullable: true })
  eventAt: string;

  /**
   * Other properties and relationships as needed
   */

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @BeforeInsert()
  generateUUID() {
    if (!this.id) {
      this.id = uuidv4();
    }
    console.log('analytic insert', this.id)
  }
}
