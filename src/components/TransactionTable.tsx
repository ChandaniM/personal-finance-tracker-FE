import React from "react";
import type { Transaction } from "../types/types";

interface Props {
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  onDelete: (id: number) => void;
  isEditing: boolean; // new prop
}

const TransactionTable: React.FC<Props> = ({ transactions, setTransactions, onDelete, isEditing }) => {

  const handleDownloadCSV = () => {
    if (!transactions.length) return;
    const headers = ["Date", "Description", "Type", "Amount", "Tags"];
    const rows = transactions.map(t => [t.date, t.description ?? "", t.type, t.amount, t.tags ?? ""].join(","));
    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "transactions.csv"; a.click();
  };

  const handleDownloadJSON = () => {
    const blob = new Blob([JSON.stringify(transactions, null, 2)], { type: "application/json" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "transactions.json"; a.click();
  };

  const handleChange = (id: number, field: keyof Transaction, value: string | number) => {
    setTransactions(prev =>
      prev.map(tx => tx.id === id ? { ...tx, [field]: value } : tx)
    );
  };

  const total = transactions.reduce((sum, t) => t.type === "income" ? sum + t.amount : sum - t.amount, 0);

  return (
    <div className="list-card">
      <h2>Transactions</h2>
      <div className="actions">
        <button className="btn" onClick={handleDownloadCSV}>Download CSV</button>
        <button className="btn" onClick={handleDownloadJSON}>Download JSON</button>
      </div>

      {transactions.length === 0 ? <p className="muted">No transactions</p> :
        <table className="tx-table">
          <thead>
            <tr>
              <th>Date</th><th>Description</th><th>Type</th><th>Amount</th><th>Tags</th><th></th>
            </tr>
          </thead>
          <tbody>
            {transactions.map(tx => (
              <tr key={tx.id}>
<td>
  {isEditing ? (
    <input
      type="date"
      value={
        // Convert DD/MM/YY -> yyyy-mm-dd
        tx.date
          ? (() => {
              const parts = tx.date.split("/");
              if (parts.length === 3) {
                let [day, month, year] = parts;
                if (year.length === 2) year = "20" + year; // convert 25 -> 2025
                return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
              }
              return "";
            })()
          : ""
      }
      onChange={e => {
        // Convert yyyy-mm-dd back to DD/MM/YY
        const [year, month, day] = e.target.value.split("-");
        handleChange(tx.id, "date", `${day}/${month}/${year.slice(2)}`);
      }}
    />
  ) : (
    tx.date // display as DD/MM/YY
  )}
</td>


                <td>
                  {isEditing ?
                    <input type="text" value={tx.description ?? ""} onChange={e => handleChange(tx.id, "description", e.target.value)} />
                    : tx.description}
                </td>
                <td>
                  {isEditing ?
                    <select value={tx.type} onChange={e => handleChange(tx.id, "type", e.target.value as "income" | "expense")}>
                      <option value="expense">Expense</option>
                      <option value="income">Income</option>
                    </select>
                    : tx.type}
                </td>
                <td>
                  {isEditing ?
                    <input type="number" value={tx.amount} onChange={e => handleChange(tx.id, "amount", parseFloat(e.target.value) || 0)} />
                    : `₹${tx.amount.toFixed(2)}`}
                </td>
                <td>
                  {isEditing ?
                    <input type="text" value={tx.tags ?? ""} onChange={e => handleChange(tx.id, "tags", e.target.value)} />
                    : tx.tags}
                </td>
                <td>
                  {isEditing && <button className="btn small danger" onClick={() => onDelete(tx.id)}>Delete</button>}
                </td>
              </tr>
            ))}
            <tr>
              <td colSpan={3} style={{ textAlign: "right", fontWeight: "bold" }}>Total:</td>
              <td style={{ fontWeight: "bold" }}>₹{total.toFixed(2)}</td>
              <td colSpan={2}></td>
            </tr>
          </tbody>
        </table>
      }
    </div>
  );
};

export default TransactionTable;
