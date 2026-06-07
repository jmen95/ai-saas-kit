import { Body, Controller, Get, Patch, UseGuards } from "@nestjs/common";
import type { JwtPayload } from "@repo/shared";
import { CurrentUser } from "../../../shared/decorators/current-user.decorator";
import { JwtAuthGuard } from "../../../shared/guards/jwt-auth.guard";
import { ChangePasswordDto } from "../application/dtos/change-password.dto";
import { UpdateProfileDto } from "../application/dtos/update-profile.dto";
import { ChangePasswordUseCase } from "../application/use-cases/change-password.use-case";
import { GetProfileUseCase } from "../application/use-cases/get-profile.use-case";
import { UpdateProfileUseCase } from "../application/use-cases/update-profile.use-case";

@Controller("users")
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(
    private readonly getProfile: GetProfileUseCase,
    private readonly updateProfile: UpdateProfileUseCase,
    private readonly changePassword: ChangePasswordUseCase,
  ) {}

  @Get("me")
  getMe(@CurrentUser() user: JwtPayload) {
    return this.getProfile.execute(user.sub);
  }

  @Patch("me")
  patchMe(@CurrentUser() user: JwtPayload, @Body() dto: UpdateProfileDto) {
    return this.updateProfile.execute(user.sub, dto);
  }

  @Patch("me/password")
  changeMyPassword(
    @CurrentUser() user: JwtPayload,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.changePassword.execute(user.sub, dto);
  }
}
