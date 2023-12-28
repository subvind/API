import { Injectable } from '@nestjs/common';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { AnalyticEvent } from './analytic.event';
import { AnalyticService } from './analytic.service';
import { InfluxDBService } from '../influxdb.service';

@Injectable()
export class AnalyticListener {

  constructor (
    private readonly analyticService: AnalyticService,
    private readonly influxDBService: InfluxDBService
  ) {}

  @RabbitSubscribe({
    exchange: 'analytics',
    routingKey: 'analytics.*', // Supports * as a wildcard for one word and # as a wildcard for one or more words.
    queue: 'AnalyticEvent',
  })
  public async analyticEventHandler(event: AnalyticEvent) {
    // logs
    console.log('event', JSON.stringify(event));

    // charging
    await this.influxDBService.writeAnalyticPoint(event);

    // database
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