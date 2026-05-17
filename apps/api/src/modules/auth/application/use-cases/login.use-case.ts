import {
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { DomainErrorCode } from "@repo/shared";
import { PrismaService } from "../../../../infrastructure/prisma/prisma.service";
import { TokenService } from "../../infrastructure/token.service";
import type { LoginDto } from "../dtos/login.dto";

@Injectable()
export class LoginUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tokens: TokenService,
  ) {}

  async execute(dto: LoginDto) {
    const user = await this.prisma.client.user.findUnique({
      where: { email: dto.email.toLowerCase() },
      include: {
        memberships: {
          include: { organization: true },
          orderBy: { joinedAt: "asc" },
          take: 1,
        },
      },
    });

    if (!user?.passwordHash) {
      throw this.invalidCredentials();
    }

    const valid = await this.tokens.verifyPassword(
      dto.password,
      user.passwordHash,
    );
    if (!valid) {
      throw this.invalidCredentials();
    }

    const membership = user.memberships[0];
    if (!membership) {
      throw this.invalidCredentials();
    }

    const authTokens = await this.tokens.issueTokenPair(
      user.id,
      user.email,
      membership.organizationId,
    );

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      organization: {
        id: membership.organization.id,
        name: membership.organization.name,
        slug: membership.organization.slug,
        plan: membership.organization.plan,
      },
      ...authTokens,
    };
  }

  private invalidCredentials(): UnauthorizedException {
    const err = new UnauthorizedException("Invalid credentials");
    (err as UnauthorizedException & { code: string }).code =
      DomainErrorCode.INVALID_CREDENTIALS;
    return err;
  }
}
