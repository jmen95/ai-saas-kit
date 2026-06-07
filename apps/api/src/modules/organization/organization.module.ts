import { Module } from "@nestjs/common";
import { GetCurrentOrgUseCase } from "./application/use-cases/get-current-org.use-case";
import { ListMembersUseCase } from "./application/use-cases/list-members.use-case";
import { UpdateOrgUseCase } from "./application/use-cases/update-org.use-case";
import { RemoveMemberUseCase } from "./application/use-cases/remove-member.use-case";
import { UpdateMemberRoleUseCase } from "./application/use-cases/update-member-role.use-case";
import { InviteMemberUseCase } from "./application/use-cases/invite-member.use-case";
import { ListInvitationsUseCase } from "./application/use-cases/list-invitations.use-case";
import { RevokeInvitationUseCase } from "./application/use-cases/revoke-invitation.use-case";
import { AcceptInvitationUseCase } from "./application/use-cases/accept-invitation.use-case";
import { GetInvitationUseCase } from "./application/use-cases/get-invitation.use-case";
import { InvitationEmailService } from "./infrastructure/invitation-email.service";
import { OrganizationController } from "./presentation/organization.controller";
import { InvitationController } from "./presentation/invitation.controller";

@Module({
  controllers: [OrganizationController, InvitationController],
  providers: [
    GetCurrentOrgUseCase,
    UpdateOrgUseCase,
    ListMembersUseCase,
    RemoveMemberUseCase,
    UpdateMemberRoleUseCase,
    InviteMemberUseCase,
    ListInvitationsUseCase,
    RevokeInvitationUseCase,
    AcceptInvitationUseCase,
    GetInvitationUseCase,
    InvitationEmailService,
  ],
})
export class OrganizationModule {}
