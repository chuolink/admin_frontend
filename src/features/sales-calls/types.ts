export type CallType = 'OUTBOUND' | 'INBOUND';

export type CallPurpose =
  | 'LEAD_FOLLOW_UP'
  | 'CONSULTATION'
  | 'PARENT_FOLLOW_UP'
  | 'DOCUMENT_REMINDER'
  | 'PAYMENT_REMINDER'
  | 'GENERAL';

export type CallOutcome =
  | 'ANSWERED'
  | 'NO_ANSWER'
  | 'BUSY'
  | 'CALLBACK_REQUESTED'
  | 'VOICEMAIL';

export interface SalesCall {
  id: string;
  lead: string | null;
  student: string | null;
  caller: string;
  caller_name?: string;
  call_type: CallType;
  purpose: CallPurpose;
  outcome: CallOutcome;
  duration_minutes: number;
  notes: string;
  follow_up_required: boolean;
  follow_up_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface SalesCallsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: SalesCall[];
}

export const CALL_PURPOSE_OPTIONS: { label: string; value: CallPurpose }[] = [
  { label: 'Lead Follow-up', value: 'LEAD_FOLLOW_UP' },
  { label: 'Consultation', value: 'CONSULTATION' },
  { label: 'Parent Follow-up', value: 'PARENT_FOLLOW_UP' },
  { label: 'Document Reminder', value: 'DOCUMENT_REMINDER' },
  { label: 'Payment Reminder', value: 'PAYMENT_REMINDER' },
  { label: 'General', value: 'GENERAL' }
];

export const CALL_OUTCOME_OPTIONS: { label: string; value: CallOutcome }[] = [
  { label: 'Answered', value: 'ANSWERED' },
  { label: 'No Answer', value: 'NO_ANSWER' },
  { label: 'Busy', value: 'BUSY' },
  { label: 'Callback Requested', value: 'CALLBACK_REQUESTED' },
  { label: 'Voicemail', value: 'VOICEMAIL' }
];
