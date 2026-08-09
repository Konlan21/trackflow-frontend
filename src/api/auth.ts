import { apiClient } from "./client";
import type { LoginResponse } from "../types";

export async function login(email: string, password: string): Promise<LoginResponse> {
  const res = await apiClient.post<LoginResponse>("/auth/login", { email, password });
  return res.data;
}

export async function signup(
  email: string,
  username: string,
  firstName: string,
  lastName: string,
  password: string,
  confirmPassword: string
) {
  const res = await apiClient.post("/auth/signup", {
    email,
    username,
    first_name: firstName,
    last_name: lastName,
    password,
    confirm_password: confirmPassword,
  });
  return res.data;
}

export async function logout(refresh: string) {
  await apiClient.post("/auth/logout", { refresh });
}