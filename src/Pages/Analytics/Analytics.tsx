import { useState, useEffect } from "react";
import { Download, FileText, TrendingUp, TrendingDown } from "lucide-react";
import * as analyticsApi from "../../api/analytics";
import * as exportsApi from "../../api/exports";
import type {
  MonthlyAnalyticsItem,
  CategoryAnalyticsItem,
  DailySpendingItem,
  TopExpenseItem,
  MonthlyComparisonResponse,
} from "../../types/types";

export default function Analytics() {
  const [monthly, setMonthly] = useState<MonthlyAnalyticsItem[]>([]);
  const [categories, setCategories] = useState<CategoryAnalyticsItem[]>([]);
  const [daily, setDaily] = useState<DailySpendingItem[]>([]);
  const [topExpenses, setTopExpenses] = useState<TopExpenseItem[]>([]);
  const [comparison, setComparison] = useState<MonthlyComparisonResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState<"csv" | "pdf" | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [m, c, d, t, comp] = await Promise.all([
          analyticsApi.getMonthlyTrend(),
          analyticsApi.getCategoryBreakdown(),
          analyticsApi.getDailySpending(),
          analyticsApi.getTopExpenses(),
          analyticsApi.getComparison(),
        ]);
        setMonthly(m);
        setCategories(c);
        setDaily(d);
        setTopExpenses(t);
        setComparison(comp);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function handleExport(type: "csv" | "pdf") {
    setExporting(type);
    try {
      if (type === "csv") await exportsApi.exportCsv();
      else await exportsApi.exportPdf();
    } finally {
      setExporting(null);
    }
  }

  const maxMonthlyValue = Math.max(1, ...monthly.flatMap((m) => [parseFloat(m.income), parseFloat(m.expense)]));
  const maxCategoryAmount = Math.max(1, ...categories.map((c) => parseFloat(c.amount)));
  const maxDailyAmount = Math.max(1, ...daily.map((d) => parseFloat(d.amount)));

  if (loading) {
    return <div className="text-center text-slate-400 py-8 text-sm">Loading analytics...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
          <p className="text-sm text-slate-500">Deeper insight into your spending patterns</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleExport("csv")}
            disabled={exporting !== null}
            className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm disabled:opacity-60"
          >
            <Download className="h-4 w-4" />
            {exporting === "csv" ? "Exporting..." : "CSV"}
          </button>
          <button
            onClick={() => handleExport("pdf")}
            disabled={exporting !== null}
            className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm disabled:opacity-60"
          >
            <FileText className="h-4 w-4" />
            {exporting === "pdf" ? "Exporting..." : "PDF Report"}
          </button>
        </div>
      </div>

      {/* Month-over-month comparison */}
      {comparison && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-500">Income: {comparison.current_month}</span>
              {comparison.income_change_percentage >= 0 ? (
                <TrendingUp className="h-4 w-4 text-emerald-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-rose-600" />
              )}
            </div>
            <div className="text-2xl font-bold text-slate-900">${parseFloat(comparison.current_income).toFixed(2)}</div>
            <p className={`text-xs font-semibold mt-1 ${comparison.income_change_percentage >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
              {comparison.income_change_percentage >= 0 ? "+" : ""}
              {comparison.income_change_percentage}% vs {comparison.previous_month}
            </p>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-500">Expenses: {comparison.current_month}</span>
              {comparison.expense_change_percentage <= 0 ? (
                <TrendingDown className="h-4 w-4 text-emerald-600" />
              ) : (
                <TrendingUp className="h-4 w-4 text-rose-600" />
              )}
            </div>
            <div className="text-2xl font-bold text-slate-900">${parseFloat(comparison.current_expense).toFixed(2)}</div>
            <p className={`text-xs font-semibold mt-1 ${comparison.expense_change_percentage <= 0 ? "text-emerald-600" : "text-rose-600"}`}>
              {comparison.expense_change_percentage >= 0 ? "+" : ""}
              {comparison.expense_change_percentage}% vs {comparison.previous_month}
            </p>
          </div>
        </div>
      )}

      {/* Monthly trend */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-800 mb-6">Monthly Trend (6 months)</h2>
        <div className="flex items-end justify-between gap-3 h-48">
          {monthly.map((m) => (
            <div key={m.month} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full flex items-end justify-center gap-1 h-40">
                <div
                  className="w-1/2 bg-emerald-400 rounded-t-md"
                  style={{ height: `${(parseFloat(m.income) / maxMonthlyValue) * 100}%` }}
                  title={`Income: $${m.income}`}
                />
                <div
                  className="w-1/2 bg-rose-400 rounded-t-md"
                  style={{ height: `${(parseFloat(m.expense) / maxMonthlyValue) * 100}%` }}
                  title={`Expense: $${m.expense}`}
                />
              </div>
              <span className="text-xs text-slate-500 font-medium">{m.month}</span>
            </div>
          ))}
        </div>
        <div className="flex gap-4 mt-4 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> Income
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400" /> Expense
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category breakdown */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Category Breakdown</h2>
          <div className="space-y-3">
            {categories.length === 0 ? (
              <p className="text-sm text-slate-400">No expense data yet.</p>
            ) : (
              categories.map((c) => (
                <div key={c.category}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-slate-600">{c.category}</span>
                    <span className="text-slate-500">${parseFloat(c.amount).toFixed(2)}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 rounded-full"
                      style={{ width: `${(parseFloat(c.amount) / maxCategoryAmount) * 100}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top expenses */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Top Expenses</h2>
          <div className="space-y-3">
            {topExpenses.length === 0 ? (
              <p className="text-sm text-slate-400">No expenses recorded yet.</p>
            ) : (
              topExpenses.map((e) => (
                <div key={e.id} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium text-slate-800">{e.nameOfItem}</p>
                    <p className="text-xs text-slate-400">{e.category} · {new Date(e.created_at).toLocaleDateString()}</p>
                  </div>
                  <span className="font-bold text-slate-900">${parseFloat(e.amount).toFixed(2)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Daily spending */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-800 mb-6">Daily Spending (This Month)</h2>
        {daily.length === 0 ? (
          <p className="text-sm text-slate-400">No spending recorded this month.</p>
        ) : (
          <div className="flex items-end gap-1 h-32 overflow-x-auto">
            {daily.map((d) => (
              <div
                key={d.date}
                className="flex-1 min-w-[6px] bg-indigo-500 rounded-t-sm"
                style={{ height: `${(parseFloat(d.amount) / maxDailyAmount) * 100}%` }}
                title={`${d.date}: $${d.amount}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}