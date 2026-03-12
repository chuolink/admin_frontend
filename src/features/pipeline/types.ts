export type PipelinePhase =
  | 'CONSULTATION'
  | 'PRE_APPLICATION'
  | 'POST_APPLICATION'
  | 'ORIENTATION'
  | 'DEPARTED'
  | 'MONITORING';

export type StageType =
  | 'DOCUMENT_COLLECTION'
  | 'COURSE_SELECTION'
  | 'UNIVERSITY_SELECTION'
  | 'APPLICATION_SUBMISSION'
  | 'OFFER_LETTER'
  | 'ADMISSION_CONFIRMATION'
  | 'PASSPORT_APPLICATION'
  | 'POLICE_CLEARANCE'
  | 'MEDICAL_EXAMINATION'
  | 'NOC_APPLICATION'
  | 'BANK_STATEMENT'
  | 'EMBASSY_BOOKING'
  | 'VISA_APPLICATION'
  | 'FLIGHT_BOOKING'
  | 'ORIENTATION_SEMINAR'
  | 'DEPARTURE';

export type StageStatus =
  | 'NOT_STARTED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'BLOCKED'
  | 'SKIPPED';

export type DocumentType =
  | 'FORM_FOUR_CERT'
  | 'FORM_SIX_CERT'
  | 'FORM_SIX_LEAVING_CERT'
  | 'RECOMMENDATION_LETTER'
  | 'BIRTH_CERT'
  | 'NIDA'
  | 'PASSPORT_PHOTO'
  | 'PARENT_ID'
  | 'PARENT_BIRTH_CERT'
  | 'AFFIDAVIT'
  | 'LOCAL_GOV_LETTER'
  | 'ADMISSION_LETTER'
  | 'OFFER_LETTER'
  | 'POLICE_CLEARANCE'
  | 'MEDICAL_CERT'
  | 'NOC_CERT'
  | 'BANK_STATEMENT'
  | 'VISA'
  | 'FLIGHT_TICKET'
  | 'OTHER';

export type DocumentStatus =
  | 'REQUIRED'
  | 'UPLOADED'
  | 'VERIFIED'
  | 'REJECTED'
  | 'NOT_APPLICABLE';

export interface PipelineStage {
  id: string;
  pipeline: string;
  stage_type: StageType;
  status: StageStatus;
  assigned_to: string | null;
  assigned_to_name?: string;
  started_at: string | null;
  completed_at: string | null;
  due_date: string | null;
  notes: string;
}

export interface DocumentRequirement {
  id: string;
  stage: string;
  document_type: DocumentType;
  status: DocumentStatus;
  document_file: string | null;
  verified_by: string | null;
  rejection_reason: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface StudentPipeline {
  id: string;
  student: string;
  student_name?: string;
  current_phase: PipelinePhase;
  assigned_staff: string | null;
  assigned_staff_name?: string;
  /** @deprecated Use assigned_staff_name — kept for backward compat */
  consultant_name?: string;
  assigned_admission_manager: string | null;
  started_at: string;
  completed_at: string | null;
  notes: string;
  stages: PipelineStage[];
  university_name?: string;
  country_name?: string;
}

export interface PipelinesResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: StudentPipeline[];
}

export const PIPELINE_STAGES: {
  key: StageType;
  label: string;
  phase: 'pre' | 'post';
  number: number;
}[] = [
  {
    key: 'DOCUMENT_COLLECTION',
    label: 'Document Collection',
    phase: 'pre',
    number: 1
  },
  {
    key: 'COURSE_SELECTION',
    label: 'Course Selection',
    phase: 'pre',
    number: 2
  },
  {
    key: 'UNIVERSITY_SELECTION',
    label: 'University Selection',
    phase: 'pre',
    number: 3
  },
  {
    key: 'APPLICATION_SUBMISSION',
    label: 'Application Submission',
    phase: 'pre',
    number: 4
  },
  { key: 'OFFER_LETTER', label: 'Offer Letter', phase: 'pre', number: 5 },
  {
    key: 'ADMISSION_CONFIRMATION',
    label: 'Admission Confirmation',
    phase: 'pre',
    number: 6
  },
  {
    key: 'PASSPORT_APPLICATION',
    label: 'Passport Application',
    phase: 'pre',
    number: 7
  },
  {
    key: 'POLICE_CLEARANCE',
    label: 'Police Clearance',
    phase: 'post',
    number: 8
  },
  {
    key: 'MEDICAL_EXAMINATION',
    label: 'Medical Examination',
    phase: 'post',
    number: 9
  },
  {
    key: 'NOC_APPLICATION',
    label: 'NOC Application',
    phase: 'post',
    number: 10
  },
  { key: 'BANK_STATEMENT', label: 'Bank Statement', phase: 'post', number: 11 },
  {
    key: 'EMBASSY_BOOKING',
    label: 'Embassy Booking',
    phase: 'post',
    number: 12
  },
  {
    key: 'VISA_APPLICATION',
    label: 'Visa Application',
    phase: 'post',
    number: 13
  },
  { key: 'FLIGHT_BOOKING', label: 'Flight Booking', phase: 'post', number: 14 },
  {
    key: 'ORIENTATION_SEMINAR',
    label: 'Orientation Seminar',
    phase: 'post',
    number: 15
  },
  { key: 'DEPARTURE', label: 'Departure', phase: 'post', number: 16 }
];

export type JourneyEventType =
  | 'STAGE_STARTED'
  | 'STAGE_COMPLETED'
  | 'STAGE_BLOCKED'
  | 'DOCUMENT_UPLOADED'
  | 'DOCUMENT_VERIFIED'
  | 'DOCUMENT_REJECTED'
  | 'PAYMENT_RECEIVED'
  | 'NOTE_ADDED'
  | 'CALL_LOGGED'
  | 'CONSULTATION_COMPLETED'
  | 'ASSIGNMENT_CHANGED'
  | 'PHASE_CHANGED'
  | 'OTHER';

export interface JourneyEvent {
  id: string;
  student: string;
  pipeline: string;
  event_type: JourneyEventType;
  title: string;
  description: string;
  performed_by: string | null;
  performed_by_name?: string;
  student_name?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface JourneyEventsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: JourneyEvent[];
}

export interface PipelinePayment {
  id: string;
  pipeline: string;
  payment_type: string;
  status: 'PENDING' | 'PAID' | 'OVERDUE';
  amount: string;
  currency: 'TZS' | 'USD';
  transaction_id: string;
  payment_date: string | null;
  notes: string;
  created_at: string;
  updated_at: string;
}

export const PAYMENT_TYPE_OPTIONS = [
  { label: 'Admission Fee', value: 'ADMISSION_FEE' },
  { label: 'Passport Fee', value: 'PASSPORT_FEE' },
  { label: 'Police Clearance Fee', value: 'POLICE_CLEARANCE_FEE' },
  { label: 'Medical Fee', value: 'MEDICAL_FEE' },
  { label: 'NOC Fee', value: 'NOC_FEE' },
  { label: 'Embassy Fee', value: 'EMBASSY_FEE' },
  { label: 'Flight Fee', value: 'FLIGHT_FEE' },
  { label: 'Service Fee', value: 'SERVICE_FEE' },
  { label: 'Other', value: 'OTHER' }
];

export const STAGE_STATUS_COLOR: Record<StageStatus, string> = {
  NOT_STARTED: 'bg-muted text-muted-foreground',
  IN_PROGRESS: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  COMPLETED:
    'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  BLOCKED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  SKIPPED:
    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
};
