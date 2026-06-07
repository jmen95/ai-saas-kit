import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { ResetUsageUseCase } from "../application/use-cases/reset-usage.use-case";

/**
 * Resets per-organization monthly usage counters. Runs at midnight on the 1st
 * of every month. Usage is tracked via a counter (not COUNT-per-request), so a
 * scheduled reset keeps it accurate without per-request aggregation.
 */
@Injectable()
export class UsageResetScheduler {
  private readonly logger = new Logger(UsageResetScheduler.name);

  constructor(private readonly resetUsage: ResetUsageUseCase) {}

  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async handleMonthlyReset() {
    const { reset } = await this.resetUsage.resetAll();
    this.logger.log(`Monthly usage reset applied to ${reset} organization(s)`);
  }
}
