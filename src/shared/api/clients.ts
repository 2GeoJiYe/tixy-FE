import { createHttpClient } from "@/shared/api/http";
import { env } from "@/shared/config/env";

export const mainApiClient = createHttpClient({
  baseUrl: env.apiBaseUrl,
});

export const supportApiClient = createHttpClient({
  baseUrl: env.supportApiBaseUrl,
});
