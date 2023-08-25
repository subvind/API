import { Entity, PrimaryColumn, Column, BeforeInsert, Unique, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';

import { v4 as uuidv4 } from 'uuid';

import { Inventory } from '../inventory/inventory.entity';
import { Organization } from '../organizations/organization.entity';

@Entity()
@Unique(['address', 'organization'])
export class Location {
  @PrimaryColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  address: string;

  /**
   * Other properties and relationships as needed
   */

  // one location to many products in stock
  @OneToMany(() => Inventory, inventory => inventory.id, { nullable: true })
  inventory: Inventory[]

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
