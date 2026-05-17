import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import type { JwtPayload } from "@repo/shared";
import { PrismaService } from "../../infrastructure/prisma/prisma.service";

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{
      user: JwtPayload;
      organization?: unknown;
    }>();
    const user = request.user;
    if (!user?.orgId) {
      throw new ForbiddenException("Organization context required");
    }

    const org = await this.prisma.client.organization.findUnique({
      where: { id: user.orgId },
    });
    if (!org) {
      throw new ForbiddenException("Organization not found");
    }

    request.organization = org;
    return true;
  }
}
