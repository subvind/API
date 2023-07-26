import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

import { Node } from './node.entity'

@Entity()
export class NodeType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  label: string;
  
  @OneToMany(() => Node, (node) => node.active)
  nodes: Node[]
}