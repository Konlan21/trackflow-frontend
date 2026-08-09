import { apiClient } from "./client";
import type { Budget, BudgetSummary, ExpenditureCategory } from "../types/types";

export const listBudgets = () => apiClient.get<Budget[]>("/user/budgets").then((r) => r.data);

export const getBudgetSummary = () =>
  apiClient
    .get<Record<string, { limit: string; spent: string; remaining: string; percentage: number }>>(
      "/user/budgets/summary"
    )
    .then((r) => {
      const parsed: BudgetSummary = {};
      for (const category in r.data) {
        const item = r.data[category];
        parsed[category] = {
          limit: parseFloat(item.limit),
          spent: parseFloat(item.spent),
          remaining: parseFloat(item.remaining),
          percentage: item.percentage,
        };
      }
      return parsed;
    });

    
export const getBudget = (id: string) =>
  apiClient.get<Budget>(`/user/budgets/${id}`).then((r) => r.data);

export const createBudget = (data: {
  category: ExpenditureCategory; monthly_limit: number; month: number; year: number;
}) => apiClient.post<Budget>("/user/budgets", data).then((r) => r.data);

export const updateBudget = (
  id: string,
  data: Partial<{ category: ExpenditureCategory; monthly_limit: number; month: number; year: number; }>
) => apiClient.patch<Budget>(`/user/budgets/${id}`, data).then((r) => r.data);

export const deleteBudget = (id: string) => apiClient.delete(`/user/budgets/${id}`);