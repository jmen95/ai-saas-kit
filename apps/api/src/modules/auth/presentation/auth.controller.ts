import { Body, Controller, Post } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { LoginDto } from "../application/dtos/login.dto";
import { RefreshDto } from "../application/dtos/refresh.dto";
import { RegisterDto } from "../application/dtos/register.dto";
import { LoginUseCase } from "../application/use-cases/login.use-case";
import { RefreshUseCase } from "../application/use-cases/refresh.use-case";
import { RegisterUseCase } from "../application/use-cases/register.use-case";
import { TokenService } from "../infrastructure/token.service";

// Stricter rate limit on auth endpoints: 20 requests / minute / IP.
@Throttle({ default: { ttl: 60_000, limit: 20 } })
@Controller("auth")
export class AuthController {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly refreshUseCase: RefreshUseCase,
    private readonly tokens: TokenService,
  ) {}

  @Post("register")
  register(@Body() dto: RegisterDto) {
    return this.registerUseCase.execute(dto);
  }

  @Post("login")
  login(@Body() dto: LoginDto) {
    return this.loginUseCase.execute(dto);
  }

  @Post("refresh")
  refresh(@Body() dto: RefreshDto) {
    return this.refreshUseCase.execute(dto.refreshToken);
  }

  @Post("logout")
  async logout(@Body() dto: RefreshDto) {
    await this.tokens.revokeRefreshToken(dto.refreshToken);
    return { success: true };
  }
}
