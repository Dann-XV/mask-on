import { post } from "@/lib/api/client";
import type { LoginResponse, RegisterResponse } from "@/types/api";

export function registerAccount(password: string) {
  return post<RegisterResponse>("/users/register", { password });
}

export function login(username: string, password: string) {
  return post<LoginResponse>("/users/login", { username, password });
}
