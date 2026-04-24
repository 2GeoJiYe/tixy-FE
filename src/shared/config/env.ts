function readBoolean(value: string | undefined, fallback: boolean) {
  if (value == null || value === "") {
    return fallback;
  }

  return value === "true";
}

export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? "/tixy/api",
  supportApiBaseUrl: import.meta.env.VITE_SUPPORT_API_BASE_URL ?? "/tixypt/api",
  supportWsUrl: import.meta.env.VITE_SUPPORT_WS_URL ?? "/tixypt/ws/support",
  enableMockSeatMap: readBoolean(import.meta.env.VITE_ENABLE_MOCK_SEAT_MAP, true),
};
