export interface Application {
  id: string;
  app_id: string;
  student: {
    id: string;
    name: string;
    email: string;
    phone: string;
    created_at: string;
  };

  university: {
    id: string;
    name: string;
  };
  courses: Array<{
    id: string;
    name: string;
  }>;
  admission_letter: {
    id: string;
    url: string;
    created_at: string;
  } | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'REVOKED';
  budget: number | null;
  info: string | null;
  is_sent: boolean;
  when: string | null;
  created_at: string;
  updated_at: string;
  credentials_data: any | null;
  documents: any[] | null;
  fees: any[];
  information: any[];
  progress: any | null;
}

export interface ApplicationInfo {
  id: string;
  info: string;
  created_at: string;
}
export interface ApplicationDocument {
  id: string;
  url: string;
  created_at: string;
}

export interface ApplicationResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Application[];
}
