import { mainApiClient } from "@/shared/api/clients";
import type { LoginRequest, LoginResponse, SignUpRequest, SignUpResponse } from "@/features/auth/types";

export async function login(request: LoginRequest) {
  return mainApiClient.request<LoginResponse>("/auth/v1/login", {
    method: "POST",
    body: request,
    auth: "none",
  });
}

export async function signup(request: SignUpRequest) {
  return mainApiClient.request<SignUpResponse>("/auth/v1/signup", {
    method: "POST",
    body: request,
    auth: "none",
  });
}

export async function logout(token: string | null) {
  return mainApiClient.request<string>("/auth/v1/logout", {
    method: "POST",
    token,
    auth: token ? "required" : "none",
  });
}
