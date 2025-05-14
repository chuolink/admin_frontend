import { User } from './user';

export interface AdminUser extends User {
  full_name: string;
  subscription_status:
    | 'Free Trial'
    | 'Not Registered'
    | 'Basic'
    | 'Premium'
    | 'No Subscription';
  total_referrals: number;
  total_earnings: number;
  total_withdrawals: number;
  last_activity: string;
  is_free_trial: boolean;
  notes?: string;
}

export interface AdminUserFilters {
  is_active: string;
  subscription_status: string;
  min_referrals: string;
  last_activity: string;
  search: string;
  ordering: string;
  page: number;
  pageSize: number;
}

export interface AdminUserStats {
  total_users: number;
  active_users: number;
  free_trial_users: number;
  premium_users: number;
  total_referrals: number;
}

export interface AdminUserResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: AdminUser[];
}

export interface UserDetailsProps {
  user: AdminUser;
  onUpdate: () => void;
}

export interface UserFiltersProps {
  filters: AdminUserFilters;
  onChange: (filters: AdminUserFilters) => void;
}
