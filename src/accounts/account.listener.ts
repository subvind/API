import { Injectable } from '@nestjs/common';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { AccountEvent } from './account.event';

@Injectable()
export class AccountListener {
  @RabbitSubscribe({
    exchange: 'analytics',
    routingKey: 'accounts.*', // Supports * as a wildcard for one word and # as a wildcard for one or more words.
    queue: 'subscribe-queue',
  })
  public async pubSubHandler(msg: AccountEvent) {
    // TODO: save event to analytics table
    console.log('analytics', JSON.stringify(msg));
  }
}