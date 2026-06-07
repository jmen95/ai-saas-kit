import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import type { Organization } from "@repo/db";
import type { RawBodyRequest } from "@nestjs/common";
import type { Request } from "express";
import type Stripe from "stripe";
import { CurrentOrg } from "../../../shared/decorators/current-org.decorator";
import { JwtAuthGuard } from "../../../shared/guards/jwt-auth.guard";
import { TenantGuard } from "../../../shared/guards/tenant.guard";
import { CheckoutDto } from "../application/dtos/checkout.dto";
import { CreateCheckoutUseCase } from "../application/use-cases/create-checkout.use-case";
import { GetPlansUseCase } from "../application/use-cases/get-plans.use-case";
import { GetUsageUseCase } from "../application/use-cases/get-usage.use-case";
import { ResetUsageUseCase } from "../application/use-cases/reset-usage.use-case";
import { StripeService } from "../infrastructure/stripe.service";
import { PrismaService } from "../../../infrastructure/prisma/prisma.service";
import { ConfigService } from "@nestjs/config";

@Controller("billing")
export class BillingController {
  constructor(
    private readonly getPlans: GetPlansUseCase,
    private readonly getUsage: GetUsageUseCase,
    private readonly resetUsage: ResetUsageUseCase,
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
      stripeConfigured: this.stripe.isConfigured(),
    };
  }

  @Get("usage")
  @UseGuards(JwtAuthGuard, TenantGuard)
  usage(@CurrentOrg() org: Organization) {
    return this.getUsage.execute(org);
  }

  // Manual reset of the current organization's monthly usage (handy for demos).
  @Post("usage/reset")
  @UseGuards(JwtAuthGuard, TenantGuard)
  resetCurrentUsage(@CurrentOrg() org: Organization) {
    return this.resetUsage.resetOne(org.id);
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
    const secret = this.config.get<string>("STRIPE_WEBHOOK_SECRET");
    if (!secret || !sig || !this.stripe.isConfigured()) {
      return { received: true };
    }

    const event = this.stripe.client.webhooks.constructEvent(
      req.rawBody as Buffer,
      sig,
      secret,
    );

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await this.applySubscriptionFromSession(session);
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.created": {
        const sub = event.data.object as Stripe.Subscription;
        await this.applySubscription(sub);
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        await this.downgradeSubscription(sub);
        break;
      }
      default:
        break;
    }

    return { received: true };
  }

  private async applySubscriptionFromSession(session: Stripe.Checkout.Session) {
    const orgId = session.metadata?.organizationId;
    const subscriptionId =
      typeof session.subscription === "string"
        ? session.subscription
        : undefined;
    if (!orgId || !subscriptionId) return;

    const sub = await this.stripe.client.subscriptions.retrieve(subscriptionId);
    await this.persistPlan(orgId, sub);
  }

  private async applySubscription(sub: Stripe.Subscription) {
    const org = await this.prisma.client.organization.findFirst({
      where: { stripeCustomerId: sub.customer as string },
      select: { id: true },
    });
    if (!org) return;
    await this.persistPlan(org.id, sub);
  }

  private async persistPlan(orgId: string, sub: Stripe.Subscription) {
    const priceId = sub.items.data[0]?.price?.id;
    const plan = this.stripe.planForPriceId(priceId);
    const periodEnd = sub.items.data[0]?.current_period_end;

    await this.prisma.client.organization.update({
      where: { id: orgId },
      data: {
        plan,
        stripeSubscriptionId: sub.id,
        stripePriceId: priceId,
        stripeCurrentPeriodEnd: periodEnd
          ? new Date(periodEnd * 1000)
          : undefined,
      },
    });
  }

  private async downgradeSubscription(sub: Stripe.Subscription) {
    const org = await this.prisma.client.organization.findFirst({
      where: { stripeCustomerId: sub.customer as string },
      select: { id: true },
    });
    if (!org) return;

    await this.prisma.client.organization.update({
      where: { id: org.id },
      data: {
        plan: "FREE",
        stripeSubscriptionId: null,
        stripePriceId: null,
        stripeCurrentPeriodEnd: null,
      },
    });
  }
}
