import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Observable, map } from "rxjs";
import type { ApiSuccessResponse } from "@repo/shared";

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ApiSuccessResponse<T>>
{
  intercept(
    _context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ApiSuccessResponse<T>> {
    return next.handle().pipe(
      map((data) => {
        if (
          data &&
          typeof data === "object" &&
          "data" in data &&
          Object.keys(data).length <= 2
        ) {
          return data as ApiSuccessResponse<T>;
        }
        return { data };
      }),
    );
  }
}
