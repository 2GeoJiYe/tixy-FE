import type { ApiErrorPayload } from "@/shared/api/types";

export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;
  readonly payload?: ApiErrorPayload | null;

  constructor(message: string, status = 500, code?: string, payload?: ApiErrorPayload | null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.payload = payload;
  }
}

export function getErrorMessage(error: unknown, fallback = "요청을 처리하지 못했습니다.") {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}
