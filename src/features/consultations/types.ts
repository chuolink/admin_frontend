export type ConsultationType = 'IN_PERSON' | 'PHONE' | 'VIDEO';

export type ConsultationStatus =
  | 'SCHEDULED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW';

export type ConsultationOutcome =
  | 'INTERESTED'
  | 'NEEDS_TIME'
  | 'NOT_INTERESTED'
  | 'READY_TO_APPLY'
  | 'FOLLOW_UP_NEEDED';

export interface Consultation {
  id: string;
  lead: string | null;
  student: string | null;
  consultant: string;
  consultant_name?: string;
  lead_name?: string;
  student_name?: string;
  consultation_type: ConsultationType;
  status: ConsultationStatus;
  scheduled_at: string;
  completed_at: string | null;
  summary: string;
  recommended_courses: string;
  recommended_universities: string;
  parent_contacted: boolean;
  outcome: ConsultationOutcome | null;
  created_at: string;
  updated_at: string;
}

export interface ConsultationsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Consultation[];
}

export const CONSULTATION_TYPE_OPTIONS: {
  label: string;
  value: ConsultationType;
}[] = [
  { label: 'In Person', value: 'IN_PERSON' },
  { label: 'Phone', value: 'PHONE' },
  { label: 'Video', value: 'VIDEO' }
];

export const CONSULTATION_STATUS_OPTIONS: {
  label: string;
  value: ConsultationStatus;
}[] = [
  { label: 'Scheduled', value: 'SCHEDULED' },
  { label: 'In Progress', value: 'IN_PROGRESS' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Cancelled', value: 'CANCELLED' },
  { label: 'No Show', value: 'NO_SHOW' }
];

export const CONSULTATION_OUTCOME_OPTIONS: {
  label: string;
  value: ConsultationOutcome;
}[] = [
  { label: 'Interested', value: 'INTERESTED' },
  { label: 'Needs More Time', value: 'NEEDS_TIME' },
  { label: 'Follow-up Needed', value: 'FOLLOW_UP_NEEDED' },
  { label: 'Ready to Apply', value: 'READY_TO_APPLY' },
  { label: 'Not Interested', value: 'NOT_INTERESTED' }
];
