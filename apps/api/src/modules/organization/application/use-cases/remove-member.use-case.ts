import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { DomainErrorCode } from "@repo/shared";
import { PrismaService } from "../../../../infrastructure/prisma/prisma.service";

@Injectable()
export class RemoveMemberUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(organizationId: string, memberId: string) {
    const member = await this.prisma.client.organizationMember.findFirst({
      where: { id: memberId, organizationId },
    });
    if (!member) throw new NotFoundException("Member not found");

    if (member.role === "OWNER") {
      const err = new ForbiddenException("Cannot remove organization owner");
      (err as ForbiddenException & { code: string }).code =
        DomainErrorCode.CANNOT_REMOVE_OWNER;
      throw err;
    }

    await this.prisma.client.organizationMember.delete({
      where: { id: memberId },
    });
    return { success: true };
  }
}
