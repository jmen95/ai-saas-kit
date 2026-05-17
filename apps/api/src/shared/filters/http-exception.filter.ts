import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import type { Response } from "express";
import { DomainErrorCode } from "@repo/shared";

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const res = exception.getResponse();
      const message =
        typeof res === "string"
          ? res
          : ((res as { message?: string | string[] }).message ?? exception.message);
      const code =
        (exception as HttpException & { code?: string }).code ??
        this.statusToCode(status);

      response.status(status).json({
        error: {
          code,
          message: Array.isArray(message) ? message.join(", ") : message,
          statusCode: status,
        },
      });
      return;
    }

    console.error(exception);
    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      error: {
        code: "INTERNAL_ERROR",
        message: "Internal server error",
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      },
    });
  }

  private statusToCode(status: number): string {
    switch (status) {
      case HttpStatus.UNAUTHORIZED:
        return DomainErrorCode.INVALID_CREDENTIALS;
      case HttpStatus.FORBIDDEN:
        return DomainErrorCode.PLAN_LIMIT_REACHED;
      case HttpStatus.NOT_FOUND:
        return DomainErrorCode.CONVERSATION_NOT_FOUND;
      case HttpStatus.CONFLICT:
        return DomainErrorCode.EMAIL_ALREADY_EXISTS;
      default:
        return "INTERNAL_ERROR";
    }
  }
}
