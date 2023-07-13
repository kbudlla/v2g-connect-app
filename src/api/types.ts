// This could be typed a lot better, I did that a while ago, but for this sophisticated API it's fine.

export type APIResponse<T> = {
  status: number;
  data: T | null;
};

export enum APIHookError {
  ServerSideError,
  InvalidRequestError,
}

export type PaginationResult<T> = {
  offset: number;
  count: number;
  totalCount: number;
  elements: T[];
};
