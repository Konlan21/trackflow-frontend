import { useState, useEffect, useCallback } from "react";
import type { Income, Expenditure, ExpenditureCategory } from "../../types";
import * as incomeApi from "../../../api/income";
import * as expenditureApi from "../../../api/expenditure";

export function useDashboard() {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [expenditures, setExpenditures] = useState<Expenditure[]>([]);
  const [loading, setLoading] = useState(true);

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

  async function addExpense(nameOfItem: string, amount: number, category: ExpenditureCategory) {
    await expenditureApi.createExpenditure({ nameOfItem, amount, category });
    await fetchAll();
  }

  async function addIncome(nameOfRevenue: string, amount: number) {
    await incomeApi.createIncome({ nameOfRevenue, amount });
    await fetchAll();
  }

  async function removeTransaction(type: "income" | "expense", id: string) {
    if (type === "income") await incomeApi.deleteIncome(id);
    else await expenditureApi.deleteExpenditure(id);
    await fetchAll();
  }

  const totalIncome = incomes.reduce((sum, i) => sum + parseFloat(i.amount), 0);
  const totalExpense = expenditures.reduce((sum, e) => sum + parseFloat(e.amount), 0);
  const balance = totalIncome - totalExpense;

  return {
    incomes,
    expenditures,
    loading,
    totalIncome,
    totalExpense,
    balance,
    addExpense,
    addIncome,
    removeTransaction,
    refetch: fetchAll,
  };
}