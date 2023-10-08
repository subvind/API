import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { AccountEvent } from './account.event';

@Injectable()
export class AccountListener {
  @OnEvent('accounts.*')
  handleAccountEvent(event: AccountEvent) {
    // handle and process "AccountEvent" event
    console.log(event);
  }
}