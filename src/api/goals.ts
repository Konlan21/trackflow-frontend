import { apiClient } from "./client";
import type { Goal, GoalStatus } from "../types";

export const listGoals = () => apiClient.get<Goal[]>("/user/goals").then((r) => r.data);

export const getGoal = (id: string) =>
  apiClient.get<Goal>(`/user/goals/${id}`).then((r) => r.data);

export const createGoal = (data: {
  title: string;
  target_amount: number;
  current_amount?: number;
  deadline?: string | null;
  status?: GoalStatus;
}) => apiClient.post<Goal>("/user/goals", data).then((r) => r.data);

export const updateGoal = (
  id: string,
  data: Partial<{ title: string; target_amount: number; current_amount: number; deadline: string | null; status: GoalStatus; }>
) => apiClient.patch<Goal>(`/user/goals/${id}`, data).then((r) => r.data);

export const deleteGoal = (id: string) => apiClient.delete(`/user/goals/${id}`);