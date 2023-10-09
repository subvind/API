import { Injectable } from '@nestjs/common';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { AccountEvent } from './account.event';
import { AnalyticService } from '../analytics/analytic.service';

@Injectable()
export class AccountListener {

  constructor (
    private readonly analyticService: AnalyticService
  ) {}

  @RabbitSubscribe({
    exchange: 'analytics',
    routingKey: 'accounts.*', // Supports * as a wildcard for one word and # as a wildcard for one or more words.
    queue: 'AccountEvent',
  })
  public async accountEventHandler(event: AccountEvent) {
    // reports
    console.log('analytics', JSON.stringify(event));

    // charging
    let analytic: any = {
      url: event.url,
      method: event.method,
      headers: JSON.stringify(event.headers),
      body: JSON.stringify(event.body),
      crud: event.crud,
      charge: event.charge,
      organization: {
        id: event.organizationId
      },
      payload: JSON.stringify(event.payload),
      eventAt: event.eventAt,
    }

    let record = await this.analyticService.create(analytic);
    // console.log(record)
  }
}