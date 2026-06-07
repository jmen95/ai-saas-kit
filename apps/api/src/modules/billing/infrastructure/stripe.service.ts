import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { Plan } from "@repo/db";
import Stripe from "stripe";

@Injectable()
export class StripeService {
  readonly client: Stripe;
  private readonly secretKey: string;

  constructor(private readonly config: ConfigService) {
    this.secretKey = config.get<string>("STRIPE_SECRET_KEY")?.trim() ?? "";
    this.client = new Stripe(this.secretKey || "sk_test_placeholder");
  }

  /**
   * True only for a real key. A bare "sk_test_" (the env placeholder) is too
   * short and is treated as unconfigured so billing degrades gracefully.
   */
  isConfigured(): boolean {
    return (
      this.secretKey.startsWith("sk_") &&
      !this.secretKey.includes("placeholder") &&
      this.secretKey.length > 15
    );
  }

  /** Configured Stripe price id for a plan, if any. */
  priceIdFor(plan: Plan): string | undefined {
    const key =
      plan === "PRO"
        ? "STRIPE_PRICE_PRO_MONTHLY"
        : plan === "ENTERPRISE"
          ? "STRIPE_PRICE_ENTERPRISE_MONTHLY"
          : "STRIPE_PRICE_FREE";
    const value = this.config.get<string>(key)?.trim();
    return value && value !== "price_" ? value : undefined;
  }

  /** Resolve which plan a Stripe price id corresponds to. */
  planForPriceId(priceId: string | null | undefined): Plan {
    if (!priceId) return "FREE";
    if (priceId === this.config.get<string>("STRIPE_PRICE_ENTERPRISE_MONTHLY")) {
      return "ENTERPRISE";
    }
    if (priceId === this.config.get<string>("STRIPE_PRICE_PRO_MONTHLY")) {
      return "PRO";
    }
    return "PRO";
  }
}
