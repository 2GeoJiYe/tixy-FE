export interface JwtPayload {
  exp?: number;
  role?: string;
  sub?: string;
}

function normalizeBase64(input: string) {
  return input.replace(/-/g, "+").replace(/_/g, "/");
}

export function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const [, payload] = token.split(".");
    if (!payload) {
      return null;
    }

    const decoded = atob(normalizeBase64(payload));
    return JSON.parse(decoded) as JwtPayload;
  } catch {
    return null;
  }
}
