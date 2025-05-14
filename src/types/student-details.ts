// Student Details Type
export interface Student {
  id: string;
  user: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    phone_number?: string;
    date_joined: string;
    last_login: string | null;
    is_active: boolean;
  };
  user_name: string;
  user_email: string;
  education_level: string | null;
  reg_prog: number;
  maritial_status: string | null;
  about_us: string | null;
  balance: number;
  earnings: number;
  nida_no: string | null;
  preffered_service: string | null;
  created_at: string;
  updated_at: string;
  referral_count: number;
  subscription: {
    status: string;
    type: string;
    expires_at: string | null;
    subscription_details: {
      name: string;
      description: string;
      duration: string;
      amount: number;
    } | null;
  };
  payments?: {
    total_amount: number;
    total_count: number;
    recent_payments: any[];
  };
  bank_transactions?: {
    total_amount: number;
    total_count: number;
    recent_transactions: any[];
  };
  mobile_transactions?: {
    total_amount: number;
    total_count: number;
    recent_transactions: any[];
  };
  profile_complete?: number;
  no_favs?: number;
  no_abroad_apps?: number;
  no_notifs?: number;
  no_payments?: number;
  total_referrals?: number;
  referral_code?: string;
  referred?: {
    id: number;
    claimed: boolean;
    discount: number;
    amount: number;
  } | null;
  total_earnings?: number;
}

// Students List Response
export interface StudentsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Student[];
}

// Admin Dashboard Types
export interface DashboardStats {
  total_revenue: number;
  total_students: number;
  new_users: number;
  pending_payments: number;
  pending_withdrawals: number;
  active_applications: number;
  total_referrals: number;
  user_growth: Array<{
    month: string;
    users: number;
  }>;
  revenue_trend: Array<{
    month: string;
    revenue: number;
  }>;
  payment_distribution: Array<{
    status: string;
    count: number;
  }>;
  withdrawal_distribution: Array<{
    status: string;
    count: number;
  }>;
  application_distribution: Array<{
    status: string;
    count: number;
  }>;
  daily_transactions: Array<{
    date: string;
    count: number;
  }>;
}
