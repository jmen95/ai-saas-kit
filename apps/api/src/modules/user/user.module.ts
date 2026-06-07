import { Module } from "@nestjs/common";
import { ChangePasswordUseCase } from "./application/use-cases/change-password.use-case";
import { GetProfileUseCase } from "./application/use-cases/get-profile.use-case";
import { UpdateProfileUseCase } from "./application/use-cases/update-profile.use-case";
import { UserController } from "./presentation/user.controller";

@Module({
  controllers: [UserController],
  providers: [GetProfileUseCase, UpdateProfileUseCase, ChangePasswordUseCase],
})
export class UserModule {}
