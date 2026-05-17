export type ApiMeta = {
  total?: number;
  page?: number;
  perPage?: number;
};

export type ApiSuccessResponse<T> = {
  data: T;
  meta?: ApiMeta;
};

export type ApiErrorBody = {
  code: string;
  message: string;
  statusCode: number;
};

export type ApiErrorResponse = {
  error: ApiErrorBody;
};
