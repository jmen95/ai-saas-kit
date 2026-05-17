import { Module } from "@nestjs/common";
import { CreateCheckoutUseCase } from "./application/use-cases/create-checkout.use-case";
import { GetPlansUseCase } from "./application/use-cases/get-plans.use-case";
import { GetUsageUseCase } from "./application/use-cases/get-usage.use-case";
import { StripeService } from "./infrastructure/stripe.service";
import { BillingController } from "./presentation/billing.controller";

@Module({
  controllers: [BillingController],
  providers: [
    StripeService,
    GetPlansUseCase,
    GetUsageUseCase,
    CreateCheckoutUseCase,
  ],
})
export class BillingModule {}
