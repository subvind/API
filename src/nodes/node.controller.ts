import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { NodeService } from './node.service';
import { Node } from './node.entity';

@Controller('nodes')
export class NodeController {
  constructor(
    private readonly nodeService: NodeService,
    private readonly amqpConnection: AmqpConnection
  ) {}

  // @Get()
  // getHello(): string {
  //   this.amqpConnection.publish('exchange1', 'subscribe-route', { msg: 'hello world' });

  //   return this.nodeService.getHello();
  // }

  @Get()
  async findAll(): Promise<Node[]> {
    return this.nodeService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<Node> {
    return this.nodeService.findOne(id);
  }

  @Post()
  async create(@Body() nodeData: Node): Promise<Node> {
    return this.nodeService.create(nodeData);
  }

  @Patch(':id')
  async update(@Param('id') id: number, @Body() updatedNodeData: Node): Promise<Node> {
    return this.nodeService.update(id, updatedNodeData);
  }

  @Delete(':id')
  async remove(@Param('id') id: number): Promise<void> {
    return this.nodeService.remove(id);
  }
}
