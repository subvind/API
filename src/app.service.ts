import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  @RabbitSubscribe({
    exchange: 'exchange1',
    routingKey: 'subscribe-route',
    queue: 'subscribe-queue',
  })
  public async pubSubHandler(msg: {}) {
    console.log(`Received message: ${JSON.stringify(msg)}`);
  }
  
  getHello(): string {
    return `<footer><a href="/api">https://backend.subvind.com/api</a><br /><br /><p style="margin: 0;">backend.subvind.com © ${new Date().getFullYear()}.</p> <p style="margin: 0;">powered by <a href="https://subvind.com" class="svelte-8o1gnw">subvind</a></p></footer>`;
  }
}
