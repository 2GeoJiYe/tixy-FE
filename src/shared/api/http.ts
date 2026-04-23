import { ApiError } from "@/shared/api/error";
import type { ApiResponse, QueryValue } from "@/shared/api/types";

type UnauthorizedHandler = (() => void) | null;

let unauthorizedHandler: UnauthorizedHandler = null;

export function registerUnauthorizedHandler(handler: () => void) {
  unauthorizedHandler = handler;
}

export function clearUnauthorizedHandler() {
  unauthorizedHandler = null;
}

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  query?: Record<string, QueryValue>;
  token?: string | null;
  auth?: "required" | "optional" | "none";
  redirectOnUnauthorized?: boolean;
}

interface HttpClientOptions {
  baseUrl: string;
}

function buildUrl(baseUrl: string, path: string, query?: Record<string, QueryValue>) {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(`${normalizedBase}${normalizedPath}`, window.location.origin);

  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value == null || value === "") {
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((item) => url.searchParams.append(key, String(item)));
      return;
    }

    url.searchParams.set(key, String(value));
  });

  return url.toString();
}

async function parseResponse<T>(response: Response): Promise<ApiResponse<T> | null> {
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return null;
  }

  return (await response.json()) as ApiResponse<T>;
}

export function createHttpClient({ baseUrl }: HttpClientOptions) {
  return {
    async request<T>(path: string, options: RequestOptions = {}) {
      const {
        body,
        query,
        token,
        auth = "required",
        redirectOnUnauthorized = true,
        headers,
        ...init
      } = options;

      const requestHeaders = new Headers(headers);

      if (!requestHeaders.has("Content-Type") && body != null) {
        requestHeaders.set("Content-Type", "application/json");
      }

      if (auth !== "none" && token) {
        requestHeaders.set("Authorization", `Bearer ${token}`);
      }

      const response = await fetch(buildUrl(baseUrl, path, query), {
        ...init,
        headers: requestHeaders,
        credentials: "include",
        body: body == null ? undefined : JSON.stringify(body),
      });

      const parsed = await parseResponse<T>(response);

      if (response.status === 401 && redirectOnUnauthorized) {
        unauthorizedHandler?.();
      }

      if (!response.ok) {
        throw new ApiError(
          parsed?.error?.message ?? "서버 요청에 실패했습니다.",
          response.status,
          parsed?.error?.code,
          parsed?.error,
        );
      }

      if (parsed == null) {
        return null as T;
      }

      if (!parsed.success) {
        throw new ApiError(
          parsed.error?.message ?? "서버 요청에 실패했습니다.",
          parsed.error?.status ?? response.status,
          parsed.error?.code,
          parsed.error,
        );
      }

      return parsed.data as T;
    },
  };
}
