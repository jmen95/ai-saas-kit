import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Stripe from "stripe";

@Injectable()
export class StripeService {
  readonly client: Stripe;

  constructor(config: ConfigService) {
    const key = config.get<string>("STRIPE_SECRET_KEY");
    this.client = new Stripe(key ?? "sk_test_placeholder");
  }

  isConfigured(): boolean {
    const key = process.env.STRIPE_SECRET_KEY ?? "";
    return key.startsWith("sk_") && !key.includes("placeholder");
  }
}
