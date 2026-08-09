import { useState, useEffect, useCallback } from "react";
import { PlusCircle, Trash2, PiggyBank } from "lucide-react";
import * as budgetsApi from "../../api/budgets";
import { extractErrorMessage } from "../../api/client";
import type { Budget, BudgetSummary, ExpenditureCategory } from "../../types/types";

const CATEGORIES: { value: ExpenditureCategory; label: string }[] = [
  { value: "FOOD", label: "Food & Groceries" },
  { value: "TRANSPORT", label: "Transport" },
  { value: "RENT", label: "Rent" },
  { value: "UTILITIES", label: "Utilities" },
  { value: "ENTERTAINMENT", label: "Entertainment" },
  { value: "HEALTHCARE", label: "Healthcare" },
  { value: "EDUCATION", label: "Education" },
  { value: "OTHER", label: "Other" },
];

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function Budgets() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [summary, setSummary] = useState<BudgetSummary>({});
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const now = new Date();
  const [category, setCategory] = useState<ExpenditureCategory>("FOOD");
  const [limit, setLimit] = useState("");
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [b, s] = await Promise.all([budgetsApi.listBudgets(), budgetsApi.getBudgetSummary()]);
      setBudgets(b);
      setSummary(s);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await budgetsApi.createBudget({ category, monthly_limit: parseFloat(limit), month, year });
      setLimit("");
      setModalOpen(false);
      await fetchAll();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this budget?")) return;
    await budgetsApi.deleteBudget(id);
    await fetchAll();
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Budgets</h1>
          <p className="text-sm text-slate-500">Track spending limits by category</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm"
        >
          <PlusCircle className="h-4 w-4" />
          <span>New Budget</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center text-slate-400 py-8 text-sm">Loading budgets...</div>
      ) : budgets.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center">
          <PiggyBank className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">No budgets yet — create one to start tracking limits.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {budgets.map((b) => {
            const s = summary[b.category];
            const pct = s ? Math.min(s.percentage, 100) : 0;
            const isOver = s ? s.percentage >= 100 : false;
            return (
              <div key={b.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-semibold rounded-full">
                      {b.category}
                    </span>
                    <p className="text-xs text-slate-400 mt-1">
                      {MONTH_NAMES[b.month - 1]} {b.year}
                    </p>
                  </div>
                  <button onClick={() => handleDelete(b.id)} className="text-slate-400 hover:text-rose-600 p-1">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex justify-between items-baseline mb-2">
                  <span className="text-lg font-bold text-slate-900">
                    ${(s?.spent ?? 0).toFixed(2)}
                  </span>
                  <span className="text-xs text-slate-500">of ${parseFloat(b.monthly_limit).toFixed(2)}</span>
                </div>

                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-2">
                  <div
                    className={`h-full rounded-full transition-all ${isOver ? "bg-rose-500" : "bg-indigo-600"}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <p className={`text-xs font-semibold ${isOver ? "text-rose-600" : "text-emerald-600"}`}>
                  {isOver
                    ? `Over by $${Math.abs(s?.remaining ?? 0).toFixed(2)}`
                    : `$${(s?.remaining ?? parseFloat(b.monthly_limit)).toFixed(2)} remaining`}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100">
            <h3 className="text-xl font-bold text-slate-900 mb-4">New Budget</h3>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ExpenditureCategory)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Monthly Limit ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={limit}
                  onChange={(e) => setLimit(e.target.value)}
                  placeholder="0.00"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Month</label>
                  <select
                    value={month}
                    onChange={(e) => setMonth(parseInt(e.target.value))}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {MONTH_NAMES.map((m, idx) => (
                      <option key={m} value={idx + 1}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Year</label>
                  <input
                    type="number"
                    value={year}
                    onChange={(e) => setYear(parseInt(e.target.value))}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {error && <p className="text-xs text-rose-600">{error}</p>}

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-60 shadow-sm transition-colors"
                >
                  {saving ? "Saving..." : "Create Budget"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}