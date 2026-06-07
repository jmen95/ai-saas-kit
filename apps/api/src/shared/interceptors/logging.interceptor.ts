import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from "@nestjs/common";
import { randomUUID } from "crypto";
import type { Request, Response } from "express";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";

/**
 * Attaches a correlation id (x-request-id) to every request/response and emits
 * a structured access log line with method, path, status and latency.
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger("HTTP");

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== "http") return next.handle();

    const http = context.switchToHttp();
    const req = http.getRequest<Request>();
    const res = http.getResponse<Response>();

    const requestId =
      (req.headers["x-request-id"] as string) || randomUUID();
    res.setHeader("x-request-id", requestId);

    const start = Date.now();
    const { method, originalUrl } = req;

    return next.handle().pipe(
      tap(() => {
        const ms = Date.now() - start;
        this.logger.log(
          `[${requestId}] ${method} ${originalUrl} ${res.statusCode} ${ms}ms`,
        );
      }),
    );
  }
}
