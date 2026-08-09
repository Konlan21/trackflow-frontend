import { apiClient } from "./client";
import type { Expenditure, ExpenditureCategory } from "../types";

export const listExpenditures = () =>
  apiClient.get<Expenditure[]>("/user/expenditure").then((r) => r.data);

export const createExpenditure = (data: {
  nameOfItem: string;
  amount: number;
  category: ExpenditureCategory;
}) => apiClient.post<Expenditure>("/user/expenditure", data).then((r) => r.data);

export const deleteExpenditure = (id: string) => apiClient.delete(`/user/expenditure/${id}`);