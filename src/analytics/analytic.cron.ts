import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AnalyticService } from './analytic.service';

@Injectable()
export class AnalyticCron {
  constructor(private readonly analyticService: AnalyticService) {}

  @Cron(CronExpression.EVERY_10_SECONDS)
  async handleCron() {
    // Run the deleteOldAnalytics method every minute
    let old = await this.analyticService.deleteOldAnalytics();
    console.log('old analytics', old);
  }
}
