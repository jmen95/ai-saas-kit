import { BadRequestException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { Organization } from "@repo/db";
import { PrismaService } from "../../../../infrastructure/prisma/prisma.service";
import { StripeService } from "../../infrastructure/stripe.service";

@Injectable()
export class CreateCheckoutUseCase {
  constructor(
    private readonly stripe: StripeService,
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async execute(org: Organization, priceId: string) {
    if (!this.stripe.isConfigured()) {
      throw new BadRequestException("Stripe is not configured");
    }

    let customerId = org.stripeCustomerId;
    if (!customerId) {
      const customer = await this.stripe.client.customers.create({
        name: org.name,
        metadata: { organizationId: org.id },
      });
      customerId = customer.id;
      await this.prisma.client.organization.update({
        where: { id: org.id },
        data: { stripeCustomerId: customerId },
      });
    }

    const frontend = this.config.get("FRONTEND_URL") ?? "http://localhost:3000";
    const session = await this.stripe.client.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${frontend}/settings/billing?upgraded=true`,
      cancel_url: `${frontend}/settings/billing`,
      metadata: { organizationId: org.id },
    });

    return { checkoutUrl: session.url };
  }
}
