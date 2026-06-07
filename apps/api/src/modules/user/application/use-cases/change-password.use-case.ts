import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { DomainErrorCode } from "@repo/shared";
import { PrismaService } from "../../../../infrastructure/prisma/prisma.service";
import type { ChangePasswordDto } from "../dtos/change-password.dto";

@Injectable()
export class ChangePasswordUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.client.user.findUnique({
      where: { id: userId },
      select: { id: true, passwordHash: true },
    });
    if (!user) throw new NotFoundException("User not found");

    if (!user.passwordHash) {
      throw new BadRequestException(
        "This account has no password set (OAuth account).",
      );
    }

    const valid = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!valid) {
      const err = new BadRequestException("Current password is incorrect");
      (err as BadRequestException & { code: string }).code =
        DomainErrorCode.INVALID_CREDENTIALS;
      throw err;
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, 12);
    await this.prisma.client.$transaction([
      this.prisma.client.user.update({
        where: { id: userId },
        data: { passwordHash },
      }),
      // Invalidate every refresh token so other sessions must re-authenticate.
      this.prisma.client.refreshToken.deleteMany({ where: { userId } }),
    ]);

    return { success: true };
  }
}
