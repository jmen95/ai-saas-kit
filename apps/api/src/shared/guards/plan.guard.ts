import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { Organization, Plan } from "@repo/db";
import { REQUIRES_PLAN_KEY } from "../decorators/requires-plan.decorator";

const PLAN_ORDER: Plan[] = ["FREE", "PRO", "ENTERPRISE"];

@Injectable()
export class PlanGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPlan = this.reflector.get<Plan | undefined>(
      REQUIRES_PLAN_KEY,
      context.getHandler(),
    );
    if (!requiredPlan) return true;

    const request = context
      .switchToHttp()
      .getRequest<{ organization: Organization }>();
    const org = request.organization;
    if (!org) {
      throw new ForbiddenException("Organization context required");
    }

    const hasAccess =
      PLAN_ORDER.indexOf(org.plan) >= PLAN_ORDER.indexOf(requiredPlan);
    if (!hasAccess) {
      throw new ForbiddenException("Plan upgrade required");
    }
    return true;
  }
}
