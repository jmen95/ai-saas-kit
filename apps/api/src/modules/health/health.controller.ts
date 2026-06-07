import { Controller, Get } from "@nestjs/common";
import { SkipThrottle } from "@nestjs/throttler";
import { PrismaService } from "../../infrastructure/prisma/prisma.service";
import { RedisService } from "../../infrastructure/redis/redis.service";

@SkipThrottle()
@Controller("health")
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  @Get()
  async check() {
    const [database, redis] = await Promise.all([
      this.ping(() => this.prisma.client.$queryRaw`SELECT 1`),
      this.ping(() => this.redis.client.ping()),
    ]);

    const status = database && redis ? "ok" : "degraded";
    return {
      status,
      uptime: process.uptime(),
      services: { database, redis },
    };
  }

  private async ping(fn: () => Promise<unknown>): Promise<boolean> {
    try {
      await fn();
      return true;
    } catch {
      return false;
    }
  }
}
