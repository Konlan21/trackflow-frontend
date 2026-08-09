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
// ---------- Render ----------
return (
  <div className="min-h-screen flex flex-col justify-between w-full bg-slate-50/50">
    {/* Main Container - Spans Full Screen Width */}
    <main className="w-full px-4 sm:px-8 lg:px-12 pt-6 pb-12 space-y-8">
      
      {/* Header Action */}
      <div className="flex justify-between items-center border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Financial Overview</h1>
          <p className="text-sm text-slate-500 mt-0.5">Track income, expenses, and AI-driven insights in real time.</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all shadow-md hover:shadow-indigo-200"
        >
          <PlusCircle className="h-5 w-5" />
          <span>Add Transaction</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Balance Card */}
        <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-900 text-white p-6 rounded-2xl shadow-lg border border-indigo-500/20 relative overflow-hidden">
          <div className="flex justify-between items-center mb-4">
            <span className="text-indigo-100 text-sm font-medium tracking-wide">Total Balance</span>
            <div className="p-2.5 bg-white/10 backdrop-blur-md rounded-xl">
              <CreditCard className="h-5 w-5 text-indigo-100" />
            </div>
          </div>
          <div className="text-4xl font-extrabold mb-2 tracking-tight">${balance.toFixed(2)}</div>
          <span className="text-xs text-indigo-200 font-medium bg-white/10 px-2.5 py-1 rounded-full border border-white/10">
            Current Net Balance
          </span>
        </div>

        {/* Revenue Card */}
        <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-center mb-4">
            <span className="text-slate-500 text-sm font-medium">Total Revenue</span>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
              <ArrowDownLeft className="h-5 w-5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">+${totalIncome.toFixed(2)}</div>
          <span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200/60 font-semibold px-2.5 py-1 rounded-full">
            ▲ Income tracking
          </span>
        </div>

        {/* Expenditure Card */}
        <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-center mb-4">
            <span className="text-slate-500 text-sm font-medium">Total Expenditure</span>
            <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl">
              <ArrowUpRight className="h-5 w-5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">-${totalExpense.toFixed(2)}</div>
          <span className="text-xs text-rose-700 bg-rose-50 border border-rose-200/60 font-semibold px-2.5 py-1 rounded-full">
            ▼ Expenses tracking
          </span>
        </div>
      </div>

      {/* AI Insight Panel */}
      <section className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 rounded-2xl p-7 text-white shadow-2xl relative overflow-hidden border border-indigo-500/30">
        {/* Glow backdrop */}
        <div className="absolute -right-10 -top-10 w-72 h-72 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-10 -bottom-10 w-72 h-72 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-indigo-800/40 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-indigo-500/20 border border-indigo-400/30 rounded-xl text-indigo-300 shadow-inner">
              <Bot className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2.5 text-white">
                AI Smart Insights
                <span className="text-xs bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 px-2.5 py-0.5 rounded-full font-medium tracking-wide">
                  Real-time Analysis
                </span>
              </h2>
              <p className="text-sm text-indigo-200/80 mt-0.5">Automated audit of your income vs. expenditure patterns</p>
            </div>
          </div>

          <button
            onClick={fetchOverview}
            className="flex items-center justify-center gap-2 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-100 text-xs font-semibold px-4 py-2.5 rounded-xl border border-indigo-400/30 transition-all self-start sm:self-auto shadow-sm"
          >
            <RefreshCw className={`h-4 w-4 ${loadingOverview ? "animate-spin" : ""}`} />
            <span>Re-analyze Spending</span>
          </button>
        </div>

        {/* Overview Box */}
        <div className="pt-6 relative z-10">
          <div className="bg-slate-900/60 border border-indigo-800/50 p-4 rounded-xl text-sm leading-relaxed text-indigo-100 shadow-inner">
            {overview}
          </div>
        </div>

        {/* AI Prompt Input */}
        <div className="mt-6 pt-5 border-t border-indigo-800/40 relative z-10">
          <form onSubmit={handleAskAi} className="relative flex items-center">
            <Sparkles className="h-5 w-5 absolute left-3.5 text-indigo-400" />
            <input
              type="text"
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              placeholder="Ask AI advisor (e.g., 'How much can I spend on dining out this weekend?')"
              className="w-full bg-slate-950/80 border border-indigo-700/60 rounded-xl pl-11 pr-28 py-3 text-sm text-white placeholder-indigo-300/50 focus:outline-none focus:ring-2 focus:ring-indigo-400/80 transition-all shadow-inner"
            />
            <button
              type="submit"
              className="absolute right-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors shadow-sm"
            >
              Ask AI
            </button>
          </form>

          {showAiResponse && (
            <div className="mt-4 p-4 bg-indigo-950/90 border border-indigo-600/50 rounded-xl text-sm text-indigo-100 leading-relaxed shadow-lg">
              <span className="font-bold text-indigo-300 mr-2">AI Response:</span>
              <span>{aiResponse}</span>
            </div>
          )}
        </div>
      </section>

      {/* Transactions Table */}
      {loading ? (
        <div className="text-center text-slate-400 py-12 text-base font-medium">Loading transactions...</div>
      ) : (
        <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm overflow-hidden w-full">
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row gap-4 items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Recent Transactions</h2>
            <div className="relative flex-1 sm:w-80 w-full">
              <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search items..."
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/80 text-slate-500 uppercase text-xs font-bold tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Transaction</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-slate-400 text-sm">
                      No transactions found.
                    </td>
                  </tr>
                ) : (
                  rows.map((r) => (
                    <tr key={`${r.type}-${r.id}`} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 font-semibold text-slate-900 flex items-center gap-3">
                        <div
                          className={`p-2 rounded-xl ${
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
                        <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-full border border-slate-200/50">
                          {r.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500 font-medium">{new Date(r.date).toLocaleDateString()}</td>
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
                          className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
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

      {/* Add Transaction Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative">
            <h3 className="text-xl font-bold text-slate-900 mb-5">Add Transaction</h3>

            <div className="flex p-1 bg-slate-100 rounded-xl mb-5">
              <button
                type="button"
                onClick={() => setTxnType("expense")}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  txnType === "expense" ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Expenditure
              </button>
              <button
                type="button"
                onClick={() => setTxnType("income")}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  txnType === "income" ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Income
              </button>
            </div>

            <form className="space-y-4" onSubmit={handleFormSubmit}>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  {txnType === "expense" ? "Name of Item" : "Name of Revenue"}
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={txnType === "expense" ? "e.g. Groceries" : "e.g. Salary"}
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Amount ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {txnType === "expense" && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ExpenditureCategory)}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {formError && <p className="text-xs font-semibold text-rose-600 mt-1">{formError}</p>}

              <div className="flex justify-end gap-3 pt-5 mt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 disabled:opacity-60 shadow-md transition-colors"
                >
                  {saving ? "Saving..." : "Save Transaction"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>

    {/* Full Width Footer */}
    <footer className="w-full bg-white border-t border-slate-200/80 text-slate-500 text-sm">
      <div className="w-full px-4 sm:px-8 lg:px-12 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold text-slate-700">Financial Advisor AI</span>
          <span className="text-slate-400">|</span>
          <span className="text-slate-500 text-xs">System Active</span>
        </div>

        <div className="flex items-center gap-6 text-xs text-slate-500">
          <a href="#" className="hover:text-slate-900 transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-slate-900 transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-slate-900 transition-colors">Support</a>
        </div>

        <p className="text-xs text-slate-400">
          © {new Date().getFullYear()} Finance Dashboard. All rights reserved.
        </p>
      </div>
    </footer>
  </div>
);
}