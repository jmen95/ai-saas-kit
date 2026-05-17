import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import type { Organization } from "@repo/db";

export const CurrentOrg = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): Organization => {
    const request = ctx
      .switchToHttp()
      .getRequest<{ organization: Organization }>();
    return request.organization;
  },
);
