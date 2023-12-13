import { Injectable } from '@nestjs/common';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { FileEvent } from './file.event';
import { AnalyticService } from '../analytics/analytic.service';

@Injectable()
export class FileListener {

  constructor (
    private readonly analyticService: AnalyticService
  ) {}

  @RabbitSubscribe({
    exchange: 'files',
    routingKey: 'files.*', // Supports * as a wildcard for one word and # as a wildcard for one or more words.
    queue: 'FileEvent',
  })
  public async accountEventHandler(event: FileEvent) {
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