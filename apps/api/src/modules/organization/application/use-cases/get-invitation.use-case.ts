import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../../../infrastructure/prisma/prisma.service";

@Injectable()
export class GetInvitationUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(token: string) {
    const invitation = await this.prisma.client.invitation.findUnique({
      where: { token },
      include: { organization: { select: { name: true } } },
    });
    if (!invitation || invitation.acceptedAt) {
      throw new NotFoundException("Invitation not found or already used");
    }

    return {
      email: invitation.email,
      role: invitation.role,
      organizationName: invitation.organization.name,
      expired: invitation.expiresAt.getTime() < Date.now(),
    };
  }
}
