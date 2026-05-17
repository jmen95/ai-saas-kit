import { Module } from "@nestjs/common";
import { APP_FILTER, APP_INTERCEPTOR } from "@nestjs/core";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { GlobalExceptionFilter } from "../../shared/filters/http-exception.filter";
import { TransformInterceptor } from "../../shared/interceptors/transform.interceptor";
import { JwtStrategy } from "../../shared/strategies/jwt.strategy";
import { LoginUseCase } from "./application/use-cases/login.use-case";
import { RefreshUseCase } from "./application/use-cases/refresh.use-case";
import { RegisterUseCase } from "./application/use-cases/register.use-case";
import { TokenService } from "./infrastructure/token.service";
import { AuthController } from "./presentation/auth.controller";

@Module({
  imports: [PassportModule.register({ defaultStrategy: "jwt" }), JwtModule.register({})],
  controllers: [AuthController],
  providers: [
    TokenService,
    RegisterUseCase,
    LoginUseCase,
    RefreshUseCase,
    JwtStrategy,
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
  ],
  exports: [TokenService, JwtModule, PassportModule],
})
export class AuthModule {}
