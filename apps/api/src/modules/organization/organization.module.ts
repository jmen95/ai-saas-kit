import { Module } from "@nestjs/common";
import { GetCurrentOrgUseCase } from "./application/use-cases/get-current-org.use-case";
import { ListMembersUseCase } from "./application/use-cases/list-members.use-case";
import { UpdateOrgUseCase } from "./application/use-cases/update-org.use-case";
import { OrganizationController } from "./presentation/organization.controller";

@Module({
  controllers: [OrganizationController],
  providers: [GetCurrentOrgUseCase, UpdateOrgUseCase, ListMembersUseCase],
})
export class OrganizationModule {}
