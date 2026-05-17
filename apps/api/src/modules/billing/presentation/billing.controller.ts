import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import type { Organization, Plan } from "@repo/db";
import type { RawBodyRequest } from "@nestjs/common";
import type { Request } from "express";
import { CurrentOrg } from "../../../shared/decorators/current-org.decorator";
import { JwtAuthGuard } from "../../../shared/guards/jwt-auth.guard";
import { TenantGuard } from "../../../shared/guards/tenant.guard";
import { CheckoutDto } from "../application/dtos/checkout.dto";
import { CreateCheckoutUseCase } from "../application/use-cases/create-checkout.use-case";
import { GetPlansUseCase } from "../application/use-cases/get-plans.use-case";
import { GetUsageUseCase } from "../application/use-cases/get-usage.use-case";
import { StripeService } from "../infrastructure/stripe.service";
import { PrismaService } from "../../../infrastructure/prisma/prisma.service";
import { ConfigService } from "@nestjs/config";

@Controller("billing")
export class BillingController {
  constructor(
    private readonly getPlans: GetPlansUseCase,
    private readonly getUsage: GetUsageUseCase,
    private readonly createCheckout: CreateCheckoutUseCase,
    private readonly stripe: StripeService,
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  @Get("plans")
  plans() {
    return this.getPlans.execute();
  }

  @Get("subscription")
  @UseGuards(JwtAuthGuard, TenantGuard)
  subscription(@CurrentOrg() org: Organization) {
    return {
      plan: org.plan,
      stripeSubscriptionId: org.stripeSubscriptionId,
      stripeCurrentPeriodEnd: org.stripeCurrentPeriodEnd,
    };
  }

  @Get("usage")
  @UseGuards(JwtAuthGuard, TenantGuard)
  usage(@CurrentOrg() org: Organization) {
    return this.getUsage.execute(org);
  }

  @Post("checkout")
  @UseGuards(JwtAuthGuard, TenantGuard)
  checkout(@CurrentOrg() org: Organization, @Body() dto: CheckoutDto) {
    return this.createCheckout.execute(org, dto.priceId);
  }

  @Post("portal")
  @UseGuards(JwtAuthGuard, TenantGuard)
  async portal(@CurrentOrg() org: Organization) {
    if (!org.stripeCustomerId || !this.stripe.isConfigured()) {
      return { portalUrl: null };
    }
    const frontend = this.config.get("FRONTEND_URL") ?? "http://localhost:3000";
    const session = await this.stripe.client.billingPortal.sessions.create({
      customer: org.stripeCustomerId,
      return_url: `${frontend}/settings/billing`,
    });
    return { portalUrl: session.url };
  }

  @Post("webhook")
  async webhook(@Req() req: RawBodyRequest<Request>) {
    const sig = req.headers["stripe-signature"] as string;
    const secret = this.config.get("STRIPE_WEBHOOK_SECRET");
    if (!secret || !sig || !this.stripe.isConfigured()) {
      return { received: true };
    }

    const event = this.stripe.client.webhooks.constructEvent(
      req.rawBody as Buffer,
      sig,
      secret,
    );

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as { metadata?: { organizationId?: string }; subscription?: string };
      const orgId = session.metadata?.organizationId;
      if (orgId) {
        await this.prisma.client.organization.update({
          where: { id: orgId },
          data: {
            plan: "PRO" as Plan,
            stripeSubscriptionId:
              typeof session.subscription === "string"
                ? session.subscription
                : undefined,
          },
        });
      }
    }

    return { received: true };
  }
}
