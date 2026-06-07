import { PLAN_LIMITS, getPlanLimits } from "@repo/shared";

describe("plan limits", () => {
  it("exposes increasing message allowances across tiers", () => {
    expect(PLAN_LIMITS.FREE.messagesPerMonth).toBe(50);
    expect(PLAN_LIMITS.PRO.messagesPerMonth).toBe(2000);
    expect(PLAN_LIMITS.ENTERPRISE.messagesPerMonth).toBe(Infinity);
  });

  it("only enables custom system prompts on paid plans", () => {
    expect(getPlanLimits("FREE").systemPromptEnabled).toBe(false);
    expect(getPlanLimits("PRO").systemPromptEnabled).toBe(true);
    expect(getPlanLimits("ENTERPRISE").systemPromptEnabled).toBe(true);
  });

  it("enforces seat limits per plan", () => {
    expect(getPlanLimits("FREE").membersPerOrg).toBe(1);
    expect(getPlanLimits("PRO").membersPerOrg).toBe(10);
    expect(getPlanLimits("ENTERPRISE").membersPerOrg).toBe(Infinity);
  });
});
