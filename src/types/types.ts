export interface User {
  id: string;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  id: string;
  email: string;
  message: string;
}

export interface Income {
  id: string;
  nameOfRevenue: string;
  amount: string;
  created_at: string;
  updated_at: string;
}

export type ExpenditureCategory =
  | "FOOD"
  | "TRANSPORT"
  | "RENT"
  | "UTILITIES"
  | "ENTERTAINMENT"
  | "HEALTHCARE"
  | "EDUCATION"
  | "OTHER";

export interface Expenditure {
  id: string;
  nameOfItem: string;
  amount: string;
  category: ExpenditureCategory;
  created_at: string;
  updated_at: string;
}

export interface Budget {
  id: string;
  category: ExpenditureCategory;
  monthly_limit: string;
  month: number;
  year: number;
  created_at: string;
  updated_at: string;
}

export interface BudgetSummaryItem {
  limit: number;
  spent: number;
  remaining: number;
  percentage: number;
}

export type BudgetSummary = Record<string, BudgetSummaryItem>;

export type GoalStatus = "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

export interface Goal {
  id: string;
  title: string;
  target_amount: string;
  current_amount: string;
  deadline: string | null;
  status: GoalStatus;
  created_at: string;
  updated_at: string;
}

export interface DashboardResponse {
  total_balance: string;
  total_income: string;
  total_expense: string;
  income_this_month: string;
  expense_this_month: string;
  savings_this_month: string;
  monthly_trend: { month: string; income: string; expense: string }[];
  category_breakdown: { category: string; total: string; percentage: number }[];
}

export interface MonthlyAnalyticsItem {
  month: string;
  income: string;
  expense: string;
}

export interface CategoryAnalyticsItem {
  category: string;
  amount: string;
}

export interface DailySpendingItem {
  date: string;
  amount: string;
}

export interface TopExpenseItem {
  id: string;
  nameOfItem: string;
  category: string;
  amount: string;
  created_at: string;
}

export interface MonthlyComparisonResponse {
  current_month: string;
  previous_month: string;
  current_income: string;
  current_expense: string;
  previous_income: string;
  previous_expense: string;
  income_change_percentage: number;
  expense_change_percentage: number;
}

export type MessageRole = "user" | "assistant";

export interface AIMessage {
  id: string;
  role: MessageRole;
  content: string;
  created_at: string;
}