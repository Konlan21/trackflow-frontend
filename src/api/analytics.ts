import { apiClient } from "./client";
import type {
  MonthlyAnalyticsItem, CategoryAnalyticsItem, DailySpendingItem,
  TopExpenseItem, MonthlyComparisonResponse,
} from "../types/types";

export const getMonthlyTrend = () =>
  apiClient.get<MonthlyAnalyticsItem[]>("/user/analytics/monthly").then((r) => r.data);

export const getCategoryBreakdown = () =>
  apiClient.get<CategoryAnalyticsItem[]>("/user/analytics/categories").then((r) => r.data);

export const getDailySpending = () =>
  apiClient.get<DailySpendingItem[]>("/user/analytics/daily").then((r) => r.data);

export const getTopExpenses = () =>
  apiClient.get<TopExpenseItem[]>("/user/analytics/top-expenses").then((r) => r.data);

export const getComparison = () =>
  apiClient.get<MonthlyComparisonResponse>("/user/analytics/comparison").then((r) => r.data);