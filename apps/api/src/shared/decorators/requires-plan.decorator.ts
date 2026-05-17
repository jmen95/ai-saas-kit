import { SetMetadata } from "@nestjs/common";
import type { Plan } from "@repo/db";

export const REQUIRES_PLAN_KEY = "requiredPlan";
export const RequiresPlan = (plan: Plan) => SetMetadata(REQUIRES_PLAN_KEY, plan);
