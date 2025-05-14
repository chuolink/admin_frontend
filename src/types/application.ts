import { DateRange } from './common';

export type ApplicationStatus = 'pending' | 'approved' | 'rejected';

export interface Application {
  id: string;
  student_name: string;
  student_email: string;
  student_phone: string;
  course_name: string;
  status: ApplicationStatus;
  created_at: string;
  additional_info: string;
  notes?: string;
  university_id: string;
  course_id: string;
}

export interface ApplicationFilters {
  status: string;
  university: string;
  course: string;
  search: string;
  dateRange: DateRange | null;
  ordering: string;
  page: number;
  pageSize: number;
}

export interface ApplicationStats {
  total_applications: number;
  pending_applications: number;
  approved_applications: number;
  rejected_applications: number;
}

export interface ApplicationResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Application[];
}

export interface University {
  id: string;
  name: string;
  code?: string;
}

export interface Course {
  id: string;
  name: string;
  code?: string;
  university_id: string;
}

export interface ApplicationDetailsProps {
  application: Application;
}

export interface ApplicationFiltersProps {
  filters: ApplicationFilters;
  onChange: (filters: ApplicationFilters) => void;
  universities: University[];
  courses: Course[];
}

export interface ApplicationActionsProps {
  applicationId: string;
  status: ApplicationStatus;
  onSuccess: () => void;
}
