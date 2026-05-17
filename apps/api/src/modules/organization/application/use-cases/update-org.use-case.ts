import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../../infrastructure/prisma/prisma.service";
import type { UpdateOrganizationDto } from "../dtos/update-organization.dto";

@Injectable()
export class UpdateOrgUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(organizationId: string, dto: UpdateOrganizationDto) {
    return this.prisma.client.organization.update({
      where: { id: organizationId },
      data: {
        name: dto.name,
        logoUrl: dto.logoUrl,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        logoUrl: true,
        plan: true,
      },
    });
  }
}
