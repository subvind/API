import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Module } from '@nestjs/common';
import { NodeController } from './node.controller';
import { NodeService } from './node.service';

import { Node } from './node.entity';

@Module({
  imports: [
    RabbitMQModule.forRoot(RabbitMQModule, {
      exchanges: [
        {
          name: 'exchange1',
          type: 'topic',
        },
      ],
      uri: `amqp://${process.env.RABBITMQ_USER}:${process.env.RABBITMQ_PASSWORD}@localhost:5672`,
      connectionInitOptions: { wait: false },
    }),
    TypeOrmModule.forFeature([Node]),
  ],

  controllers: [NodeController],
  providers: [NodeService],
})
export class NodeModule {}
