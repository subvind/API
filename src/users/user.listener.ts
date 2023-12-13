import { Injectable } from '@nestjs/common';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { UserEvent } from './user.event';
import { AnalyticService } from '../analytics/analytic.service';

@Injectable()
export class UserListener {

  constructor (
    private readonly analyticService: AnalyticService
  ) {}

  @RabbitSubscribe({
    exchange: 'users',
    routingKey: 'users.*', // Supports * as a wildcard for one word and # as a wildcard for one or more words.
    queue: 'UserEvent',
  })
  public async accountEventHandler(event: UserEvent) {
    // reports
    console.log(JSON.stringify(event));

    // charging
    let analytic: any = {
      kind: event.kind,
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