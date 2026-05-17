import { Injectable } from "@nestjs/common";
import type { Organization } from "@repo/db";
import { getPlanLimits } from "@repo/shared";

@Injectable()
export class GetUsageUseCase {
  execute(org: Organization) {
    const limits = getPlanLimits(org.plan);
    return {
      plan: org.plan,
      messagesUsedThisMonth: org.messagesUsedThisMonth,
      messagesLimit: limits.messagesPerMonth,
      stripeCurrentPeriodEnd: org.stripeCurrentPeriodEnd,
    };
  }
}
