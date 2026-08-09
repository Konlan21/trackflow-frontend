import { useState, useEffect, useCallback } from "react";
import {
  PlusCircle, CreditCard, ArrowDownLeft, ArrowUpRight, Search, Trash2,
  Bot, RefreshCw, Sparkles,
} from "lucide-react";
import * as incomeApi from "../../api/income";
import * as expenditureApi from "../../api/expenditure";
import { getAiInsight } from "../../api/dashboard";
import { extractErrorMessage } from "../../api/client";
import type { Income, Expenditure, ExpenditureCategory } from "../../types/types";

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

export default function Dashboard() {
  // ---------- Data state ----------
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [expenditures, setExpenditures] = useState<Expenditure[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [inc, exp] = await Promise.all([incomeApi.listIncomes(), expenditureApi.listExpenditures()]);
      setIncomes(inc);
      setExpenditures(exp);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  async function handleDeleteTransaction(type: "income" | "expense", id: string) {
    if (!confirm("Delete this transaction?")) return;
    if (type === "income") await incomeApi.deleteIncome(id);
    else await expenditureApi.deleteExpenditure(id);
    await fetchAll();
  }

  const totalIncome = incomes.reduce((sum, i) => sum + parseFloat(i.amount), 0);
  const totalExpense = expenditures.reduce((sum, e) => sum + parseFloat(e.amount), 0);
  const balance = totalIncome - totalExpense;

  let rows = [
    ...incomes.map((i) => ({
      id: i.id, type: "income" as const, name: i.nameOfRevenue,
      category: "Income", amount: i.amount, date: i.created_at,
    })),
    ...expenditures.map((e) => ({
      id: e.id, type: "expense" as const, name: e.nameOfItem,
      category: e.category, amount: e.amount, date: e.created_at,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (search) {
    rows = rows.filter((r) => r.name.toLowerCase().includes(search.toLowerCase()));
  }

  // ---------- Add Transaction modal state ----------
  const [modalOpen, setModalOpen] = useState(false);
  const [txnType, setTxnType] = useState<"expense" | "income">("expense");
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<ExpenditureCategory>("OTHER");
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  function resetForm() {
    setName("");
    setAmount("");
    setCategory("OTHER");
    setFormError("");
    setTxnType("expense");
  }

  function closeModal() {
    setModalOpen(false);
    resetForm();
  }

  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    setSaving(true);
    try {
      const amt = parseFloat(amount);
      if (txnType === "expense") {
        await expenditureApi.createExpenditure({ nameOfItem: name, amount: amt, category });
      } else {
        await incomeApi.createIncome({ nameOfRevenue: name, amount: amt });
      }
      closeModal();
      await fetchAll();
    } catch (err) {
      setFormError(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  // ---------- AI Insight panel state ----------
  const [overview, setOverview] = useState(
    'Click "Re-analyze Spending" to get an AI-generated summary of your finances.'
  );
  const [loadingOverview, setLoadingOverview] = useState(false);
  const [aiQuery, setAiQuery] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [showAiResponse, setShowAiResponse] = useState(false);

  async function fetchOverview() {
    setLoadingOverview(true);
    setOverview("Analyzing your transactions...");
    try {
      const data = await getAiInsight("Give me a brief overview of my financial health and one quick tip.");
      setOverview(data.insight || "No insight available yet — add a few transactions first.");
    } catch {
      setOverview("Could not reach AI advisor. Try again shortly.");
    } finally {
      setLoadingOverview(false);
    }
  }

  async function handleAskAi(e: React.FormEvent) {
    e.preventDefault();
    if (!aiQuery.trim()) return;
    setShowAiResponse(true);
    setAiResponse("Thinking...");
    const q = aiQuery;
    setAiQuery("");
    try {
      const data = await getAiInsight(q);
      setAiResponse(data.insight || "No response from AI advisor.");
    } catch {
      setAiResponse("Could not reach AI advisor. Try again shortly.");
    }
  }

  // ---------- Render ----------
  return (
    <div className="space-y-8">
      <div className="flex justify-end">
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Add Transaction</span>
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 text-white p-6 rounded-2xl shadow-md">
          <div className="flex justify-between items-center mb-4">
            <span className="text-indigo-200 text-sm font-medium">Total Balance</span>
            <div className="p-2 bg-indigo-500/30 rounded-lg">
              <CreditCard className="h-5 w-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold mb-1">${balance.toFixed(2)}</div>
          <span className="text-xs text-indigo-200">Current Net Balance</span>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <span className="text-slate-500 text-sm font-medium">Total Revenue</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <ArrowDownLeft className="h-5 w-5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-900 mb-1">+${totalIncome.toFixed(2)}</div>
          <span className="text-xs text-emerald-600 font-semibold">▲ Income tracking</span>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <span className="text-slate-500 text-sm font-medium">Total Expenditure</span>
            <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
              <ArrowUpRight className="h-5 w-5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-900 mb-1">-${totalExpense.toFixed(2)}</div>
          <span className="text-xs text-rose-600 font-semibold">▼ Expenses tracking</span>
        </div>
      </div>

      {/* AI Insight panel */}
      <section className="bg-gradient-to-r from-violet-900 via-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden border border-indigo-700/50">
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-indigo-800/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/20 border border-indigo-400/30 rounded-xl text-indigo-300">
              <Bot className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2">
                AI Smart Insights
                <span className="text-xs bg-indigo-500/30 text-indigo-300 border border-indigo-400/20 px-2 py-0.5 rounded-full font-normal">
                  Real-time Analysis
                </span>
              </h2>
              <p className="text-xs text-indigo-200/80">Automated audit of your income vs. expenditure patterns</p>
            </div>
          </div>

          <button
            onClick={fetchOverview}
            className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-indigo-100 text-xs font-semibold px-3 py-2 rounded-lg border border-white/10 transition-colors self-start sm:self-auto"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loadingOverview ? "animate-spin" : ""}`} />
            <span>Re-analyze Spending</span>
          </button>
        </div>

        <div className="pt-6">
          <div className="bg-white/5 border border-white/10 p-3.5 rounded-xl text-xs text-indigo-100">{overview}</div>
        </div>

        <div className="mt-6 pt-4 border-t border-indigo-800/60">
          <form onSubmit={handleAskAi} className="relative flex items-center">
            <Sparkles className="h-4 w-4 absolute left-3 text-indigo-300" />
            <input
              type="text"
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              placeholder="Ask AI advisor (e.g., 'How much can I spend on dining out this weekend?')"
              className="w-full bg-slate-950/50 border border-indigo-700/50 rounded-xl pl-9 pr-24 py-2.5 text-xs text-white placeholder-indigo-300/60 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            <button
              type="submit"
              className="absolute right-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
            >
              Ask AI
            </button>
          </form>
          {showAiResponse && (
            <div className="mt-3 p-3 bg-indigo-950/80 border border-indigo-600/50 rounded-lg text-xs text-indigo-100">
              <span className="font-bold text-indigo-300">AI Response: </span>
              <span>{aiResponse}</span>
            </div>
          )}
        </div>
      </section>

      {/* Transactions table */}
      {loading ? (
        <div className="text-center text-slate-400 py-8 text-sm">Loading transactions...</div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row gap-4 items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800">Recent Transactions</h2>
            <div className="relative flex-1 sm:w-64 w-full">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search items..."
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-semibold tracking-wider">
                <tr>
                  <th className="px-6 py-3">Transaction</th>
                  <th className="px-6 py-3">Category</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Amount</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-400 text-sm">
                      No transactions found.
                    </td>
                  </tr>
                ) : (
                  rows.map((r) => (
                    <tr key={`${r.type}-${r.id}`} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900 flex items-center gap-3">
                        <div
                          className={`p-2 rounded-lg ${
                            r.type === "income" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                          }`}
                        >
                          {r.type === "income" ? (
                            <ArrowDownLeft className="h-4 w-4" />
                          ) : (
                            <ArrowUpRight className="h-4 w-4" />
                          )}
                        </div>
                        {r.name}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-semibold rounded-full">
                          {r.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500">{new Date(r.date).toLocaleDateString()}</td>
                      <td
                        className={`px-6 py-4 font-bold ${
                          r.type === "income" ? "text-emerald-600" : "text-slate-900"
                        }`}
                      >
                        {r.type === "income" ? "+" : "-"}${parseFloat(r.amount).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDeleteTransaction(r.type, r.id)}
                          className="text-slate-400 hover:text-rose-600 p-1"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Transaction modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100 relative">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Add Transaction</h3>

            <div className="flex p-1 bg-slate-100 rounded-xl mb-4">
              <button
                type="button"
                onClick={() => setTxnType("expense")}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  txnType === "expense" ? "bg-white shadow-sm text-slate-900" : "text-slate-500"
                }`}
              >
                Expenditure
              </button>
              <button
                type="button"
                onClick={() => setTxnType("income")}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  txnType === "income" ? "bg-white shadow-sm text-slate-900" : "text-slate-500"
                }`}
              >
                Income
              </button>
            </div>

            <form className="space-y-4" onSubmit={handleFormSubmit}>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  {txnType === "expense" ? "Name of Item" : "Name of Revenue"}
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={txnType === "expense" ? "e.g. Groceries" : "e.g. Salary"}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {txnType === "expense" && (
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
              )}

              {formError && <p className="text-xs text-rose-600">{formError}</p>}

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-60 shadow-sm transition-colors"
                >
                  {saving ? "Saving..." : "Save Transaction"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}