import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Controller, Get } from '@nestjs/common';
import { NodeService } from './node.service';
import { Node } from './node.entity';

@Controller()
export class NodeController {
  constructor(
    private readonly nodeService: NodeService,
    private readonly amqpConnection: AmqpConnection
  ) {}

  @Get()
  getHello(): string {
    this.amqpConnection.publish('exchange1', 'subscribe-route', { msg: 'hello world' });

    return this.nodeService.getHello();
  }

  @Get()
  async findAll(): Promise<Node[]> {
    return this.nodeService.findAll();
  }
}
