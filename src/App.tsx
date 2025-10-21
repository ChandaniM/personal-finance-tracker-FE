import React, { useState } from "react";
import TransactionForm from "./components/TransactionForm";
import TransactionTable from "./components/TransactionTable";
import type { Transaction } from "./types/types";
import * as XLSX from "xlsx";
import './styles.css';


const App: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isEditing, setIsEditing] = useState(false); // toggle edit mode

  const addTransaction = (tx: Omit<Transaction,"id">) => {
    setTransactions(prev => [...prev, { ...tx, id: Date.now() }]);
  };

  const deleteTransaction = (id: number) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const handleUploadExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json: any[] = XLSX.utils.sheet_to_json(sheet);

      const parseExcelDate = (value: any) => {
        let date: Date;
        if (!value) {
          date = new Date(); // fallback
        } else if (typeof value === "number") {
          date = new Date((value - 25569) * 86400 * 1000);
        } else {
          date = new Date(value);
        }
        if (isNaN(date.getTime())) date = new Date();
        return date.toISOString().slice(0, 10);
      };
  
      const imported: Transaction[] = json.map(row => {
        const dateString = row["Date"] ? String(row["Date"]) : "";
        const withdrawal = Number(row["Withdrawal Amt."]) || 0;
        const deposit = Number(row["Deposit Amt."]) || 0;
  
        return {
          id: Date.now() + Math.random(),
          date: dateString,
          description: row["Narration"] ?? "",
          type: withdrawal > 0 ? "expense" : "income",
          amount: withdrawal > 0 ? withdrawal : deposit,
          tags: ""
        };
      });
  
      setTransactions(prev => [...prev, ...imported]);
    };
  
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="container">
      <h1>💰 Personal Finance Tracker</h1>
      <TransactionForm onAdd={addTransaction} />
      <div style={{ marginTop: 20 }}>
        <input type="file" accept=".xlsx,.xls" onChange={handleUploadExcel} />
      </div>

      <div style={{ marginTop: 20 }}>
        <button className="btn primary" onClick={() => setIsEditing(!isEditing)}>
          {isEditing ? "Save" : "Edit"}
        </button>
      </div>

      <TransactionTable
        transactions={transactions}
        setTransactions={setTransactions}
        onDelete={deleteTransaction}
        isEditing={isEditing} // pass edit mode
      />
    </div>
  );
};

export default App;
