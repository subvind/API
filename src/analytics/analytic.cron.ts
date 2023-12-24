import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AnalyticService } from './analytic.service';

@Injectable()
export class AnalyticCron {
  constructor(private readonly analyticService: AnalyticService) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleCron() {
    // Run the deleteOldAnalytics method every minute
    let old = await this.analyticService.deleteOldAnalytics();
    // old runs correctly but doesn't return anything
    // console.log('deleted analytics', old);
  }
}
