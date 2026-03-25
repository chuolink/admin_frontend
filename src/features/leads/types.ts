export type LeadSource =
  | 'SCHOOL_VISIT'
  | 'ONLINE'
  | 'OFFICE_VISIT'
  | 'SALES_CALL'
  | 'REFERRAL'
  | 'SOCIAL_MEDIA'
  | 'THIRD_PARTY'
  | 'APP';

export type LeadStatus =
  | 'NEW'
  | 'CONTACTED'
  | 'CONSULTATION_SCHEDULED'
  | 'CONSULTATION_DONE'
  | 'CONVERTED'
  | 'LOST';

export interface Lead {
  id: string;
  source: LeadSource;
  status: LeadStatus;
  student_name: string;
  parent_name: string;
  phone_number: string;
  email: string;
  notes: string;
  assigned_to: string | null;
  assigned_to_name?: string;
  converted_student: string | null;
  converted_student_name: string | null;
  converted_student_email: string | null;
  converted_student_phone: string | null;
  is_app_student: boolean;
  follow_up_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface LeadsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Lead[];
}

export const LEAD_SOURCE_OPTIONS: { label: string; value: LeadSource }[] = [
  { label: 'School Visit', value: 'SCHOOL_VISIT' },
  { label: 'Online', value: 'ONLINE' },
  { label: 'Office Visit', value: 'OFFICE_VISIT' },
  { label: 'Sales Call', value: 'SALES_CALL' },
  { label: 'Referral', value: 'REFERRAL' },
  { label: 'Social Media', value: 'SOCIAL_MEDIA' },
  { label: 'Third Party', value: 'THIRD_PARTY' },
  { label: 'App Student', value: 'APP' }
];

export const LEAD_STATUS_OPTIONS: { label: string; value: LeadStatus }[] = [
  { label: 'New', value: 'NEW' },
  { label: 'Contacted', value: 'CONTACTED' },
  { label: 'Consultation Scheduled', value: 'CONSULTATION_SCHEDULED' },
  { label: 'Consultation Done', value: 'CONSULTATION_DONE' },
  { label: 'Converted', value: 'CONVERTED' },
  { label: 'Lost', value: 'LOST' }
];
