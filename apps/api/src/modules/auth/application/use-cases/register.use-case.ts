import {
  ConflictException,
  Injectable,
} from "@nestjs/common";
import { DomainErrorCode } from "@repo/shared";
import { PrismaService } from "../../../../infrastructure/prisma/prisma.service";
import { uniqueSlug } from "../../../../shared/utils/slug";
import { TokenService } from "../../infrastructure/token.service";
import type { RegisterDto } from "../dtos/register.dto";

@Injectable()
export class RegisterUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tokens: TokenService,
  ) {}

  async execute(dto: RegisterDto) {
    const existing = await this.prisma.client.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    if (existing) {
      const err = new ConflictException("Email already registered");
      (err as ConflictException & { code: string }).code =
        DomainErrorCode.EMAIL_ALREADY_EXISTS;
      throw err;
    }

    const passwordHash = await this.tokens.hashPassword(dto.password);
    const email = dto.email.toLowerCase();
    const orgName = `${dto.name}'s workspace`;

    const result = await this.prisma.client.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          name: dto.name,
          passwordHash,
          emailVerified: false,
        },
      });

      const org = await tx.organization.create({
        data: {
          name: orgName,
          slug: uniqueSlug(dto.name, user.id),
        },
      });

      await tx.organizationMember.create({
        data: {
          userId: user.id,
          organizationId: org.id,
          role: "OWNER",
        },
      });

      return { user, org };
    });

    const tokens = await this.tokens.issueTokenPair(
      result.user.id,
      result.user.email,
      result.org.id,
    );

    return {
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
      },
      organization: {
        id: result.org.id,
        name: result.org.name,
        slug: result.org.slug,
        plan: result.org.plan,
      },
      ...tokens,
    };
  }
}
