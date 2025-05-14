import { create } from 'zustand';

interface Transaction {
  id: string;
  student_name: string;
  amount: number;
  transaction_type: 'deposit' | 'withdrawal';
  payment_method: 'bank' | 'mobile';
  status: 'completed' | 'pending' | 'failed';
  created_at: string;
  bank_name?: string;
  account_number?: string;
  provider?: string;
  phone_number?: string;
}

interface TransactionsState {
  transactions: Transaction[];
  setTransactions: (transactions: Transaction[]) => void;
  addTransaction: (transaction: Transaction) => void;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  filterByMethod: (method: 'bank' | 'mobile' | 'all') => Transaction[];
  filterByStatus: (
    status: 'completed' | 'pending' | 'failed' | 'all'
  ) => Transaction[];
}

export const useTransactionsStore = create<TransactionsState>((set, get) => ({
  transactions: [],
  setTransactions: (transactions) => set({ transactions }),
  addTransaction: (transaction) =>
    set((state) => ({
      transactions: [...state.transactions, transaction]
    })),
  updateTransaction: (id, updatedTransaction) =>
    set((state) => ({
      transactions: state.transactions.map((t) =>
        t.id === id ? { ...t, ...updatedTransaction } : t
      )
    })),
  deleteTransaction: (id) =>
    set((state) => ({
      transactions: state.transactions.filter((t) => t.id !== id)
    })),
  filterByMethod: (method) => {
    const { transactions } = get();
    if (method === 'all') return transactions;
    return transactions.filter((t) => t.payment_method === method);
  },
  filterByStatus: (status) => {
    const { transactions } = get();
    if (status === 'all') return transactions;
    return transactions.filter((t) => t.status === status);
  }
}));
