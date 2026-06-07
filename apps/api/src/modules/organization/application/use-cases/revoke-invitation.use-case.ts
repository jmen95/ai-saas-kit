import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../../../infrastructure/prisma/prisma.service";

@Injectable()
export class RevokeInvitationUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(organizationId: string, invitationId: string) {
    const invitation = await this.prisma.client.invitation.findFirst({
      where: { id: invitationId, organizationId },
    });
    if (!invitation) {
      throw new NotFoundException("Invitation not found");
    }

    await this.prisma.client.invitation.delete({
      where: { id: invitationId },
    });
    return { success: true };
  }
}
