import { apiClient } from "./client";
import type { DashboardResponse } from "../types";

export const getDashboard = () =>
  apiClient.get<DashboardResponse>("/user/dashboard/").then((r) => r.data);

export const getAiInsight = (query: string) =>
  apiClient.post<{ insight: string }>("/user/ai-query/", { query }).then((r) => r.data);