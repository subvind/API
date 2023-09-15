import { Entity, PrimaryColumn, Column, BeforeInsert, Unique, ManyToOne, JoinColumn, OneToMany } from 'typeorm';

import { v4 as uuidv4 } from 'uuid';

import { SalesOrderItem } from '../salesOrderItems/salesOrderItem.entity';
import { User } from '../users/user.entity';

@Entity()
export class SalesOrder {
  @PrimaryColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn()
  user: User;

  @Column()
  createdAt: Date;

  /**
   * Other properties and relationships as needed
   */

  @OneToMany(() => SalesOrderItem, (item) => item.order, { nullable: true })
  items: SalesOrderItem[];

  @BeforeInsert()
  generateUUID() {
    if (!this.id) {
      this.id = uuidv4();
    }
    console.log('salesOrder insert', this.id)
  }
}
