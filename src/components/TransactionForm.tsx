import React, { useState } from "react";
import type { Transaction } from "../types/types";

interface Props {
  onAdd: (tx: Omit<Transaction, "id">) => void;
}

const TransactionForm: React.FC<Props> = ({ onAdd }) => {
  const [form, setForm] = useState<Omit<Transaction, "id">>({
    date: new Date().toISOString().slice(0, 10),
    description: "",
    type: "expense",
    amount: 0,
    tags: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((f) => ({
      ...f,
      [name]: name === "amount" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.amount <= 0) return alert("Amount must be > 0");
    onAdd(form);
    setForm({ date: new Date().toISOString().slice(0, 10), description: "", type: "expense", amount: 0, tags: "" });
  };

  return (
    <form className="form-card" onSubmit={handleSubmit}>
      <div className="row">
        <label>
          Date
          <input type="date" name="date" value={form.date} onChange={handleChange} />
        </label>
        <label>
          Type
          <select name="type" value={form.type} onChange={handleChange}>
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </label>
      </div>

      <div className="row">
        <label>
          Amount
          <input type="number" name="amount" step="0.01" value={form.amount} onChange={handleChange} />
        </label>
        <label>
          Description (optional)
          <input type="text" name="description" value={form.description} onChange={handleChange} />
        </label>
        <label>
          Tags (optional)
          <input type="text" name="tags" value={form.tags} onChange={handleChange} />
        </label>
      </div>

      <button type="submit" className="btn primary">Add Transaction</button>
    </form>
  );
};

export default TransactionForm;
