import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from "@nestjs/common";
import type { Organization } from "@repo/db";
import type { JwtPayload } from "@repo/shared";
import { CurrentOrg } from "../../../shared/decorators/current-org.decorator";
import { CurrentUser } from "../../../shared/decorators/current-user.decorator";
import { JwtAuthGuard } from "../../../shared/guards/jwt-auth.guard";
import { TenantGuard } from "../../../shared/guards/tenant.guard";
import { AcceptInvitationDto } from "../application/dtos/accept-invitation.dto";
import { InviteMemberDto } from "../application/dtos/invite-member.dto";
import { AcceptInvitationUseCase } from "../application/use-cases/accept-invitation.use-case";
import { GetInvitationUseCase } from "../application/use-cases/get-invitation.use-case";
import { InviteMemberUseCase } from "../application/use-cases/invite-member.use-case";
import { ListInvitationsUseCase } from "../application/use-cases/list-invitations.use-case";
import { RevokeInvitationUseCase } from "../application/use-cases/revoke-invitation.use-case";

@Controller("organizations")
export class InvitationController {
  constructor(
    private readonly inviteMember: InviteMemberUseCase,
    private readonly listInvitations: ListInvitationsUseCase,
    private readonly revokeInvitation: RevokeInvitationUseCase,
    private readonly acceptInvitation: AcceptInvitationUseCase,
    private readonly getInvitation: GetInvitationUseCase,
  ) {}

  @Post("current/invitations")
  @UseGuards(JwtAuthGuard, TenantGuard)
  invite(@CurrentOrg() org: Organization, @Body() dto: InviteMemberDto) {
    return this.inviteMember.execute(org, dto);
  }

  @Get("current/invitations")
  @UseGuards(JwtAuthGuard, TenantGuard)
  list(@CurrentOrg() org: Organization) {
    return this.listInvitations.execute(org.id);
  }

  @Delete("current/invitations/:id")
  @UseGuards(JwtAuthGuard, TenantGuard)
  revoke(@CurrentOrg() org: Organization, @Param("id") id: string) {
    return this.revokeInvitation.execute(org.id, id);
  }

  // Public preview of an invitation so the accept page can show context.
  @Get("invitations/:token")
  preview(@Param("token") token: string) {
    return this.getInvitation.execute(token);
  }

  // Authenticated, but intentionally NOT tenant-scoped: the user is joining a
  // different organization than the one in their current JWT context.
  @Post("invitations/accept")
  @UseGuards(JwtAuthGuard)
  accept(@CurrentUser() user: JwtPayload, @Body() dto: AcceptInvitationDto) {
    return this.acceptInvitation.execute(user.sub, dto.token);
  }
}
