import React, { useState } from "react";
import TransactionForm from "./components/TransactionForm";
import TransactionTable from "./components/TransactionTable";
import type { Transaction } from "./types/types";
import * as XLSX from "xlsx";
import './styles.css';


const App: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const addTransaction = (tx: Omit<Transaction,"id">) => {
    setTransactions(prev=>[...prev,{...tx,id:Date.now()}]);
  };

  const deleteTransaction = (id: number) => {
    setTransactions(prev=>prev.filter(t=>t.id!==id));
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
  
      const imported: Transaction[] = json.map(row => {
        const dateValue = row["Date"];
        const dateString = dateValue
          ? (dateValue instanceof Date ? dateValue.toISOString().slice(0,10) : new Date(dateValue).toISOString().slice(0,10))
          : new Date().toISOString().slice(0,10);
  
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
      <div style={{marginTop:20}}>
        <input type="file" accept=".xlsx,.xls" onChange={handleUploadExcel} />
      </div>
      <TransactionTable transactions={transactions} setTransactions={setTransactions} onDelete={deleteTransaction} />
    </div>
  );
};

export default App;
