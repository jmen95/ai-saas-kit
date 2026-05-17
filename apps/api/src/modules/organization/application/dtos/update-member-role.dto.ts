import { IsEnum } from "class-validator";
import { MemberRole } from "@repo/db";

export class UpdateMemberRoleDto {
  @IsEnum(MemberRole)
  role!: MemberRole;
}
