import { Injectable } from '@nestjs/common';
import {InfluxDB, Point, HttpError} from '@influxdata/influxdb-client'

@Injectable()
export class InfluxDBService {
  private readonly influx: InfluxDB;
  // private readonly writeApi: any;

  constructor() {
    this.influx = new InfluxDB({ 
      url: process.env.INFLUXDB_URL || 'http://localhost:8086',
      token: process.env.INFLUXDB_TOKEN || 'your_influxdb_token'
    });
  }

  async writeDataAnalytic(measurement: string, fields: any): Promise<void> {
    let writeApi = this.influx.getWriteApi(
      process.env.INFLUXDB_ORGANIZATION || 'your_organization', 
      process.env.INFLUXDB_BUCKET || 'your_bucket'
    );

    const point = new Point(measurement)
      .stringField('kind', fields.kind)
      .stringField('url', fields.url)
      .stringField('method', fields.method)
      // .stringField('headers', JSON.stringify(fields.headers))
      // .stringField('body', JSON.stringify(fields.body))
      .stringField('crud', fields.crud)
      .stringField('charge', fields.charge)
      .stringField('organizationId', fields.organizationId)
      // .stringField('payload', JSON.stringify(fields.payload))
      // .stringField('eventAt', fields.eventAt);
    
    point.timestamp(fields.eventAt)

    writeApi.writePoint(point);
    await writeApi.close();
  }
}
