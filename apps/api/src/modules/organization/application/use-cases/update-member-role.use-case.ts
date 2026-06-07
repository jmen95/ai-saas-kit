import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import type { MemberRole } from "@repo/db";
import { PrismaService } from "../../../../infrastructure/prisma/prisma.service";

@Injectable()
export class UpdateMemberRoleUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(organizationId: string, memberId: string, role: MemberRole) {
    const member = await this.prisma.client.organizationMember.findFirst({
      where: { id: memberId, organizationId },
    });
    if (!member) throw new NotFoundException("Member not found");

    if (member.role === "OWNER" && role !== "OWNER") {
      throw new BadRequestException("Cannot change the owner's role directly");
    }

    return this.prisma.client.organizationMember.update({
      where: { id: memberId },
      data: { role },
      include: {
        user: { select: { id: true, email: true, name: true } },
      },
    });
  }
}
