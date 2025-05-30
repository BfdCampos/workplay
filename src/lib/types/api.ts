type Error<T extends object> = {
  type?: string;
  path?: keyof T;
  message?: string;
};

export type APIError<T extends Record<string | number, unknown>> = {
  status: 'error';
  message?: string;
  stack?: Error<T>[];
  data?: never;
  pageInfo?: never;
};

export type PageInfo = { nextCursor?: string } | { nextPage?: number };

export type APISuccess<T extends Record<string | number, unknown>, P extends PageInfo = Record<string, unknown>> = {
  status: 'ok';
  message?: never;
  stack?: never;
  data?: T;
  pageInfo?: P;
};

export type APIResponse<
  T extends Record<string | number, unknown> = Record<string, never>,
  P extends PageInfo = Record<string, unknown>
> = APIError<T> | APISuccess<T, P>;
