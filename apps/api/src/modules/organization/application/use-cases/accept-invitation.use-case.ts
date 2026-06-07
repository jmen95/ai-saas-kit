import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { DomainErrorCode } from "@repo/shared";
import { PrismaService } from "../../../../infrastructure/prisma/prisma.service";

@Injectable()
export class AcceptInvitationUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(userId: string, token: string) {
    const invitation = await this.prisma.client.invitation.findUnique({
      where: { token },
    });
    if (!invitation || invitation.acceptedAt) {
      throw new NotFoundException("Invitation not found or already used");
    }

    if (invitation.expiresAt.getTime() < Date.now()) {
      const err = new BadRequestException("Invitation has expired");
      (err as BadRequestException & { code: string }).code =
        DomainErrorCode.INVITATION_EXPIRED;
      throw err;
    }

    const existing = await this.prisma.client.organizationMember.findUnique({
      where: {
        userId_organizationId: {
          userId,
          organizationId: invitation.organizationId,
        },
      },
    });
    if (existing) {
      const err = new BadRequestException(
        "You are already a member of this organization",
      );
      (err as BadRequestException & { code: string }).code =
        DomainErrorCode.ALREADY_MEMBER;
      throw err;
    }

    await this.prisma.client.$transaction([
      this.prisma.client.organizationMember.create({
        data: {
          userId,
          organizationId: invitation.organizationId,
          role: invitation.role,
        },
      }),
      this.prisma.client.invitation.update({
        where: { id: invitation.id },
        data: { acceptedAt: new Date() },
      }),
    ]);

    return { organizationId: invitation.organizationId };
  }
}
