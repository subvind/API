import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly amqpConnection: AmqpConnection
  ) {}

  @Get()
  getHello(): string {
    try {
      this.amqpConnection.publish('exchange1', 'subscribe-route', { msg: 'hello world' });
    } catch (e) {
      console.log(e)
    }

    return this.appService.getHello();
  }
}
