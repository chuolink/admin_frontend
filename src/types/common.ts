export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
  page: number;
  limit: number;
  total_pages: number;
}

export interface ApiError {
  message: string;
  code: string;
  details?: Record<string, string[]>;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: 'success' | 'error';
}

export interface DateRange {
  start_date: string;
  end_date: string;
}

export interface SelectOption {
  label: string;
  value: string;
}

export interface FilterState {
  page: number;
  limit: number;
  search: string;
  [key: string]: any;
}
