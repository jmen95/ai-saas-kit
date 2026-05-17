import { Module } from "@nestjs/common";
import { GetProfileUseCase } from "./application/use-cases/get-profile.use-case";
import { UpdateProfileUseCase } from "./application/use-cases/update-profile.use-case";
import { UserController } from "./presentation/user.controller";

@Module({
  controllers: [UserController],
  providers: [GetProfileUseCase, UpdateProfileUseCase],
})
export class UserModule {}
