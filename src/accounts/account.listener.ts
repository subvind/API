import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { AccountEvent } from './account.event';

@Injectable()
export class AccountListener {
  @OnEvent('accounts.*')
  handleAccountEvent(event: AccountEvent) {
    try {
      // handle and process "AccountEvent" event
      console.log(event);
    } catch (error) {
      console.error('Error in handleAccountEvent:', error);
    }
  }
}