import { apiClient } from "./client";
import type { Income } from "../types";

export const listIncomes = () => apiClient.get<Income[]>("/user/income").then((r) => r.data);

export const createIncome = (data: { nameOfRevenue: string; amount: number }) =>
  apiClient.post<Income>("/user/income", data).then((r) => r.data);

export const deleteIncome = (id: string) => apiClient.delete(`/user/income/${id}`);