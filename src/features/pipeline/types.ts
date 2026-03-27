// =============================================================================
// Flow Types — LOCAL (Tanzania) vs ABROAD (International)
// =============================================================================

export type FlowType = 'LOCAL' | 'ABROAD';

// =============================================================================
// Flexible Stage Instance Types (new unified pipeline)
// =============================================================================

export type StageInstanceType =
  | 'PAYMENT'
  | 'DOCUMENT_UPLOAD'
  | 'SCHEDULE'
  | 'INFO'
  | 'PHYSICAL_VISIT'
  | 'APPROVAL';

export type StageInstanceStatus =
  | 'PENDING'
  | 'ACTIVE'
  | 'COMPLETED'
  | 'SKIPPED'
  | 'BLOCKED';

export type RequirementResponseType =
  | 'DOCUMENT'
  | 'MULTI_FILE'
  | 'IMAGE'
  | 'MULTI_IMAGE'
  | 'TEXT'
  | 'TEXTAREA'
  | 'NUMBER'
  | 'DATE'
  | 'SELECT'
  | 'SCHEDULE'
  | 'INFO';

export type RequirementStatus =
  | 'PENDING'
  | 'SUBMITTED'
  | 'APPROVED'
  | 'REJECTED';

export type ResponseStatus = 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED';

export interface RequirementResponse {
  id: string;
  requirement: string;
  submitted_by: string | null;
  submitted_by_name?: string;
  text_response?: string;
  file_response?: string | null;
  file_response_url?: string | null;
  schedule_response?: string | null;
  status?: ResponseStatus;
  reviewed_by: string | null;
  reviewed_by_name?: string;
  reviewed_at: string | null;
  review_notes?: string;
  created_at: string;
}

export interface StageRequirement {
  id: string;
  stage_instance: string;
  from_template?: boolean;
  response_type: RequirementResponseType;
  title: string;
  description?: string;
  is_required?: boolean;
  status?: RequirementStatus;
  accepted_file_types?: string[];
  scheduled_date?: string | null;
  scheduled_location?: string;
  added_by?: string | null;
  added_by_name?: string;
  reviewed_by?: string | null;
  reviewed_by_name?: string;
  reviewed_at?: string | null;
  requires_review?: boolean;
  owner?: 'student' | 'staff';
  rejection_reason?: string;
  order?: number;
  responses: RequirementResponse[];
  latest_response?: RequirementResponse | null;
  created_at: string;
  updated_at: string;
}

export interface RequirementsSummary {
  total: number;
  approved: number;
  submitted: number;
  rejected: number;
  pending: number;
}

export interface StageInstance {
  id: string;
  application: string;
  pipeline?: string | null;
  template?: string | null;
  stage_order: number;
  stage_name: string;
  stage_type: StageInstanceType;
  description?: string;
  is_required?: boolean;
  status?: StageInstanceStatus;
  due_date?: string | null;
  data?: unknown;
  document_types?: unknown;
  payment_amount?: string | null;
  payment_currency?: string;
  scheduled_date?: string | null;
  completed_at?: string | null;
  completed_by?: string | null;
  completed_by_name?: string;
  assigned_to?: string | null;
  assigned_to_name?: string;
  notes?: string;
  linked_fees?: Array<{ pattern: string; required: boolean; label: string }>;
  payment_required_to_progress?: boolean;
  requirements: StageRequirement[];
  requirements_summary?: RequirementsSummary;
  created_at: string;
  updated_at: string;
}

// =============================================================================
// Pipeline Phase & Legacy Stage Types (kept for backward compat)
// =============================================================================

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

export interface DocumentRequirement {
  id: string;
  stage: string;
  document_type: DocumentType;
  status: DocumentStatus;
  document_file: string | null;
  document_file_url?: string | null;
  verified_by: string | null;
  verified_by_name?: string;
  rejection_reason: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface PipelineStage {
  id: string;
  pipeline: string;
  application?: string | null;
  stage_type: StageType;
  status: StageStatus;
  assigned_to: string | null;
  assigned_to_name?: string;
  documents?: DocumentRequirement[];
  started_at: string | null;
  completed_at: string | null;
  due_date: string | null;
  notes: string;
  created_at?: string;
  updated_at?: string;
}

export interface RelatedPipeline {
  id: string;
  application: string | null;
  flow_type?: FlowType;
  current_phase: PipelinePhase;
  is_committed: boolean;
  university_name?: string;
  country_name?: string;
  completed_stages?: number;
  total_stages?: number;
  created_at?: string;
}

// =============================================================================
// Main Pipeline Interface (unified)
// =============================================================================

export interface StudentPipeline {
  id: string;
  student: string;
  student_name?: string;
  application?: string | null;
  app_id?: string | null;
  flow_type?: FlowType;
  current_phase: PipelinePhase;
  is_committed: boolean;
  assigned_consultant: string | null;
  assigned_admission_manager: string | null;
  consultant_name?: string;
  university_name?: string;
  country_name?: string;
  completed_stages?: number;
  total_stages?: number;
  active_stage?: { stage_type: StageType; label: string } | null;
  has_blocked?: boolean;
  started_at: string;
  completed_at: string | null;
  notes: string;
  // Legacy rigid stages
  stages?: PipelineStage[];
  // New flexible stage instances with requirements
  stage_instances?: StageInstance[];
  related_pipelines?: RelatedPipeline[];
  payments?: PipelinePayment[];
  created_at?: string;
  updated_at?: string;
}

export interface PipelinesResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: StudentPipeline[];
}

// =============================================================================
// Constants — kept for backward compat, but stages are now dynamic
// =============================================================================

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

// =============================================================================
// Journey Events
// =============================================================================

export type JourneyEventType =
  | 'CALL'
  | 'CONSULTATION'
  | 'EMAIL_SENT'
  | 'SMS_SENT'
  | 'STAGE_STARTED'
  | 'STAGE_COMPLETED'
  | 'STAGE_BLOCKED'
  | 'PHASE_CHANGED'
  | 'DOCUMENT_UPLOADED'
  | 'DOCUMENT_VERIFIED'
  | 'DOCUMENT_REJECTED'
  | 'APPLICATION_CREATED'
  | 'APPLICATION_SUBMITTED'
  | 'APPLICATION_ACCEPTED'
  | 'APPLICATION_REJECTED'
  | 'OFFER_RECEIVED'
  | 'ADMISSION_CONFIRMED'
  | 'PAYMENT_CREATED'
  | 'PAYMENT_COMPLETED'
  | 'ESCORT'
  | 'MEETING'
  | 'ORIENTATION'
  | 'DEPARTURE'
  | 'NOTE'
  | 'TASK_ASSIGNED'
  | 'REQUIREMENT_SUBMITTED'
  | 'REQUIREMENT_APPROVED'
  | 'REQUIREMENT_REJECTED'
  | 'REQUIREMENT_ADDED'
  | 'OTHER';

export type JourneyEventPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

export interface JourneyEvent {
  id: string;
  student: string;
  pipeline: string | null;
  event_type: JourneyEventType;
  priority?: JourneyEventPriority;
  title: string;
  description: string;
  performed_by: string | null;
  performed_by_name?: string;
  student_name?: string;
  related_stage?: string | null;
  related_application?: string | null;
  related_call?: string | null;
  related_consultation?: string | null;
  related_document?: string | null;
  related_stage_instance?: string | null;
  related_requirement?: string | null;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface JourneyEventsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: JourneyEvent[];
}

// =============================================================================
// Pipeline Payments
// =============================================================================

export type PipelinePaymentType =
  | 'ADMISSION_FEE'
  | 'PASSPORT_FEE'
  | 'POLICE_CLEARANCE_FEE'
  | 'MEDICAL_FEE'
  | 'NOC_FEE'
  | 'EMBASSY_FEE'
  | 'FLIGHT_FEE'
  | 'SERVICE_FEE'
  | 'OTHER';

export interface PipelinePayment {
  id: string;
  pipeline: string;
  payment_type: PipelinePaymentType;
  amount: string;
  currency: 'TZS' | 'USD';
  status: 'PENDING' | 'PAID' | 'OVERDUE';
  due_date: string | null;
  paid_at: string | null;
  payment: string | null;
  created_at: string;
  updated_at: string;
}

export const PAYMENT_TYPE_OPTIONS: {
  label: string;
  value: PipelinePaymentType;
}[] = [
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

// =============================================================================
// Display Constants
// =============================================================================

export const PIPELINE_PHASES: { key: PipelinePhase; label: string }[] = [
  { key: 'CONSULTATION', label: 'Consultation' },
  { key: 'PRE_APPLICATION', label: 'Pre-Application' },
  { key: 'POST_APPLICATION', label: 'Post-Application' },
  { key: 'ORIENTATION', label: 'Orientation' },
  { key: 'DEPARTED', label: 'Departed' },
  { key: 'MONITORING', label: 'Monitoring' }
];

export const PHASE_COLORS: Record<PipelinePhase, string> = {
  CONSULTATION:
    'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-300',
  PRE_APPLICATION:
    'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  POST_APPLICATION:
    'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  ORIENTATION:
    'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
  DEPARTED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  MONITORING: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
};

export const STAGE_STATUS_COLOR: Record<StageStatus, string> = {
  NOT_STARTED: 'bg-muted text-muted-foreground',
  IN_PROGRESS: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  COMPLETED:
    'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  BLOCKED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  SKIPPED:
    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
};

export const STAGE_INSTANCE_STATUS_COLOR: Record<StageInstanceStatus, string> =
  {
    PENDING: 'bg-muted text-muted-foreground',
    ACTIVE: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    COMPLETED:
      'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    BLOCKED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    SKIPPED:
      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
  };

export const REQUIREMENT_STATUS_COLOR: Record<RequirementStatus, string> = {
  PENDING: 'bg-muted text-muted-foreground',
  SUBMITTED: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  APPROVED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  REJECTED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
};

export const FLOW_TYPE_COLOR: Record<FlowType, string> = {
  LOCAL:
    'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300',
  ABROAD:
    'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300'
};

export const STAGE_TYPE_ICON_MAP: Record<StageInstanceType, string> = {
  PAYMENT: 'CreditCard',
  DOCUMENT_UPLOAD: 'FileUp',
  SCHEDULE: 'Calendar',
  INFO: 'Info',
  PHYSICAL_VISIT: 'MapPin',
  APPROVAL: 'CheckCircle'
};
