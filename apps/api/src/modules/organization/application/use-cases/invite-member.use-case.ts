import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { Organization } from "@repo/db";
import { MemberRole } from "@repo/db";
import { DomainErrorCode, getPlanLimits } from "@repo/shared";
import { PrismaService } from "../../../../infrastructure/prisma/prisma.service";
import { InvitationEmailService } from "../../infrastructure/invitation-email.service";
import type { InviteMemberDto } from "../dtos/invite-member.dto";

const INVITE_TTL_DAYS = 7;

@Injectable()
export class InviteMemberUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly email: InvitationEmailService,
    private readonly config: ConfigService,
  ) {}

  async execute(org: Organization, dto: InviteMemberDto) {
    const email = dto.email.toLowerCase().trim();

    // Reject if the email already belongs to a member of this organization.
    const existingMember =
      await this.prisma.client.organizationMember.findFirst({
        where: { organizationId: org.id, user: { email } },
      });
    if (existingMember) {
      const err = new BadRequestException("User is already a member");
      (err as BadRequestException & { code: string }).code =
        DomainErrorCode.ALREADY_MEMBER;
      throw err;
    }

    // Enforce the per-plan seat limit (members + outstanding invitations).
    const limit = getPlanLimits(org.plan).membersPerOrg;
    if (limit !== Infinity) {
      const [memberCount, pendingInvites] = await Promise.all([
        this.prisma.client.organizationMember.count({
          where: { organizationId: org.id },
        }),
        this.prisma.client.invitation.count({
          where: { organizationId: org.id, acceptedAt: null },
        }),
      ]);
      if (memberCount + pendingInvites >= limit) {
        const err = new ForbiddenException(
          `Your ${org.plan} plan allows up to ${limit} member(s). Upgrade to invite more.`,
        );
        (err as ForbiddenException & { code: string }).code =
          DomainErrorCode.PLAN_LIMIT_REACHED;
        throw err;
      }
    }

    // Replace any previous pending invite for the same email.
    await this.prisma.client.invitation.deleteMany({
      where: { organizationId: org.id, email, acceptedAt: null },
    });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + INVITE_TTL_DAYS);

    const invitation = await this.prisma.client.invitation.create({
      data: {
        email,
        role: dto.role ?? MemberRole.MEMBER,
        organizationId: org.id,
        expiresAt,
      },
    });

    const frontend =
      this.config.get<string>("FRONTEND_URL") ?? "http://localhost:3000";
    const inviteUrl = `${frontend}/invite/${invitation.token}`;

    const emailSent = await this.email.sendInvite({
      to: email,
      organizationName: org.name,
      inviteUrl,
    });

    return {
      id: invitation.id,
      email: invitation.email,
      role: invitation.role,
      expiresAt: invitation.expiresAt,
      inviteUrl,
      emailSent,
    };
  }
}
