import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../../infrastructure/prisma/prisma.service";

@Injectable()
export class ListInvitationsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(organizationId: string) {
    const invitations = await this.prisma.client.invitation.findMany({
      where: { organizationId, acceptedAt: null },
      orderBy: { createdAt: "desc" },
    });

    return invitations.map((i) => ({
      id: i.id,
      email: i.email,
      role: i.role,
      expiresAt: i.expiresAt,
      expired: i.expiresAt.getTime() < Date.now(),
    }));
  }
}
