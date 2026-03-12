export type TaskType =
  | 'FOLLOW_UP_CALL'
  | 'DOCUMENT_REVIEW'
  | 'PAYMENT_FOLLOW_UP'
  | 'STAGE_ACTION'
  | 'CONSULTATION'
  | 'ESCORT'
  | 'GENERAL';

export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface StaffTask {
  id: string;
  task_type: TaskType;
  status: TaskStatus;
  title: string;
  description: string;
  assigned_to: number;
  assigned_to_name?: string;
  student: string | null;
  student_name?: string;
  pipeline: string | null;
  related_stage: string | null;
  due_date: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface StaffTasksResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: StaffTask[];
}

export const TASK_TYPE_OPTIONS: { label: string; value: TaskType }[] = [
  { label: 'Follow-up Call', value: 'FOLLOW_UP_CALL' },
  { label: 'Document Review', value: 'DOCUMENT_REVIEW' },
  { label: 'Payment Follow-up', value: 'PAYMENT_FOLLOW_UP' },
  { label: 'Stage Action', value: 'STAGE_ACTION' },
  { label: 'Consultation', value: 'CONSULTATION' },
  { label: 'Escort Student', value: 'ESCORT' },
  { label: 'General', value: 'GENERAL' }
];

export const TASK_STATUS_OPTIONS: { label: string; value: TaskStatus }[] = [
  { label: 'Pending', value: 'PENDING' },
  { label: 'In Progress', value: 'IN_PROGRESS' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Cancelled', value: 'CANCELLED' }
];
