function readBoolean(value: string | undefined, fallback: boolean) {
  if (value == null || value === "") {
    return fallback;
  }

  return value === "true";
}

export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? "/api",
  supportApiBaseUrl: import.meta.env.VITE_SUPPORT_API_BASE_URL ?? "/api",
  supportWsUrl: import.meta.env.VITE_SUPPORT_WS_URL ?? "/ws/support",
  enableMockSeatMap: readBoolean(import.meta.env.VITE_ENABLE_MOCK_SEAT_MAP, true),
};
