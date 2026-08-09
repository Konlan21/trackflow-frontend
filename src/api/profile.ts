import { apiClient } from "./client";
import type { User } from "../types";

export const getProfile = (userId: string) =>
  apiClient.get<User>(`/auth/user/${userId}/profile`).then((r) => r.data);

export const updateProfile = (
  userId: string,
  data: Partial<{ email: string; username: string; first_name: string; last_name: string; }>
) => apiClient.patch<User>(`/auth/user/${userId}/profile`, data).then((r) => r.data);

export const changePassword = (
  userId: string,
  data: { current_password: string; new_password: string; confirm_new_password: string; }
) => apiClient.put(`/auth/user/${userId}/profile/password`, data).then((r) => r.data);

export const deleteAccount = (userId: string, password: string) =>
  apiClient.delete(`/auth/user/${userId}/profile`, { data: { password } });