import { Entity, PrimaryColumn, Column, BeforeInsert, Unique, ManyToOne, JoinColumn } from 'typeorm';

import { v4 as uuidv4 } from 'uuid';

import { Customer } from '../customers/customer.entity';

@Entity()
export class Invoice {
  @PrimaryColumn('uuid')
  id: string;

  @ManyToOne(() => Customer)
  @JoinColumn()
  customer: Customer;

  @Column({ type: 'date' })
  invoiceDate: Date;

  @Column()
  totalAmount: number;

  /**
   * Other properties and relationships as needed
   */

  @BeforeInsert()
  generateUUID() {
    if (!this.id) {
      this.id = uuidv4();
    }
    console.log('before insert', this.id)
  }
}