import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Node } from './node.entity';

@Injectable()
export class NodeService {
  constructor(
    @InjectRepository(Node)
    private readonly nodeRepository: Repository<Node>,
  ) {}

  @RabbitSubscribe({
    exchange: 'exchange1',
    routingKey: 'subscribe-route',
    queue: 'subscribe-queue',
  })
  public async pubSubHandler(msg: {}) {
    console.log(`Received message: ${JSON.stringify(msg)}`);
  }
  
  getHello(): string {
    return 'Hello World!';
  }

  async findAll(): Promise<Node[]> {
    return this.nodeRepository.find();
  }

  async findOne(id: number): Promise<Node> {
    return this.nodeRepository.findOneBy({ id: id });
  }

  async create(node: Node): Promise<Node> {
    return this.nodeRepository.save(node);
  }

  async update(id: number, node: Node): Promise<Node> {
    await this.nodeRepository.update(id, node);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.nodeRepository.delete(id);
  }
}