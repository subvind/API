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

  async writeAnalyticPoint(fields: any): Promise<void> {
    let writeClient = this.influx.getWriteApi(
      process.env.INFLUXDB_ORGANIZATION || 'your_organization', 
      process.env.INFLUXDB_BUCKET || 'your_bucket',
      'ms' // milliseconds 
    );

    // console.log('analytic path', writeClient.path)

    const point = new Point('analytic')
      .tag('organizationId', fields.organizationId)
      .stringField('kind', fields.kind)
      .stringField('url', fields.url)
      .stringField('method', fields.method)
      .stringField('headers', JSON.stringify(fields.headers))
      // .stringField('body', JSON.stringify(fields.body))
      .stringField('crud', fields.crud)
      .stringField('charge', fields.charge)
      .stringField('organizationId', fields.organizationId)
      // .stringField('payload', JSON.stringify(fields.payload))
      // .stringField('eventAt', fields.eventAt);
    
    point.timestamp(new Date(fields.eventAt).getTime())

    // console.log('analytic point', JSON.stringify(point.fields, null, 2))

    writeClient.writePoint(point);

    await writeClient.flush()
    await writeClient.close();
  }
}
