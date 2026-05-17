import { Injectable } from "@nestjs/common";
import type { Organization } from "@repo/db";

@Injectable()
export class GetCurrentOrgUseCase {
  execute(org: Organization) {
    return {
      id: org.id,
      name: org.name,
      slug: org.slug,
      logoUrl: org.logoUrl,
      plan: org.plan,
      messagesUsedThisMonth: org.messagesUsedThisMonth,
      stripeCurrentPeriodEnd: org.stripeCurrentPeriodEnd,
    };
  }
}
