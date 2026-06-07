import { Injectable } from "@nestjs/common";
import { PLAN_LIMITS } from "@repo/shared";
import { StripeService } from "../../infrastructure/stripe.service";

@Injectable()
export class GetPlansUseCase {
  constructor(private readonly stripe: StripeService) {}

  execute() {
    return [
      {
        id: "FREE",
        name: "Free",
        limits: PLAN_LIMITS.FREE,
        priceMonthly: 0,
        priceId: null,
      },
      {
        id: "PRO",
        name: "Pro",
        limits: PLAN_LIMITS.PRO,
        priceMonthly: 29,
        priceId: this.stripe.priceIdFor("PRO") ?? null,
      },
      {
        id: "ENTERPRISE",
        name: "Enterprise",
        limits: PLAN_LIMITS.ENTERPRISE,
        priceMonthly: null,
        priceId: this.stripe.priceIdFor("ENTERPRISE") ?? null,
      },
    ];
  }
}
