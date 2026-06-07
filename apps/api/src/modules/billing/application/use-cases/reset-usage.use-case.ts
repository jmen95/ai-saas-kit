import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../../infrastructure/prisma/prisma.service";

@Injectable()
export class ResetUsageUseCase {
  constructor(private readonly prisma: PrismaService) {}

  /** Reset the monthly message counter for every organization (cron). */
  async resetAll() {
    const result = await this.prisma.client.organization.updateMany({
      data: { messagesUsedThisMonth: 0, lastUsageReset: new Date() },
    });
    return { reset: result.count };
  }

  /** Reset the counter for a single organization (manual / demo). */
  async resetOne(organizationId: string) {
    await this.prisma.client.organization.update({
      where: { id: organizationId },
      data: { messagesUsedThisMonth: 0, lastUsageReset: new Date() },
    });
    return { success: true };
  }
}
