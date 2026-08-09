import { useState, useEffect, useCallback } from "react";
import { PlusCircle, Trash2, Target, CheckCircle2 } from "lucide-react";
import * as goalsApi from "../../api/goals";
import { extractErrorMessage } from "../../api/client";
import type { Goal } from "../../types/types";

export default function Goals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [target, setTarget] = useState("");
  const [current, setCurrent] = useState("0");
  const [deadline, setDeadline] = useState("");

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      setGoals(await goalsApi.listGoals());
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
      await goalsApi.createGoal({
        title,
        target_amount: parseFloat(target),
        current_amount: parseFloat(current || "0"),
        deadline: deadline || null,
      });
      setTitle("");
      setTarget("");
      setCurrent("0");
      setDeadline("");
      setModalOpen(false);
      await fetchAll();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this goal?")) return;
    await goalsApi.deleteGoal(id);
    await fetchAll();
  }

  async function handleAddProgress(goal: Goal) {
    const amountStr = prompt(`Add how much progress to "${goal.title}"?`);
    if (!amountStr) return;
    const addAmount = parseFloat(amountStr);
    if (isNaN(addAmount) || addAmount <= 0) return;
    const newCurrent = parseFloat(goal.current_amount) + addAmount;
    await goalsApi.updateGoal(goal.id, { current_amount: newCurrent });
    await fetchAll();
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Goals</h1>
          <p className="text-sm text-slate-500">Save toward what matters</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm"
        >
          <PlusCircle className="h-4 w-4" />
          <span>New Goal</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center text-slate-400 py-8 text-sm">Loading goals...</div>
      ) : goals.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center">
          <Target className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">No goals yet — set one to start saving with purpose.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {goals.map((g) => {
            const targetAmt = parseFloat(g.target_amount);
            const currentAmt = parseFloat(g.current_amount);
            const pct = Math.min((currentAmt / targetAmt) * 100, 100);
            const isCompleted = g.status === "COMPLETED";

            return (
              <div key={g.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {isCompleted && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                    <h3 className="font-bold text-slate-900">{g.title}</h3>
                  </div>
                  <button onClick={() => handleDelete(g.id)} className="text-slate-400 hover:text-rose-600 p-1">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {g.deadline && (
                  <p className="text-xs text-slate-400 mb-3">
                    Target date: {new Date(g.deadline).toLocaleDateString()}
                  </p>
                )}

                <div className="flex justify-between items-baseline mb-2">
                  <span className="text-lg font-bold text-slate-900">${currentAmt.toFixed(2)}</span>
                  <span className="text-xs text-slate-500">of ${targetAmt.toFixed(2)}</span>
                </div>

                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-3">
                  <div
                    className={`h-full rounded-full transition-all ${isCompleted ? "bg-emerald-500" : "bg-indigo-600"}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                {!isCompleted && (
                  <button
                    onClick={() => handleAddProgress(g)}
                    className="w-full text-xs font-semibold text-indigo-600 hover:text-indigo-700 border border-indigo-200 hover:bg-indigo-50 rounded-lg py-1.5 transition-colors"
                  >
                    Add Progress
                  </button>
                )}
                {isCompleted && (
                  <p className="text-xs font-semibold text-emerald-600 text-center">Goal reached! 🎉</p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100">
            <h3 className="text-xl font-bold text-slate-900 mb-4">New Goal</h3>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. New Laptop"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Target Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  required
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  placeholder="0.00"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Starting Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={current}
                  onChange={(e) => setCurrent(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Deadline (optional)</label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
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
                  {saving ? "Saving..." : "Create Goal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}