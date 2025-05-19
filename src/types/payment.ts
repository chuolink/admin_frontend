export interface Payment {
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
  amount: number;
  name: string;
  app_id?: string;
  exp_id?: string;
  description?: string;
  mode: 'bank' | 'mobile' | 'balance';
  status:
    | 'pending'
    | 'processing'
    | 'success'
    | 'failed'
    | 'cancelled'
    | 'refunded';
  bulk_id?: string;
  created_at: string;
  updated_at: string;
}

export interface PaymentResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Payment[];
}

export interface PaymentStats {
  total_payments: number;
  total_amount: number;
  pending_payments: number;
  processing_payments: number;
  success_payments: number;
  failed_payments: number;
  cancelled_payments: number;
  refunded_payments: number;
}
