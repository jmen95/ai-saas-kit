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
import { RemoveMemberUseCase } from "../application/use-cases/remove-member.use-case";
import { UpdateMemberRoleUseCase } from "../application/use-cases/update-member-role.use-case";
import { UpdateOrgUseCase } from "../application/use-cases/update-org.use-case";

@Controller("organizations")
@UseGuards(JwtAuthGuard, TenantGuard)
export class OrganizationController {
  constructor(
    private readonly getCurrentOrg: GetCurrentOrgUseCase,
    private readonly updateOrg: UpdateOrgUseCase,
    private readonly listMembers: ListMembersUseCase,
    private readonly removeMember: RemoveMemberUseCase,
    private readonly updateMemberRole: UpdateMemberRoleUseCase,
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
  remove(@CurrentOrg() org: Organization, @Param("id") memberId: string) {
    return this.removeMember.execute(org.id, memberId);
  }

  @Patch("current/members/:id")
  updateRole(
    @CurrentOrg() org: Organization,
    @Param("id") memberId: string,
    @Body() dto: UpdateMemberRoleDto,
  ) {
    return this.updateMemberRole.execute(org.id, memberId, dto.role);
  }
}
