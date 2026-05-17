import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { createHash, randomBytes } from "crypto";
import type { AuthTokens, JwtPayload } from "@repo/shared";
import { PrismaService } from "../../../infrastructure/prisma/prisma.service";

@Injectable()
export class TokenService {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  signAccessToken(payload: JwtPayload): string {
    return this.jwt.sign(payload, {
      secret: this.config.getOrThrow("JWT_SECRET"),
      expiresIn: "15m",
    });
  }

  async issueTokenPair(userId: string, email: string, orgId: string): Promise<AuthTokens> {
    const payload: JwtPayload = { sub: userId, email, orgId };
    const accessToken = this.signAccessToken(payload);
    const refreshToken = randomBytes(48).toString("hex");
    const tokenHash = this.hashRefreshToken(refreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await this.prisma.client.refreshToken.create({
      data: { userId, tokenHash, expiresAt },
    });

    return { accessToken, refreshToken };
  }

  async rotateRefreshToken(refreshToken: string): Promise<AuthTokens> {
    const tokenHash = this.hashRefreshToken(refreshToken);
    const stored = await this.prisma.client.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: { include: { memberships: true } } },
    });

    if (!stored || stored.expiresAt < new Date()) {
      throw new Error("INVALID_REFRESH_TOKEN");
    }

    await this.prisma.client.refreshToken.delete({ where: { id: stored.id } });

    const membership = stored.user.memberships[0];
    if (!membership) {
      throw new Error("NO_ORGANIZATION");
    }

    return this.issueTokenPair(
      stored.userId,
      stored.user.email,
      membership.organizationId,
    );
  }

  async revokeRefreshToken(refreshToken: string): Promise<void> {
    const tokenHash = this.hashRefreshToken(refreshToken);
    await this.prisma.client.refreshToken.deleteMany({ where: { tokenHash } });
  }

  hashRefreshToken(token: string): string {
    return createHash("sha256").update(token).digest("hex");
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
