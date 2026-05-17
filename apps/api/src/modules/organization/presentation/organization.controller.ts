import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  UseGuards,
} from "@nestjs/common";
import type { Organization } from "@repo/db";
import { CurrentOrg } from "../../../shared/decorators/current-org.decorator";
import { JwtAuthGuard } from "../../../shared/guards/jwt-auth.guard";
import { TenantGuard } from "../../../shared/guards/tenant.guard";
import { UpdateMemberRoleDto } from "../application/dtos/update-member-role.dto";
import { UpdateOrganizationDto } from "../application/dtos/update-organization.dto";
import { GetCurrentOrgUseCase } from "../application/use-cases/get-current-org.use-case";
import { ListMembersUseCase } from "../application/use-cases/list-members.use-case";
import { UpdateOrgUseCase } from "../application/use-cases/update-org.use-case";
import { PrismaService } from "../../../infrastructure/prisma/prisma.service";
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from "@nestjs/common";
import { DomainErrorCode } from "@repo/shared";

@Controller("organizations")
@UseGuards(JwtAuthGuard, TenantGuard)
export class OrganizationController {
  constructor(
    private readonly getCurrentOrg: GetCurrentOrgUseCase,
    private readonly updateOrg: UpdateOrgUseCase,
    private readonly listMembers: ListMembersUseCase,
    private readonly prisma: PrismaService,
  ) {}

  @Get("current")
  current(@CurrentOrg() org: Organization) {
    return this.getCurrentOrg.execute(org);
  }

  @Patch("current")
  updateCurrent(
    @CurrentOrg() org: Organization,
    @Body() dto: UpdateOrganizationDto,
  ) {
    return this.updateOrg.execute(org.id, dto);
  }

  @Get("current/members")
  members(@CurrentOrg() org: Organization) {
    return this.listMembers.execute(org.id);
  }

  @Delete("current/members/:id")
  async removeMember(
    @CurrentOrg() org: Organization,
    @Param("id") memberId: string,
  ) {
    const member = await this.prisma.client.organizationMember.findFirst({
      where: { id: memberId, organizationId: org.id },
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

  @Patch("current/members/:id")
  async updateMemberRole(
    @CurrentOrg() org: Organization,
    @Param("id") memberId: string,
    @Body() dto: UpdateMemberRoleDto,
  ) {
    const member = await this.prisma.client.organizationMember.findFirst({
      where: { id: memberId, organizationId: org.id },
    });
    if (!member) throw new NotFoundException("Member not found");
    if (member.role === "OWNER" && dto.role !== "OWNER") {
      throw new BadRequestException("Cannot change owner role directly");
    }
    return this.prisma.client.organizationMember.update({
      where: { id: memberId },
      data: { role: dto.role },
      include: {
        user: { select: { id: true, email: true, name: true } },
      },
    });
  }
}
