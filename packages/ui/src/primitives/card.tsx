import * as React from "react";
import { cn } from "../lib/utils";

const PrimitiveCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("rounded-lg border bg-card text-card-foreground shadow-sm", className)}
    {...props}
  />
));
PrimitiveCard.displayName = "PrimitiveCard";

const PrimitiveCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
));
PrimitiveCardHeader.displayName = "PrimitiveCardHeader";

const PrimitiveCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3 ref={ref} className={cn("text-2xl font-semibold leading-none tracking-tight", className)} {...props} />
));
PrimitiveCardTitle.displayName = "PrimitiveCardTitle";

const PrimitiveCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
));
PrimitiveCardDescription.displayName = "PrimitiveCardDescription";

const PrimitiveCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
PrimitiveCardContent.displayName = "PrimitiveCardContent";

const PrimitiveCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />
));
PrimitiveCardFooter.displayName = "PrimitiveCardFooter";

export {
  PrimitiveCard,
  PrimitiveCardHeader,
  PrimitiveCardFooter,
  PrimitiveCardTitle,
  PrimitiveCardDescription,
  PrimitiveCardContent,
};
