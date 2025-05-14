import { PaginatedResponse } from './common';

export type StudentStatus = 'active' | 'inactive' | 'suspended';
export type StudentLevel = 'beginner' | 'intermediate' | 'advanced';

export interface Student {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  status: StudentStatus;
  level: StudentLevel;
  created_at: string;
  updated_at: string;
  profile_picture?: string;
  bio?: string;
  address?: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other';
  nationality?: string;
  emergency_contact?: {
    name: string;
    relationship: string;
    phone_number: string;
  };
}

export interface StudentFilters {
  page?: number;
  limit?: number;
  status?: StudentStatus | 'all';
  level?: StudentLevel | 'all';
  search?: string;
}

export interface StudentStats {
  total_students: number;
  active_students: number;
  inactive_students: number;
  suspended_students: number;
  students_by_level: {
    beginner: number;
    intermediate: number;
    advanced: number;
  };
}

export interface StudentResponse extends PaginatedResponse<Student> {}
