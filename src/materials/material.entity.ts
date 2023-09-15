import { Entity, PrimaryColumn, Column, BeforeInsert, Unique, ManyToOne, JoinColumn } from 'typeorm';

import { v4 as uuidv4 } from 'uuid';

@Entity()
@Unique(['name']) 
export class Material {
  @PrimaryColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  unitPrice: number;

  @Column()
  quantityInStock: number;

  /**
   * Other properties and relationships as needed
   */

  @BeforeInsert()
  generateUUID() {
    if (!this.id) {
      this.id = uuidv4();
    }
    console.log('material insert', this.id)
  }
}