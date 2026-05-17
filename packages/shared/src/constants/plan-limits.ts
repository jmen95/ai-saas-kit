import type { Plan } from "@repo/db";

export type PlanLimits = {
  messagesPerMonth: number;
  conversationsTotal: number;
  membersPerOrg: number;
  systemPromptEnabled: boolean;
  modelAccess: readonly string[];
};

export const PLAN_LIMITS = {
  FREE: {
    messagesPerMonth: 50,
    conversationsTotal: 5,
    membersPerOrg: 1,
    systemPromptEnabled: false,
    modelAccess: ["gpt-4o-mini"],
  },
  PRO: {
    messagesPerMonth: 2000,
    conversationsTotal: Infinity,
    membersPerOrg: 10,
    systemPromptEnabled: true,
    modelAccess: ["gpt-4o-mini", "gpt-4o"],
  },
  ENTERPRISE: {
    messagesPerMonth: Infinity,
    conversationsTotal: Infinity,
    membersPerOrg: Infinity,
    systemPromptEnabled: true,
    modelAccess: ["gpt-4o-mini", "gpt-4o"],
  },
} as const satisfies Record<Plan, PlanLimits>;

export function getPlanLimits(plan: Plan): PlanLimits {
  return PLAN_LIMITS[plan];
}
