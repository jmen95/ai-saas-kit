import { Injectable } from "@nestjs/common";
import { PLAN_LIMITS } from "@repo/shared";

@Injectable()
export class GetPlansUseCase {
  execute() {
    return [
      { id: "FREE", name: "Free", limits: PLAN_LIMITS.FREE, priceMonthly: 0 },
      { id: "PRO", name: "Pro", limits: PLAN_LIMITS.PRO, priceMonthly: 29 },
      {
        id: "ENTERPRISE",
        name: "Enterprise",
        limits: PLAN_LIMITS.ENTERPRISE,
        priceMonthly: null,
      },
    ];
  }
}
