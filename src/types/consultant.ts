export interface Consultant {
  id: string;
  user: {
    id: string;
    email: string;
    first_name: string;
    middle_name: string | null;
    last_name: string;
    gender: string;
    phone_number: string | null;
    profile_img: string | null;
    birth_date: string;
    is_active: boolean;
    subscription: string | null;
    is_registered: boolean;
    created_at: string;
    updated_at: string;
  };
  is_active: boolean;
  payment_type: 'MOBILE' | 'BANK';
  payment_name: string;
  payment_account_name: string;
  earnings: number;
  payment_account_number: string;
  created_at: string;
  updated_at: string;
}

export interface ConsultantApplication {
  id: string;
  consultant: string;
  application: {
    id: string;
    app_id: string;
    student: {
      id: string;
      user: {
        id: string;
        email: string;
        first_name: string;
        middle_name: string | null;
        last_name: string;
        gender: string;
        phone_number: string | null;
        profile_img: string | null;
        birth_date: string;
        is_active: boolean;
        subscription: string;
        is_registered: boolean;
        created_at: string;
        updated_at: string;
      };
      profile_complete: number;
      passport: string;
      reg_prog: number;
      email: string;
      maritial_status: string | null;
      location: string | null;
      disability: string | null;
      education_level: string;
      about_us: string;
      preffered_service: string;
      created_at: string;
      updated_at: string;
    };
    university: {
      id: string;
      name: string;
      category: string;
      institution_type: string;
      scholarship: string;
      code: string | null;
      website_link: string;
      img_url: string | null;
      video: string | null;
      admission_link: string | null;
      capacity: number | null;
      description: string | null;
      no_of_students: number;
      slug: string;
      created_at: string;
      updated_at: string;
    };
    courses: Array<{
      id: string;
      name: string;
      duration: number;
      slug: string;
    }>;
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'REVOKED';
    budget: number | null;
    created_at: string;
    updated_at: string;
  };
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'WAITING' | 'COMPLETED';
  created_at: string;
  updated_at: string;
  paid_fee?: boolean;
}

export interface ConsultantWithdrawal {
  id: string;
  consultant: Consultant;
  amount: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  created_at: string;
  updated_at: string;
}

export interface ConsultantStats {
  total_applications: number;
  pending_applications: number;
  approved_applications: number;
  rejected_applications: number;
  waiting_applications: number;
  completed_applications: number;
  total_earnings: number;
  total_withdrawals: number;
  recent_applications: ConsultantApplication[];
  recent_withdrawals: ConsultantWithdrawal[];
}

export interface Response<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
