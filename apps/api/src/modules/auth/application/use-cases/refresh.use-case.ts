import { Injectable, UnauthorizedException } from "@nestjs/common";
import { DomainErrorCode } from "@repo/shared";
import { TokenService } from "../../infrastructure/token.service";

@Injectable()
export class RefreshUseCase {
  constructor(private readonly tokens: TokenService) {}

  async execute(refreshToken: string) {
    try {
      return await this.tokens.rotateRefreshToken(refreshToken);
    } catch {
      const err = new UnauthorizedException("Invalid refresh token");
      (err as UnauthorizedException & { code: string }).code =
        DomainErrorCode.INVALID_REFRESH_TOKEN;
      throw err;
    }
  }
}
