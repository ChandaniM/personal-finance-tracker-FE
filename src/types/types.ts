export interface Transaction {
    id: number;
    date: string;
    description?: string;
    type: "income" | "expense";
    amount: number;
    tags?: string; 
  }
  