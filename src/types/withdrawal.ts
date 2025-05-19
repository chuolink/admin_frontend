export interface Withdrawal {
  id: string;
  user: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  student?: {
    id: string;
    name: string;
    email: string;
    phone: string;
    created_at: string;
  };
  type: 'bank' | 'mobile' | 'balance';
  payment?: string;
  code?: string;
  receipt?: string;
  bank_name?: string;
  bank_account_name?: string;
  bank_account_number?: string;
  mno?: string;
  status: 'pending' | 'success' | 'failed';
  amount: number;
  created_at: string;
  updated_at: string;
}

export interface WithdrawalResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Withdrawal[];
}

export interface WithdrawalStats {
  total_withdrawals: number;
  total_amount: number;
  processing_withdrawals: number;
  success_withdrawals: number;
  failed_withdrawals: number;
}
