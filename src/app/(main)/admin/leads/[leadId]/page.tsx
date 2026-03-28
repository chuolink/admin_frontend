// @ts-nocheck
'use client';

import { useState } from 'react';
import { useQueryState } from 'nuqs';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useClientApi from '@/lib/axios/clientSide';
import PageContainer from '@/components/layout/page-container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import {
  ArrowLeft,
  Phone,
  CalendarPlus,
  MessageSquarePlus,
  User,
  Mail,
  Clock,
  CheckCircle,
  PhoneOutgoing,
  PhoneIncoming,
  Calendar,
  GraduationCap,
  Link2,
  Kanban,
  ExternalLink,
  Unlink,
  MapPin,
  Hash,
  StickyNote,
  Activity,
  CircleDot,
  XCircle,
  FileText as FileTextIcon,
  ArrowRight,
  DollarSign,
  Loader2,
  Upload,
  Pencil
} from 'lucide-react';
import {
  type Lead,
  type LeadStatus,
  LEAD_SOURCE_OPTIONS,
  LEAD_STATUS_OPTIONS
} from '@/features/leads/types';
import {
  type SalesCall,
  type CallType,
  type CallPurpose,
  type CallOutcome,
  CALL_PURPOSE_OPTIONS,
  CALL_OUTCOME_OPTIONS
} from '@/features/sales-calls/types';
import {
  type Consultation,
  type ConsultationType,
  type ConsultationOutcome,
  CONSULTATION_TYPE_OPTIONS,
  CONSULTATION_OUTCOME_OPTIONS
} from '@/features/consultations/types';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { format, formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import {
  StudentPicker,
  type StudentSearchResult
} from '@/components/student-picker';
import {
  UniversityPicker,
  CoursePicker,
  type PickerItem
} from '@/components/entity-multi-picker';

interface TimelineItem {
  id: string;
  type: 'call' | 'consultation' | 'note';
  title: string;
  description: string;
  date: string;
  icon: React.ReactNode;
  iconBg: string;
  meta?: Record<string, string>;
}

const statusSteps: {
  value: LeadStatus;
  label: string;
  icon: React.ReactNode;
}[] = [
  {
    value: 'NEW',
    label: 'New',
    icon: <CircleDot className='h-3.5 w-3.5' />
  },
  {
    value: 'CONTACTED',
    label: 'Contacted',
    icon: <Phone className='h-3.5 w-3.5' />
  },
  {
    value: 'CONSULTATION_SCHEDULED',
    label: 'Scheduled',
    icon: <Calendar className='h-3.5 w-3.5' />
  },
  {
    value: 'CONSULTATION_DONE',
    label: 'Consulted',
    icon: <CheckCircle className='h-3.5 w-3.5' />
  },
  {
    value: 'CONVERTED',
    label: 'Converted',
    icon: <GraduationCap className='h-3.5 w-3.5' />
  }
];

export default function LeadDetailPage() {
  const params = useParams<{ leadId: string }>();
  const router = useRouter();
  const { api } = useClientApi();
  const queryClient = useQueryClient();
  const [callDialogOpen, setCallDialogOpen] = useState(false);
  const [consultationDialogOpen, setConsultationDialogOpen] = useState(false);
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [tab, setTab] = useQueryState('tab', { defaultValue: 'activity' });
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [linkStudent, setLinkStudent] = useState<StudentSearchResult | null>(
    null
  );
  const [createAppDialogOpen, setCreateAppDialogOpen] = useState(false);
  const [appUniversity, setAppUniversity] = useState<PickerItem[]>([]);
  const [appCourses, setAppCourses] = useState<PickerItem[]>([]);

  const [callForm, setCallForm] = useState({
    call_type: 'OUTBOUND' as CallType,
    purpose: 'LEAD_FOLLOW_UP' as CallPurpose,
    outcome: 'ANSWERED' as CallOutcome,
    duration_minutes: 5,
    notes: '',
    follow_up_required: false,
    follow_up_date: ''
  });

  const [consultForm, setConsultForm] = useState({
    consultation_type: 'IN_PERSON' as ConsultationType,
    scheduled_at: '',
    summary: '',
    outcome: '' as ConsultationOutcome | ''
  });
  const [selectedCourses, setSelectedCourses] = useState<PickerItem[]>([]);
  const [selectedUniversities, setSelectedUniversities] = useState<
    PickerItem[]
  >([]);

  const { data: lead, isLoading } = useQuery<Lead>({
    queryKey: ['lead', params.leadId],
    queryFn: async () => {
      if (!api) throw new Error('API not initialized');
      const response = await api.get(`/admin/leads/${params.leadId}/`);
      return response.data;
    },
    enabled: !!api && !!params.leadId
  });

  const { data: callsData } = useQuery<{ results: SalesCall[] }>({
    queryKey: ['lead-calls', params.leadId],
    queryFn: async () => {
      if (!api) throw new Error('API not initialized');
      const response = await api.get(
        `/admin/sales-calls/?lead=${params.leadId}`
      );
      return response.data;
    },
    enabled: !!api && !!params.leadId
  });

  const { data: consultsData } = useQuery<{ results: Consultation[] }>({
    queryKey: ['lead-consultations', params.leadId],
    queryFn: async () => {
      if (!api) throw new Error('API not initialized');
      const response = await api.get(
        `/admin/consultations/?lead=${params.leadId}`
      );
      return response.data;
    },
    enabled: !!api && !!params.leadId
  });

  // Fetch linked student's applications
  const [appsPage, setAppsPage] = useState(1);
  const APPS_PER_PAGE = 5;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: studentAppsData } = useQuery<{ results: any[]; count: number }>(
    {
      queryKey: ['student-applications', lead?.converted_student],
      queryFn: async () => {
        if (!api) throw new Error('API not initialized');
        const response = await api.get('/admin/applications/', {
          params: { student: lead?.converted_student, page_size: 100 }
        });
        return response.data;
      },
      enabled: !!api && !!lead?.converted_student
    }
  );

  // Fetch linked student's pipelines
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: studentPipelinesData } = useQuery<{ results: any[] }>({
    queryKey: ['student-pipelines', lead?.converted_student],
    queryFn: async () => {
      if (!api) throw new Error('API not initialized');
      const response = await api.get('/admin/pipelines/', {
        params: { student: lead?.converted_student, page_size: 10 }
      });
      return response.data;
    },
    enabled: !!api && !!lead?.converted_student
  });

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ['lead', params.leadId] });
    queryClient.invalidateQueries({ queryKey: ['lead-calls', params.leadId] });
    queryClient.invalidateQueries({
      queryKey: ['lead-consultations', params.leadId]
    });
    queryClient.invalidateQueries({ queryKey: ['leads'] });
    queryClient.invalidateQueries({
      queryKey: ['student-applications', lead?.converted_student]
    });
    queryClient.invalidateQueries({
      queryKey: ['student-pipelines', lead?.converted_student]
    });
  };

  const updateStatus = useMutation({
    mutationFn: async (status: LeadStatus) => {
      if (!api) throw new Error('API not initialized');
      const response = await api.patch(`/admin/leads/${params.leadId}/`, {
        status
      });
      return response.data;
    },
    onSuccess: () => {
      invalidateAll();
      toast.success('Status updated');
    },
    onError: () => toast.error('Failed to update status')
  });

  const logCall = useMutation({
    mutationFn: async (data: typeof callForm) => {
      if (!api) throw new Error('API not initialized');
      const response = await api.post('/admin/sales-calls/', {
        ...data,
        lead: params.leadId,
        follow_up_date: data.follow_up_date || null
      });
      return response.data;
    },
    onSuccess: () => {
      invalidateAll();
      setCallDialogOpen(false);
      setCallForm({
        call_type: 'OUTBOUND',
        purpose: 'LEAD_FOLLOW_UP',
        outcome: 'ANSWERED',
        duration_minutes: 5,
        notes: '',
        follow_up_required: false,
        follow_up_date: ''
      });
      toast.success('Call logged');
    },
    onError: () => toast.error('Failed to log call')
  });

  const scheduleConsultation = useMutation({
    mutationFn: async (data: typeof consultForm) => {
      if (!api) throw new Error('API not initialized');
      const payload: Record<string, unknown> = {
        ...data,
        lead: params.leadId,
        recommended_courses: selectedCourses.map((c) => c.name).join(', '),
        recommended_universities: selectedUniversities
          .map((u) => u.name)
          .join(', ')
      };
      if (!payload.outcome) delete payload.outcome;
      const response = await api.post('/admin/consultations/', payload);
      return response.data;
    },
    onSuccess: () => {
      invalidateAll();
      setConsultationDialogOpen(false);
      setConsultForm({
        consultation_type: 'IN_PERSON',
        scheduled_at: '',
        summary: '',
        outcome: ''
      });
      setSelectedCourses([]);
      setSelectedUniversities([]);
      toast.success('Consultation scheduled');
    },
    onError: () => toast.error('Failed to schedule consultation')
  });

  const updateNotes = useMutation({
    mutationFn: async (notes: string) => {
      if (!api) throw new Error('API not initialized');
      const currentNotes = lead?.notes ?? '';
      const timestamp = format(new Date(), 'MMM d, yyyy HH:mm');
      const newNotes = currentNotes
        ? `${currentNotes}\n\n[${timestamp}] ${notes}`
        : `[${timestamp}] ${notes}`;
      const response = await api.patch(`/admin/leads/${params.leadId}/`, {
        notes: newNotes
      });
      return response.data;
    },
    onSuccess: () => {
      invalidateAll();
      setNoteDialogOpen(false);
      setNoteText('');
      toast.success('Note added');
    },
    onError: () => toast.error('Failed to add note')
  });

  const createApplicationMutation = useMutation({
    mutationFn: async ({
      universityId,
      courseIds
    }: {
      universityId: string;
      courseIds: string[];
    }) => {
      if (!api) throw new Error('API not initialized');
      const response = await api.post(
        `/admin/leads/${params.leadId}/create-application/`,
        { university_id: universityId, course_ids: courseIds }
      );
      return response.data;
    },
    onSuccess: (data) => {
      invalidateAll();
      setCreateAppDialogOpen(false);
      setAppUniversity([]);
      setAppCourses([]);
      if (data.type === 'draft') {
        toast.success(
          'Draft application saved. Will be converted when student account is linked.'
        );
      } else {
        toast.success('Application created. Awaiting admission fee payment.');
      }
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (err: any) => {
      toast.error(err?.response?.data?.error || 'Failed to create application');
    }
  });

  const registerStudentMutation = useMutation({
    mutationFn: async () => {
      if (!api) throw new Error('API not initialized');
      const response = await api.post(
        `/admin/leads/${params.leadId}/register-student/`
      );
      return response.data;
    },
    onSuccess: (data) => {
      invalidateAll();
      if (data.created) {
        toast.success('Student account created and linked');
      } else {
        toast.success('Existing student found and linked');
      }
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (err: any) => {
      toast.error(err?.response?.data?.error || 'Failed to register student');
    }
  });

  const linkStudentMutation = useMutation({
    mutationFn: async (studentId: string) => {
      if (!api) throw new Error('API not initialized');
      const response = await api.post(
        `/admin/leads/${params.leadId}/link-student/`,
        { student_id: studentId }
      );
      return response.data;
    },
    onSuccess: () => {
      invalidateAll();
      setLinkDialogOpen(false);
      setLinkStudent(null);
      toast.success('Student linked successfully');
    },
    onError: () => toast.error('Failed to link student')
  });

  const unlinkStudentMutation = useMutation({
    mutationFn: async () => {
      if (!api) throw new Error('API not initialized');
      const response = await api.post(
        `/admin/leads/${params.leadId}/unlink-student/`
      );
      return response.data;
    },
    onSuccess: () => {
      invalidateAll();
      toast.success('Student unlinked');
    },
    onError: () => toast.error('Failed to unlink student')
  });

  // Declare payment state
  const [declarePaymentDialogOpen, setDeclarePaymentDialogOpen] =
    useState(false);
  const [declarePaymentAppId, setDeclarePaymentAppId] = useState('');
  const [declarePaymentFiles, setDeclarePaymentFiles] = useState<File[]>([]);
  const [declarePaymentExistingProofs, setDeclarePaymentExistingProofs] =
    useState<Array<{ id: string; file_name: string; file_url: string | null }>>(
      []
    );
  const [declarePaymentForm, setDeclarePaymentForm] = useState({
    payment_name: 'Admission Fee',
    mode: 'cash',
    notes: ''
  });

  const declarePaymentMutation = useMutation({
    mutationFn: async (data: {
      application_id: string;
      payment_name: string;
      mode: string;
      notes: string;
      files: File[];
    }) => {
      if (!api) throw new Error('API not initialized');
      const formData = new FormData();
      formData.append('application_id', data.application_id);
      formData.append('payment_name', data.payment_name);
      formData.append('mode', data.mode);
      formData.append('notes', data.notes);
      data.files.forEach((f) => formData.append('proofs', f));
      const response = await api.post(
        `/admin/leads/${params.leadId}/declare-payment/`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      return response.data;
    },
    onSuccess: (data) => {
      invalidateAll();
      setDeclarePaymentDialogOpen(false);
      setDeclarePaymentAppId('');
      setDeclarePaymentFiles([]);
      setDeclarePaymentExistingProofs([]);
      setDeclarePaymentForm({
        payment_name: 'Admission Fee',
        mode: 'cash',
        notes: ''
      });
      toast.success(
        data?.message || 'Payment declared. Pending finance review.'
      );
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (err: any) => {
      toast.error(err?.response?.data?.error || 'Failed to declare payment');
    }
  });

  const updateApplicationStatus = useMutation({
    mutationFn: async ({
      appId,
      status
    }: {
      appId: string;
      status: string;
    }) => {
      if (!api) throw new Error('API not initialized');
      const response = await api.patch(`/admin/applications/${appId}/`, {
        status
      });
      return response.data;
    },
    onSuccess: () => {
      invalidateAll();
      toast.success('Application status updated');
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (err: any) => {
      toast.error(
        err?.response?.data?.error || 'Failed to update application status'
      );
    }
  });

  if (isLoading) {
    return (
      <PageContainer className='w-full'>
        <div className='space-y-4 py-12'>
          <div className='bg-muted mx-auto h-8 w-48 animate-pulse rounded' />
          <div className='bg-muted mx-auto h-4 w-32 animate-pulse rounded' />
        </div>
      </PageContainer>
    );
  }

  if (!lead) {
    return (
      <PageContainer className='w-full'>
        <div className='py-12 text-center'>
          <p className='text-muted-foreground'>Lead not found.</p>
          <Link href='/admin/leads'>
            <Button variant='link'>Back to Leads</Button>
          </Link>
        </div>
      </PageContainer>
    );
  }

  // Build timeline
  const timeline: TimelineItem[] = [];

  (callsData?.results ?? []).forEach((call) => {
    const purposeLabel =
      CALL_PURPOSE_OPTIONS.find((o) => o.value === call.purpose)?.label ??
      call.purpose;
    const outcomeLabel =
      CALL_OUTCOME_OPTIONS.find((o) => o.value === call.outcome)?.label ??
      call.outcome;
    timeline.push({
      id: `call-${call.id}`,
      type: 'call',
      title: `${call.call_type === 'OUTBOUND' ? 'Outbound' : 'Inbound'} Call — ${purposeLabel}`,
      description: call.notes || '',
      date: call.created_at,
      icon:
        call.call_type === 'OUTBOUND' ? (
          <PhoneOutgoing className='h-3.5 w-3.5' />
        ) : (
          <PhoneIncoming className='h-3.5 w-3.5' />
        ),
      iconBg:
        call.call_type === 'OUTBOUND'
          ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
          : 'bg-green-500/10 text-green-600 dark:text-green-400',
      meta: {
        outcome: outcomeLabel,
        duration: `${call.duration_minutes} min`,
        follow_up_required: call.follow_up_required,
        follow_up_date: call.follow_up_date
      }
    });
  });

  (consultsData?.results ?? []).forEach((consult) => {
    const typeLabel =
      CONSULTATION_TYPE_OPTIONS.find(
        (o) => o.value === consult.consultation_type
      )?.label ?? consult.consultation_type;
    timeline.push({
      id: `consult-${consult.id}`,
      type: 'consultation',
      title: `${typeLabel} Consultation`,
      description: consult.summary || '',
      date: consult.scheduled_at,
      icon: <Calendar className='h-3.5 w-3.5' />,
      iconBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
      meta: {
        status: consult.status,
        outcome: consult.outcome ?? '—',
        scheduled_at: consult.scheduled_at,
        needs_time: consult.needs_time,
        staff_member_name: consult.staff_member_name ?? consult.caller_name
      }
    });
  });

  timeline.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const sourceLabel =
    LEAD_SOURCE_OPTIONS.find((o) => o.value === lead.source)?.label ??
    lead.source;

  const currentIdx = statusSteps.findIndex((s) => s.value === lead.status);
  const isLost = lead.status === 'LOST';

  const followUpOverdue =
    lead.follow_up_date && new Date(lead.follow_up_date) < new Date();

  return (
    <PageContainer className='w-full'>
      <div className='w-full space-y-6'>
        {/* Back + Header */}
        <div>
          <button
            onClick={() => router.back()}
            className='text-muted-foreground hover:text-foreground mb-4 inline-flex items-center gap-1.5 text-sm transition-colors'
          >
            <ArrowLeft className='h-3.5 w-3.5' />
            Back
          </button>

          <div className='mt-2 flex items-start justify-between'>
            <div className='space-y-1'>
              <div className='flex items-center gap-3'>
                <div className='bg-primary/10 flex h-10 w-10 items-center justify-center rounded-full'>
                  <User className='text-primary h-5 w-5' />
                </div>
                <div>
                  <h1 className='text-2xl font-bold tracking-tight'>
                    {lead.student_name}
                  </h1>
                  <div className='mt-0.5 flex items-center gap-2'>
                    {lead.email && (
                      <span className='text-muted-foreground text-sm'>
                        {lead.email}
                      </span>
                    )}
                    {lead.email && lead.phone_number && (
                      <span className='text-muted-foreground text-xs'>
                        &middot;
                      </span>
                    )}
                    <span className='text-muted-foreground text-sm'>
                      {lead.phone_number}
                    </span>
                  </div>
                </div>
              </div>
              <div className='mt-2 flex items-center gap-2 pl-[52px]'>
                <Badge variant='outline' className='text-xs'>
                  {sourceLabel}
                </Badge>
                {lead.is_app_student && (
                  <Badge
                    variant='outline'
                    className='border-green-500/30 bg-green-500/10 text-green-600 dark:text-green-400'
                  >
                    <GraduationCap className='mr-1 h-3 w-3' />
                    App Student
                  </Badge>
                )}
                {isLost && (
                  <Badge variant='destructive' className='text-xs'>
                    <XCircle className='mr-1 h-3 w-3' />
                    Lost
                  </Badge>
                )}
                {lead.assigned_to_name && (
                  <span className='text-muted-foreground text-xs'>
                    Assigned to {lead.assigned_to_name}
                  </span>
                )}
              </div>
            </div>

            <div className='flex items-center gap-2'>
              <Button size='sm' onClick={() => setCreateAppDialogOpen(true)}>
                <FileTextIcon className='mr-1.5 h-3.5 w-3.5' />
                Create Application
              </Button>
              <Button
                variant='outline'
                size='sm'
                onClick={() => setCallDialogOpen(true)}
              >
                <Phone className='mr-1.5 h-3.5 w-3.5' />
                Log Call
              </Button>
              <Button
                variant='outline'
                size='sm'
                onClick={() => setConsultationDialogOpen(true)}
              >
                <CalendarPlus className='mr-1.5 h-3.5 w-3.5' />
                Consultation
              </Button>
              <Button
                variant='outline'
                size='sm'
                onClick={() => setNoteDialogOpen(true)}
              >
                <MessageSquarePlus className='mr-1.5 h-3.5 w-3.5' />
                Note
              </Button>
            </div>
          </div>
        </div>

        {/* Status Steps */}
        {!isLost && (
          <div className='rounded-lg border p-4'>
            <div className='flex items-center'>
              {statusSteps.map((step, idx) => {
                const isCompleted = idx <= currentIdx;
                const isCurrent = idx === currentIdx;
                return (
                  <div key={step.value} className='flex flex-1 items-center'>
                    <button
                      className={cn(
                        'group flex flex-1 items-center gap-2 rounded-md px-3 py-2 transition-all',
                        isCurrent && 'bg-primary/10',
                        !isCompleted && 'hover:bg-muted/50 cursor-pointer'
                      )}
                      onClick={() => {
                        if (!isCompleted && !updateStatus.isPending) {
                          updateStatus.mutate(step.value);
                        }
                      }}
                      disabled={isCompleted || updateStatus.isPending}
                    >
                      <div
                        className={cn(
                          'flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-all',
                          isCompleted
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground group-hover:bg-muted/80'
                        )}
                      >
                        {isCompleted ? (
                          <CheckCircle className='h-3.5 w-3.5' />
                        ) : (
                          step.icon
                        )}
                      </div>
                      <span
                        className={cn(
                          'text-sm font-medium',
                          isCompleted
                            ? 'text-foreground'
                            : 'text-muted-foreground'
                        )}
                      >
                        {step.label}
                      </span>
                    </button>
                    {idx < statusSteps.length - 1 && (
                      <div
                        className={cn(
                          'h-px w-6 shrink-0',
                          idx < currentIdx ? 'bg-primary' : 'bg-border'
                        )}
                      />
                    )}
                  </div>
                );
              })}
            </div>
            {lead.status !== 'CONVERTED' && lead.status !== 'LOST' && (
              <div className='mt-2 flex justify-end'>
                <Button
                  variant='ghost'
                  size='sm'
                  className='text-destructive hover:text-destructive h-7 text-xs'
                  onClick={() => updateStatus.mutate('LOST')}
                  disabled={updateStatus.isPending}
                >
                  <XCircle className='mr-1 h-3 w-3' />
                  Mark as Lost
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Main Content */}
        <div className='grid grid-cols-1 gap-6 lg:grid-cols-12'>
          {/* Left Sidebar */}
          <div className='space-y-4 lg:col-span-4'>
            {/* Contact & Student Info Card */}
            <Card>
              <CardContent className='pt-6'>
                <div className='space-y-4'>
                  {/* Contact Details */}
                  <div className='space-y-3'>
                    <h3 className='text-muted-foreground text-xs font-semibold tracking-wider uppercase'>
                      Contact Details
                    </h3>
                    <div className='space-y-2.5'>
                      <div className='flex items-center gap-3'>
                        <div className='bg-muted flex h-8 w-8 shrink-0 items-center justify-center rounded-md'>
                          <User className='text-muted-foreground h-3.5 w-3.5' />
                        </div>
                        <div className='min-w-0'>
                          <p className='text-sm font-medium'>
                            {lead.student_name}
                          </p>
                          <p className='text-muted-foreground text-xs'>
                            Student
                          </p>
                        </div>
                      </div>
                      {lead.parent_name && (
                        <div className='flex items-center gap-3'>
                          <div className='bg-muted flex h-8 w-8 shrink-0 items-center justify-center rounded-md'>
                            <User className='text-muted-foreground h-3.5 w-3.5' />
                          </div>
                          <div className='min-w-0'>
                            <p className='text-sm font-medium'>
                              {lead.parent_name}
                            </p>
                            <p className='text-muted-foreground text-xs'>
                              Parent / Guardian
                            </p>
                          </div>
                        </div>
                      )}
                      <div className='flex items-center gap-3'>
                        <div className='bg-muted flex h-8 w-8 shrink-0 items-center justify-center rounded-md'>
                          <Phone className='text-muted-foreground h-3.5 w-3.5' />
                        </div>
                        <p className='text-sm'>{lead.phone_number}</p>
                      </div>
                      {lead.email && (
                        <div className='flex items-center gap-3'>
                          <div className='bg-muted flex h-8 w-8 shrink-0 items-center justify-center rounded-md'>
                            <Mail className='text-muted-foreground h-3.5 w-3.5' />
                          </div>
                          <p className='truncate text-sm'>{lead.email}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* Student Account */}
                  <div className='space-y-3'>
                    <h3 className='text-muted-foreground text-xs font-semibold tracking-wider uppercase'>
                      Student Account
                    </h3>
                    {lead.converted_student ? (
                      <div className='space-y-2'>
                        <div className='flex items-center gap-3 rounded-lg border bg-green-500/5 p-3'>
                          <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-500/10'>
                            <GraduationCap className='h-4 w-4 text-green-600 dark:text-green-400' />
                          </div>
                          <div className='min-w-0 flex-1'>
                            <p className='text-sm font-medium'>
                              {lead.converted_student_name ?? 'Linked'}
                            </p>
                            {lead.converted_student_email && (
                              <p className='text-muted-foreground truncate text-xs'>
                                {lead.converted_student_email}
                              </p>
                            )}
                          </div>
                          <Link
                            href={`/admin/students/${lead.converted_student}`}
                          >
                            <Button
                              variant='ghost'
                              size='sm'
                              className='h-7 px-2 text-xs'
                            >
                              <ExternalLink className='mr-1 h-3 w-3' />
                              View
                            </Button>
                          </Link>
                        </div>
                        {lead.status !== 'CONVERTED' && (
                          <Button
                            variant='ghost'
                            size='sm'
                            className='text-muted-foreground h-6 w-full text-xs'
                            onClick={() => unlinkStudentMutation.mutate()}
                            disabled={unlinkStudentMutation.isPending}
                          >
                            <Unlink className='mr-1 h-3 w-3' />
                            Unlink Student
                          </Button>
                        )}
                      </div>
                    ) : (
                      <div className='space-y-2'>
                        <p className='text-muted-foreground text-sm'>
                          No student account linked yet.
                        </p>
                        <div className='grid grid-cols-2 gap-2'>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => setLinkDialogOpen(true)}
                            className='w-full'
                          >
                            <Link2 className='mr-1 h-3.5 w-3.5' />
                            Link
                          </Button>
                          <Button
                            size='sm'
                            onClick={() => registerStudentMutation.mutate()}
                            disabled={registerStudentMutation.isPending}
                            className='w-full'
                          >
                            <User className='mr-1 h-3.5 w-3.5' />
                            {registerStudentMutation.isPending
                              ? 'Creating...'
                              : 'Register'}
                          </Button>
                        </div>
                        <p className='text-muted-foreground text-center text-[10px]'>
                          Link an existing student or register a new one
                        </p>
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Meta */}
                  <div className='space-y-3'>
                    <h3 className='text-muted-foreground text-xs font-semibold tracking-wider uppercase'>
                      Lead Info
                    </h3>
                    <div className='grid grid-cols-2 gap-3'>
                      <div>
                        <p className='text-muted-foreground text-xs'>Source</p>
                        <p className='text-sm font-medium'>{sourceLabel}</p>
                      </div>
                      <div>
                        <p className='text-muted-foreground text-xs'>Created</p>
                        <p className='text-sm font-medium'>
                          {format(new Date(lead.created_at), 'MMM d, yyyy')}
                        </p>
                      </div>
                      {lead.follow_up_date && (
                        <div className='col-span-2'>
                          <p className='text-muted-foreground text-xs'>
                            Follow-up
                          </p>
                          <p
                            className={cn(
                              'text-sm font-medium',
                              followUpOverdue && 'text-destructive'
                            )}
                          >
                            {format(
                              new Date(lead.follow_up_date),
                              'MMM d, yyyy'
                            )}
                            {followUpOverdue && (
                              <span className='ml-1.5 text-xs font-normal'>
                                (overdue)
                              </span>
                            )}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Student Applications — moved to right-side tabs, hidden here */}
            {false && lead.converted_student && (
              <Card>
                <CardHeader className='pb-3'>
                  <CardTitle className='text-muted-foreground text-xs font-semibold tracking-wider uppercase'>
                    Applications & Pipelines
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const apps = studentAppsData?.results ?? [];
                    const pipelines = studentPipelinesData?.results ?? [];

                    if (apps.length === 0 && pipelines.length === 0) {
                      return (
                        <div className='rounded-lg border border-dashed p-4 text-center'>
                          <FileTextIcon className='text-muted-foreground mx-auto mb-2 h-5 w-5' />
                          <p className='text-muted-foreground text-sm'>
                            No applications yet
                          </p>
                          <p className='text-muted-foreground text-xs'>
                            Applications will appear here when the student
                            applies via the app.
                          </p>
                        </div>
                      );
                    }

                    return (
                      <div className='space-y-2'>
                        {apps.map((app) => {
                          const pipeline = pipelines.find(
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            (p: any) => p.application === app.id
                          );
                          return (
                            <div
                              key={app.id}
                              className='hover:bg-accent/50 rounded-lg border p-3 transition-colors'
                            >
                              <div className='flex items-start justify-between gap-2'>
                                <div className='min-w-0 flex-1'>
                                  <p className='text-sm font-medium'>
                                    {app.university?.name ??
                                      app.university_name ??
                                      'University'}
                                  </p>
                                  <p className='text-muted-foreground text-xs'>
                                    {app.app_id}
                                  </p>
                                </div>
                                <Badge
                                  variant={
                                    app.status === 'ACCEPTED' ||
                                    app.status === 'ADMITTED'
                                      ? 'default'
                                      : app.status === 'REJECTED' ||
                                          app.status === 'CANCELLED'
                                        ? 'destructive'
                                        : 'secondary'
                                  }
                                  className='text-xs'
                                >
                                  {app.status}
                                </Badge>
                              </div>
                              {/* Courses */}
                              {app.courses && app.courses.length > 0 && (
                                <div className='mt-1.5 flex flex-wrap gap-1'>
                                  {app.courses.map((c: any, i: number) => (
                                    <Badge
                                      key={i}
                                      variant='outline'
                                      className='px-1.5 py-0 text-[10px]'
                                    >
                                      {typeof c === 'string'
                                        ? c
                                        : (c.course_name ?? c.name ?? 'Course')}
                                    </Badge>
                                  ))}
                                </div>
                              )}

                              {/* Admission fee status */}
                              <div className='mt-2 flex items-center gap-2'>
                                {app.admission_fee_paid ? (
                                  <Badge
                                    variant='default'
                                    className='bg-green-600 text-[10px]'
                                  >
                                    Admission Paid
                                  </Badge>
                                ) : app.payment_status === 'declared' ? (
                                  <Badge
                                    variant='outline'
                                    className='border-amber-500/30 bg-amber-500/10 text-[10px] text-amber-500'
                                  >
                                    Pending Finance Review
                                  </Badge>
                                ) : app.payment_status === 'failed' ? (
                                  <>
                                    <Badge
                                      variant='destructive'
                                      className='text-[10px]'
                                    >
                                      Payment Rejected
                                    </Badge>
                                    {app.status === 'ACCEPTED' && (
                                      <Button
                                        variant='outline'
                                        size='sm'
                                        className='h-5 gap-1 px-1.5 text-[10px]'
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setDeclarePaymentAppId(app.id);
                                          setDeclarePaymentExistingProofs(
                                            app.payment_proofs || []
                                          );
                                          setDeclarePaymentDialogOpen(true);
                                        }}
                                      >
                                        <Upload className='h-3 w-3' />
                                        Re-upload Proof
                                      </Button>
                                    )}
                                  </>
                                ) : app.status === 'ACCEPTED' ? (
                                  <>
                                    <Badge
                                      variant='outline'
                                      className='border-amber-500/30 text-[10px] text-amber-500'
                                    >
                                      Awaiting Payment
                                    </Badge>
                                    <Button
                                      variant='outline'
                                      size='sm'
                                      className='h-5 gap-1 px-1.5 text-[10px]'
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setDeclarePaymentAppId(app.id);
                                        setDeclarePaymentDialogOpen(true);
                                      }}
                                    >
                                      <DollarSign className='h-3 w-3' />
                                      Declare Paid
                                    </Button>
                                  </>
                                ) : (
                                  <Badge
                                    variant='outline'
                                    className='text-[10px]'
                                  >
                                    {app.status}
                                  </Badge>
                                )}
                              </div>

                              {/* Pipeline link or waiting message */}
                              {pipeline ? (
                                <Link
                                  href={`/admin/pipeline/${pipeline.id}`}
                                  className='bg-muted/50 hover:bg-muted mt-2 flex items-center justify-between rounded-md px-2.5 py-1.5 text-xs transition-colors'
                                >
                                  <span className='flex items-center gap-1.5'>
                                    <Kanban className='h-3 w-3' />
                                    Pipeline:{' '}
                                    {pipeline.current_phase?.replace(/_/g, ' ')}
                                  </span>
                                  <span className='text-muted-foreground'>
                                    {pipeline.completed_stages ?? 0}/
                                    {pipeline.total_stages ?? 0}
                                  </span>
                                </Link>
                              ) : (
                                <p className='text-muted-foreground mt-2 text-xs italic'>
                                  {app.admission_fee_paid
                                    ? 'Pipeline will be created shortly'
                                    : 'Pipeline starts after admission fee is paid'}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Content */}
          <div className='lg:col-span-8'>
            <Tabs value={tab} onValueChange={setTab} className='w-full'>
              <TabsList>
                <TabsTrigger value='activity' className='gap-1.5'>
                  <Activity className='h-3.5 w-3.5' />
                  Activity
                  {timeline.length > 0 && (
                    <Badge
                      variant='secondary'
                      className='ml-1 h-5 min-w-5 justify-center rounded-full px-1.5 text-xs'
                    >
                      {timeline.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value='applications' className='gap-1.5'>
                  <FileTextIcon className='h-3.5 w-3.5' />
                  Applications
                  {(studentAppsData?.results?.length ?? 0) > 0 && (
                    <Badge
                      variant='secondary'
                      className='ml-1 h-5 min-w-5 justify-center rounded-full px-1.5 text-xs'
                    >
                      {studentAppsData?.results?.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value='notes' className='gap-1.5'>
                  <StickyNote className='h-3.5 w-3.5' />
                  Notes
                </TabsTrigger>
              </TabsList>

              {/* Applications Tab */}
              <TabsContent value='applications' className='mt-4'>
                <Card>
                  <CardContent className='pt-6'>
                    {(() => {
                      const pipelines = studentPipelinesData?.results ?? [];
                      const pipelineAppIds = new Set(
                        pipelines.map((p: any) => p.application)
                      );
                      // Merge payment_status from lead.applications into studentAppsData
                      const leadApps: any[] = (lead as any).applications ?? [];
                      const paymentStatusMap = new Map(
                        leadApps.map((a: any) => [a.id, a.payment_status])
                      );
                      const paymentNotesMap = new Map(
                        leadApps.map((a: any) => [a.id, a.payment_review_notes])
                      );
                      const paymentProofsMap = new Map(
                        leadApps.map((a: any) => [a.id, a.payment_proofs])
                      );
                      // Sort: apps with pipelines first, then by date desc
                      const allApps = [...(studentAppsData?.results ?? [])]
                        .map((app: any) => ({
                          ...app,
                          payment_status:
                            paymentStatusMap.get(app.id) ?? app.payment_status,
                          payment_review_notes:
                            paymentNotesMap.get(app.id) ??
                            app.payment_review_notes,
                          payment_proofs:
                            paymentProofsMap.get(app.id) ??
                            app.payment_proofs ??
                            []
                        }))
                        .sort((a: any, b: any) => {
                          const aHasPipeline = pipelineAppIds.has(a.id) ? 1 : 0;
                          const bHasPipeline = pipelineAppIds.has(b.id) ? 1 : 0;
                          if (bHasPipeline !== aHasPipeline)
                            return bHasPipeline - aHasPipeline;
                          return (
                            new Date(b.created_at).getTime() -
                            new Date(a.created_at).getTime()
                          );
                        });
                      const totalApps = allApps.length;
                      const totalPages = Math.ceil(totalApps / APPS_PER_PAGE);
                      const paginatedApps = allApps.slice(
                        (appsPage - 1) * APPS_PER_PAGE,
                        appsPage * APPS_PER_PAGE
                      );

                      // Draft applications (for leads without student account)
                      const drafts = (lead as any).draft_applications ?? [];

                      if (
                        !lead.converted_student &&
                        totalApps === 0 &&
                        drafts.length === 0
                      ) {
                        return (
                          <div className='rounded-lg border border-dashed p-6 text-center'>
                            <FileTextIcon className='text-muted-foreground mx-auto mb-2 h-6 w-6' />
                            <p className='text-muted-foreground text-sm font-medium'>
                              No applications yet
                            </p>
                            <p className='text-muted-foreground mt-1 text-xs'>
                              Create an application to track university interest
                              for this lead.
                            </p>
                          </div>
                        );
                      }

                      if (totalApps === 0 && drafts.length === 0) {
                        return (
                          <div className='rounded-lg border border-dashed p-6 text-center'>
                            <FileTextIcon className='text-muted-foreground mx-auto mb-2 h-6 w-6' />
                            <p className='text-muted-foreground text-sm font-medium'>
                              No applications yet
                            </p>
                            <p className='text-muted-foreground mt-1 text-xs'>
                              Applications will appear here when the student
                              applies via the app.
                            </p>
                          </div>
                        );
                      }

                      return (
                        <div className='space-y-3'>
                          {/* Draft applications (no student account yet) */}
                          {drafts.length > 0 && (
                            <>
                              {drafts.map((draft: any) => (
                                <div
                                  key={draft.id}
                                  className='rounded-xl border border-dashed border-amber-500/20 bg-amber-500/[0.02] p-4'
                                >
                                  <div className='flex items-start justify-between gap-3'>
                                    <div className='min-w-0 flex-1'>
                                      <div className='flex items-center gap-2'>
                                        <p className='text-sm font-semibold'>
                                          {draft.university_name}
                                        </p>
                                        <Badge
                                          variant='outline'
                                          className='border-amber-500/30 text-[10px] text-amber-500'
                                        >
                                          Draft
                                        </Badge>
                                      </div>
                                    </div>
                                  </div>
                                  {draft.courses?.length > 0 && (
                                    <div className='mt-2 flex flex-wrap gap-1.5'>
                                      {draft.courses.map(
                                        (c: string, i: number) => (
                                          <Badge
                                            key={i}
                                            variant='outline'
                                            className='px-2 py-0.5 text-[10px] font-normal'
                                          >
                                            {c}
                                          </Badge>
                                        )
                                      )}
                                    </div>
                                  )}
                                  <p className='text-muted-foreground mt-2 text-xs italic'>
                                    Link a student account to convert this to a
                                    real application.
                                  </p>
                                </div>
                              ))}
                              {totalApps > 0 && (
                                <div className='my-2 border-t' />
                              )}
                            </>
                          )}

                          {paginatedApps.map((app: any) => {
                            const pipeline = pipelines.find(
                              (p: any) => p.application === app.id
                            );
                            return (
                              <div
                                key={app.id}
                                className='hover:bg-accent/30 rounded-xl border p-4 transition-colors'
                              >
                                <div className='flex items-start justify-between gap-3'>
                                  <div className='min-w-0 flex-1'>
                                    <div className='flex items-center gap-2'>
                                      <p className='text-sm font-semibold'>
                                        {app.university?.name ??
                                          app.university_name ??
                                          'University'}
                                      </p>
                                      <Badge
                                        variant={
                                          app.status === 'ACCEPTED' ||
                                          app.status === 'ADMITTED'
                                            ? 'default'
                                            : app.status === 'REJECTED' ||
                                                app.status === 'CANCELLED'
                                              ? 'destructive'
                                              : 'secondary'
                                        }
                                        className='text-[10px]'
                                      >
                                        {app.status}
                                      </Badge>
                                      <Select
                                        value={app.status}
                                        onValueChange={(val) => {
                                          if (val !== app.status) {
                                            updateApplicationStatus.mutate({
                                              appId: app.id,
                                              status: val
                                            });
                                          }
                                        }}
                                      >
                                        <SelectTrigger className='text-muted-foreground h-6 w-auto gap-1 border-dashed px-1.5 text-[10px]'>
                                          <Pencil className='h-3 w-3' />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value='PENDING'>
                                            Pending
                                          </SelectItem>
                                          <SelectItem value='ACCEPTED'>
                                            Accepted
                                          </SelectItem>
                                          <SelectItem value='EXPIRED'>
                                            Expired
                                          </SelectItem>
                                          <SelectItem value='REJECTED'>
                                            Rejected
                                          </SelectItem>
                                          <SelectItem value='CANCELLED'>
                                            Cancelled
                                          </SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <p className='text-muted-foreground mt-0.5 text-xs'>
                                      {app.app_id}
                                    </p>
                                  </div>

                                  <div className='flex shrink-0 items-center gap-2'>
                                    {app.admission_fee_paid ? (
                                      <Badge
                                        variant='default'
                                        className='bg-green-600 text-[10px]'
                                      >
                                        Paid
                                      </Badge>
                                    ) : app.payment_status === 'declared' ? (
                                      <Badge
                                        variant='outline'
                                        className='border-amber-500/30 bg-amber-500/10 text-[10px] text-amber-500'
                                      >
                                        Pending Review
                                      </Badge>
                                    ) : app.payment_status === 'failed' ? (
                                      <>
                                        <Badge
                                          variant='destructive'
                                          className='text-[10px]'
                                        >
                                          Rejected
                                        </Badge>
                                        {app.status === 'ACCEPTED' && (
                                          <Button
                                            variant='outline'
                                            size='sm'
                                            className='border-destructive/30 text-destructive h-7 gap-1 text-xs'
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setDeclarePaymentAppId(app.id);
                                              setDeclarePaymentExistingProofs(
                                                app.payment_proofs || []
                                              );
                                              setDeclarePaymentDialogOpen(true);
                                            }}
                                          >
                                            <Upload className='h-3 w-3' />
                                            Re-upload
                                          </Button>
                                        )}
                                      </>
                                    ) : app.status === 'ACCEPTED' ? (
                                      <Button
                                        variant='outline'
                                        size='sm'
                                        className='h-7 gap-1 text-xs'
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setDeclarePaymentAppId(app.id);
                                          setDeclarePaymentDialogOpen(true);
                                        }}
                                      >
                                        <DollarSign className='h-3 w-3' />
                                        Declare Paid
                                      </Button>
                                    ) : (
                                      <Badge
                                        variant='outline'
                                        className='text-[10px]'
                                      >
                                        {app.status}
                                      </Badge>
                                    )}
                                    <Link
                                      href={`/admin/applications/${app.id}`}
                                    >
                                      <Button
                                        variant='ghost'
                                        size='sm'
                                        className='h-7 text-xs'
                                      >
                                        View
                                      </Button>
                                    </Link>
                                  </div>
                                </div>

                                {/* Courses */}
                                {app.courses && app.courses.length > 0 && (
                                  <div className='mt-2 flex flex-wrap gap-1.5'>
                                    {app.courses.map((c: any, i: number) => (
                                      <Badge
                                        key={i}
                                        variant='outline'
                                        className='px-2 py-0.5 text-[10px] font-normal'
                                      >
                                        {typeof c === 'string'
                                          ? c
                                          : (c.course_name ??
                                            c.name ??
                                            'Course')}
                                      </Badge>
                                    ))}
                                  </div>
                                )}

                                {/* Pipeline link */}
                                {pipeline ? (
                                  <Link
                                    href={`/admin/pipeline/${pipeline.id}`}
                                    className='bg-muted/50 hover:bg-muted mt-3 flex items-center justify-between rounded-lg px-3 py-2 text-xs transition-colors'
                                  >
                                    <span className='flex items-center gap-2'>
                                      <Kanban className='h-3.5 w-3.5' />
                                      <span className='font-medium'>
                                        Pipeline:{' '}
                                        {pipeline.current_phase?.replace(
                                          /_/g,
                                          ' '
                                        )}
                                      </span>
                                    </span>
                                    <span className='text-muted-foreground'>
                                      {pipeline.completed_stages ?? 0}/
                                      {pipeline.total_stages ?? 0} stages
                                    </span>
                                  </Link>
                                ) : app.payment_status === 'declared' ? (
                                  <div className='mt-3 rounded-lg border border-amber-500/10 bg-amber-500/5 px-3 py-2'>
                                    <p className='text-xs font-medium text-amber-500'>
                                      Payment declared — waiting for finance
                                      review
                                    </p>
                                  </div>
                                ) : app.payment_status === 'failed' ? (
                                  <div className='bg-destructive/5 border-destructive/10 mt-3 rounded-lg border px-3 py-2'>
                                    <p className='text-destructive text-xs font-medium'>
                                      Payment rejected by finance — please
                                      re-upload proof
                                    </p>
                                    {app.payment_review_notes && (
                                      <p className='text-destructive/70 mt-1 text-xs'>
                                        Reason: {app.payment_review_notes}
                                      </p>
                                    )}
                                  </div>
                                ) : (
                                  <div className='mt-3 rounded-lg border border-amber-500/10 bg-amber-500/5 px-3 py-2'>
                                    <p className='text-xs text-amber-500'>
                                      {app.admission_fee_paid
                                        ? 'Pipeline will be created shortly...'
                                        : 'Pipeline starts after admission fee is paid'}
                                    </p>
                                  </div>
                                )}
                              </div>
                            );
                          })}

                          {/* Pagination */}
                          {totalPages > 1 && (
                            <div className='mt-4 flex items-center justify-between border-t pt-3'>
                              <p className='text-muted-foreground text-xs'>
                                Showing {(appsPage - 1) * APPS_PER_PAGE + 1}–
                                {Math.min(appsPage * APPS_PER_PAGE, totalApps)}{' '}
                                of {totalApps}
                              </p>
                              <div className='flex items-center gap-1.5'>
                                <Button
                                  variant='outline'
                                  size='sm'
                                  className='h-7 text-xs'
                                  disabled={appsPage === 1}
                                  onClick={() => setAppsPage((p) => p - 1)}
                                >
                                  Previous
                                </Button>
                                {Array.from({ length: totalPages }, (_, i) => (
                                  <Button
                                    key={i}
                                    variant={
                                      appsPage === i + 1 ? 'default' : 'outline'
                                    }
                                    size='sm'
                                    className='h-7 w-7 p-0 text-xs'
                                    onClick={() => setAppsPage(i + 1)}
                                  >
                                    {i + 1}
                                  </Button>
                                ))}
                                <Button
                                  variant='outline'
                                  size='sm'
                                  className='h-7 text-xs'
                                  disabled={appsPage === totalPages}
                                  onClick={() => setAppsPage((p) => p + 1)}
                                >
                                  Next
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value='activity' className='mt-4'>
                <Card>
                  <CardHeader className='pb-3'>
                    <div className='flex items-center justify-between'>
                      <CardTitle className='text-base'>
                        Activity Timeline
                      </CardTitle>
                      <div className='flex gap-1.5'>
                        <Badge variant='outline' className='text-xs'>
                          {callsData?.results?.length ?? 0} calls
                        </Badge>
                        <Badge variant='outline' className='text-xs'>
                          {consultsData?.results?.length ?? 0} consultations
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {timeline.length === 0 ? (
                      <div className='flex flex-col items-center justify-center rounded-lg border border-dashed py-12'>
                        <div className='bg-muted mb-3 rounded-full p-3'>
                          <Activity className='text-muted-foreground h-5 w-5' />
                        </div>
                        <p className='text-sm font-medium'>No activity yet</p>
                        <p className='text-muted-foreground mt-1 text-xs'>
                          Log a call or schedule a consultation to get started
                        </p>
                        <div className='mt-4 flex gap-2'>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => setCallDialogOpen(true)}
                          >
                            <Phone className='mr-1.5 h-3.5 w-3.5' />
                            Log Call
                          </Button>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => setConsultationDialogOpen(true)}
                          >
                            <CalendarPlus className='mr-1.5 h-3.5 w-3.5' />
                            Consultation
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className='relative'>
                        {timeline.map((item, idx) => (
                          <div
                            key={item.id}
                            className='flex gap-3 pb-6 last:pb-0'
                          >
                            <div className='flex flex-col items-center'>
                              <div
                                className={cn(
                                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                                  item.iconBg
                                )}
                              >
                                {item.icon}
                              </div>
                              {idx < timeline.length - 1 && (
                                <div className='bg-border mt-1 w-px flex-1' />
                              )}
                            </div>
                            <div className='min-w-0 flex-1 pt-0.5'>
                              <div className='flex items-center justify-between'>
                                <p className='text-sm font-medium'>
                                  {item.title}
                                </p>
                                <span className='text-muted-foreground text-xs'>
                                  {formatDistanceToNow(new Date(item.date), {
                                    addSuffix: true
                                  })}
                                </span>
                              </div>
                              <p className='text-muted-foreground mt-0.5 text-sm'>
                                {item.description}
                              </p>
                              {item.meta && (
                                <div className='mt-2 flex flex-wrap gap-1.5'>
                                  {item.meta.outcome && (
                                    <Badge
                                      variant='secondary'
                                      className='text-xs'
                                    >
                                      {item.meta.outcome}
                                    </Badge>
                                  )}
                                  {item.meta.duration && (
                                    <Badge
                                      variant='outline'
                                      className='text-xs'
                                    >
                                      {item.meta.duration}
                                    </Badge>
                                  )}
                                  {item.meta.status && (
                                    <Badge
                                      variant={
                                        item.meta.status === 'SCHEDULED'
                                          ? 'default'
                                          : 'secondary'
                                      }
                                      className='text-xs'
                                    >
                                      {item.meta.status}
                                    </Badge>
                                  )}
                                  {item.meta.needs_time && (
                                    <Badge
                                      variant='outline'
                                      className='text-xs'
                                    >
                                      Needs time to decide
                                    </Badge>
                                  )}
                                  {item.meta.staff_member_name && (
                                    <Badge
                                      variant='outline'
                                      className='text-xs'
                                    >
                                      Staff: {item.meta.staff_member_name}
                                    </Badge>
                                  )}
                                  {item.meta.follow_up_required && (
                                    <Badge
                                      variant='default'
                                      className='bg-amber-600 text-xs'
                                    >
                                      Follow-up:{' '}
                                      {item.meta.follow_up_date
                                        ? format(
                                            new Date(item.meta.follow_up_date),
                                            'MMM d, yyyy'
                                          )
                                        : 'Needed'}
                                    </Badge>
                                  )}
                                  {item.meta.scheduled_at && (
                                    <Badge
                                      variant='outline'
                                      className='text-xs'
                                    >
                                      {format(
                                        new Date(item.meta.scheduled_at),
                                        'MMM d, yyyy h:mm a'
                                      )}
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value='notes' className='mt-4'>
                <Card>
                  <CardHeader className='flex flex-row items-center justify-between pb-3'>
                    <CardTitle className='text-base'>Notes</CardTitle>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => setNoteDialogOpen(true)}
                    >
                      <MessageSquarePlus className='mr-1.5 h-3.5 w-3.5' />
                      Add Note
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {lead.notes ? (
                      <div className='space-y-3'>
                        {lead.notes.split('\n\n').map((note, i) => {
                          const timestampMatch = note.match(
                            /^\[(.+?)\]\s*([\s\S]*)/
                          );
                          if (timestampMatch) {
                            return (
                              <div
                                key={i}
                                className='bg-muted/30 rounded-lg border p-3'
                              >
                                <p className='text-sm'>{timestampMatch[2]}</p>
                                <p className='text-muted-foreground mt-1.5 text-xs'>
                                  {timestampMatch[1]}
                                </p>
                              </div>
                            );
                          }
                          return (
                            <div
                              key={i}
                              className='bg-muted/30 rounded-lg border p-3'
                            >
                              <p className='text-sm'>{note}</p>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className='flex flex-col items-center justify-center rounded-lg border border-dashed py-12'>
                        <div className='bg-muted mb-3 rounded-full p-3'>
                          <StickyNote className='text-muted-foreground h-5 w-5' />
                        </div>
                        <p className='text-sm font-medium'>No notes yet</p>
                        <p className='text-muted-foreground mt-1 text-xs'>
                          Add notes to track important information
                        </p>
                        <Button
                          variant='outline'
                          size='sm'
                          className='mt-4'
                          onClick={() => setNoteDialogOpen(true)}
                        >
                          <MessageSquarePlus className='mr-1.5 h-3.5 w-3.5' />
                          Add First Note
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Log Call Dialog */}
      <Dialog open={callDialogOpen} onOpenChange={setCallDialogOpen}>
        <DialogContent className='max-w-md'>
          <DialogHeader>
            <DialogTitle>Log Call</DialogTitle>
          </DialogHeader>
          <div className='space-y-4'>
            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-1.5'>
                <Label required>Type</Label>
                <Select
                  value={callForm.call_type}
                  onValueChange={(val) =>
                    setCallForm((f) => ({
                      ...f,
                      call_type: val as CallType
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='OUTBOUND'>Outbound</SelectItem>
                    <SelectItem value='INBOUND'>Inbound</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className='space-y-1.5'>
                <Label>Duration (min)</Label>
                <Input
                  type='number'
                  min={1}
                  value={callForm.duration_minutes}
                  onChange={(e) =>
                    setCallForm((f) => ({
                      ...f,
                      duration_minutes: parseInt(e.target.value) || 0
                    }))
                  }
                />
              </div>
            </div>
            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-1.5'>
                <Label required>Purpose</Label>
                <Select
                  value={callForm.purpose}
                  onValueChange={(val) =>
                    setCallForm((f) => ({
                      ...f,
                      purpose: val as CallPurpose
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CALL_PURPOSE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className='space-y-1.5'>
                <Label required>Outcome</Label>
                <Select
                  value={callForm.outcome}
                  onValueChange={(val) =>
                    setCallForm((f) => ({
                      ...f,
                      outcome: val as CallOutcome
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CALL_OUTCOME_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className='space-y-1.5'>
              <Label>Notes</Label>
              <Textarea
                value={callForm.notes}
                onChange={(e) =>
                  setCallForm((f) => ({ ...f, notes: e.target.value }))
                }
                rows={3}
              />
            </div>
            <div className='flex items-center gap-3'>
              <Switch
                checked={callForm.follow_up_required}
                onCheckedChange={(checked) =>
                  setCallForm((f) => ({ ...f, follow_up_required: checked }))
                }
              />
              <Label>Follow-up Required</Label>
            </div>
            {callForm.follow_up_required && (
              <div className='space-y-1.5'>
                <Label>Follow-up Date</Label>
                <Input
                  type='date'
                  value={callForm.follow_up_date}
                  onChange={(e) =>
                    setCallForm((f) => ({
                      ...f,
                      follow_up_date: e.target.value
                    }))
                  }
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setCallDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => logCall.mutate(callForm)}
              disabled={logCall.isPending}
            >
              {logCall.isPending ? 'Saving...' : 'Log Call'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Schedule Consultation Dialog */}
      <Dialog
        open={consultationDialogOpen}
        onOpenChange={setConsultationDialogOpen}
      >
        <DialogContent className='max-w-md'>
          <DialogHeader>
            <DialogTitle>Schedule Consultation</DialogTitle>
          </DialogHeader>
          <div className='space-y-4'>
            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-1.5'>
                <Label required>Type</Label>
                <Select
                  value={consultForm.consultation_type}
                  onValueChange={(val) =>
                    setConsultForm((f) => ({
                      ...f,
                      consultation_type: val as ConsultationType
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CONSULTATION_TYPE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className='space-y-1.5'>
                <Label required>Date & Time</Label>
                <Input
                  type='datetime-local'
                  value={consultForm.scheduled_at}
                  onChange={(e) =>
                    setConsultForm((f) => ({
                      ...f,
                      scheduled_at: e.target.value
                    }))
                  }
                />
              </div>
            </div>
            <div className='space-y-1.5'>
              <Label>Recommended Courses</Label>
              <CoursePicker
                value={selectedCourses}
                onChange={setSelectedCourses}
              />
            </div>
            <div className='space-y-1.5'>
              <Label>Recommended Universities</Label>
              <UniversityPicker
                value={selectedUniversities}
                onChange={setSelectedUniversities}
              />
            </div>
            <div className='space-y-1.5'>
              <Label>Outcome</Label>
              <Select
                value={consultForm.outcome || undefined}
                onValueChange={(val) =>
                  setConsultForm((f) => ({
                    ...f,
                    outcome: val as ConsultationOutcome
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder='Select outcome (optional)' />
                </SelectTrigger>
                <SelectContent>
                  {CONSULTATION_OUTCOME_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className='text-muted-foreground text-xs'>
                Mark as &ldquo;Ready to Apply&rdquo; when the student agrees to
                proceed with a university application.
              </p>
            </div>
            <div className='space-y-1.5'>
              <Label>Summary</Label>
              <Textarea
                value={consultForm.summary}
                onChange={(e) =>
                  setConsultForm((f) => ({ ...f, summary: e.target.value }))
                }
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setConsultationDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => scheduleConsultation.mutate(consultForm)}
              disabled={
                !consultForm.scheduled_at || scheduleConsultation.isPending
              }
            >
              {scheduleConsultation.isPending ? 'Scheduling...' : 'Schedule'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Application Dialog */}
      <Dialog
        open={createAppDialogOpen}
        onOpenChange={(open) => {
          setCreateAppDialogOpen(open);
          if (!open) {
            setAppUniversity([]);
            setAppCourses([]);
          }
        }}
      >
        <DialogContent className='max-w-md'>
          <DialogHeader>
            <DialogTitle>Create Application</DialogTitle>
          </DialogHeader>
          <p className='text-muted-foreground text-sm'>
            Create an application on behalf of the student. This will also start
            a processing pipeline.
          </p>
          <div className='space-y-4'>
            <div className='space-y-1.5'>
              <Label required>University</Label>
              <UniversityPicker
                value={appUniversity}
                onChange={(items) => {
                  setAppUniversity(
                    items.length > 0 ? [items[items.length - 1]] : []
                  );
                  setAppCourses([]);
                }}
              />
            </div>
            <div className='space-y-1.5'>
              <Label>Courses</Label>
              <CoursePicker
                value={appCourses}
                onChange={setAppCourses}
                universityId={appUniversity[0]?.id}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setCreateAppDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (appUniversity.length > 0) {
                  createApplicationMutation.mutate({
                    universityId: appUniversity[0].id,
                    courseIds: appCourses.map((c) => c.id)
                  });
                }
              }}
              disabled={
                appUniversity.length === 0 ||
                createApplicationMutation.isPending
              }
            >
              {createApplicationMutation.isPending
                ? 'Creating...'
                : 'Create & Start Pipeline'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Note Dialog */}
      <Dialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Note</DialogTitle>
          </DialogHeader>
          <Textarea
            placeholder='Write a note...'
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            rows={4}
          />
          <DialogFooter>
            <Button variant='outline' onClick={() => setNoteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => updateNotes.mutate(noteText)}
              disabled={!noteText.trim() || updateNotes.isPending}
            >
              {updateNotes.isPending ? 'Saving...' : 'Save Note'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Declare Payment Dialog */}
      <Dialog
        open={declarePaymentDialogOpen}
        onOpenChange={(open) => {
          setDeclarePaymentDialogOpen(open);
          if (!open) {
            setDeclarePaymentAppId('');
            setDeclarePaymentFiles([]);
            setDeclarePaymentExistingProofs([]);
            setDeclarePaymentForm({
              payment_name: 'Admission Fee',
              mode: 'cash',
              notes: ''
            });
          }
        }}
      >
        <DialogContent className='flex max-h-[85vh] max-w-md flex-col'>
          <DialogHeader>
            <DialogTitle>
              {declarePaymentExistingProofs.length > 0
                ? 'Update Payment Proof'
                : 'Declare Admission Fee Paid'}
            </DialogTitle>
            <DialogDescription>
              {declarePaymentExistingProofs.length > 0
                ? 'Update your proof of payment. You can remove files and add new ones.'
                : 'The admission fee amount is automatically determined. Upload proof of payment for finance review.'}
            </DialogDescription>
          </DialogHeader>

          {/* Show rejection reason if re-uploading */}
          {(() => {
            const leadApps: any[] = (lead as any).applications ?? [];
            const app = leadApps.find((a: any) => a.id === declarePaymentAppId);
            const reason = app?.payment_review_notes;
            if (!reason) return null;
            return (
              <div className='border-destructive/20 bg-destructive/5 rounded-lg border px-3 py-2'>
                <p className='text-destructive text-xs font-medium'>
                  Rejection reason:
                </p>
                <p className='text-destructive/80 mt-0.5 text-xs'>{reason}</p>
              </div>
            );
          })()}

          <div className='flex-1 space-y-4 overflow-y-auto py-2'>
            <div className='space-y-2'>
              <Label className='text-sm'>Payment Mode</Label>
              <Select
                value={declarePaymentForm.mode}
                onValueChange={(value) =>
                  setDeclarePaymentForm((f) => ({ ...f, mode: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder='How was this paid?' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='cash'>Cash</SelectItem>
                  <SelectItem value='bank'>Bank Transfer</SelectItem>
                  <SelectItem value='mobile'>Mobile Money</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className='space-y-2'>
              <Label className='text-sm'>Proof of Payment *</Label>

              {/* Existing proofs — shown as regular removable cards */}
              {declarePaymentExistingProofs.length > 0 && (
                <div className='space-y-2'>
                  {declarePaymentExistingProofs.map((proof) => (
                    <div
                      key={proof.id}
                      className='bg-muted/20 flex items-center gap-3 rounded-lg border px-3 py-2'
                    >
                      {proof.file_url &&
                      /\.(jpg|jpeg|png|gif|webp)$/i.test(proof.file_url) ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={proof.file_url}
                          alt={proof.file_name}
                          className='h-10 w-10 rounded object-cover'
                        />
                      ) : (
                        <FileTextIcon className='text-muted-foreground bg-muted h-10 w-10 rounded p-2' />
                      )}
                      <div className='min-w-0 flex-1'>
                        <p className='truncate text-sm font-medium'>
                          {proof.file_name}
                        </p>
                        {proof.file_url && (
                          <a
                            href={proof.file_url}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='text-xs text-blue-500 hover:underline'
                          >
                            View full
                          </a>
                        )}
                      </div>
                      <Button
                        type='button'
                        variant='ghost'
                        size='sm'
                        className='text-muted-foreground hover:text-destructive h-7 w-7 p-0'
                        onClick={async () => {
                          // Delete from server
                          if (api && (proof as any).payment_id) {
                            try {
                              await api.delete(
                                `/admin/payments/${(proof as any).payment_id}/proofs/${proof.id}/`
                              );
                            } catch {
                              /* ignore if already deleted */
                            }
                          }
                          setDeclarePaymentExistingProofs((prev) =>
                            prev.filter((p) => p.id !== proof.id)
                          );
                        }}
                      >
                        <XCircle className='h-4 w-4' />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <label className='border-muted-foreground/20 hover:border-muted-foreground/40 hover:bg-muted/30 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 transition-colors'>
                <Upload className='text-muted-foreground/50 h-8 w-8' />
                <div className='text-center'>
                  <p className='text-sm font-medium'>
                    Click to upload proof of payment
                  </p>
                  <p className='text-muted-foreground mt-0.5 text-xs'>
                    Receipts, screenshots, deposit slips (images or PDF)
                  </p>
                </div>
                <input
                  type='file'
                  multiple
                  accept='image/*,.pdf'
                  className='hidden'
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    setDeclarePaymentFiles((prev) => [...prev, ...files]);
                  }}
                />
              </label>
              {declarePaymentFiles.length > 0 && (
                <div className='mt-2 space-y-2'>
                  {declarePaymentFiles.map((file, idx) => (
                    <div
                      key={idx}
                      className='bg-muted/20 flex items-center gap-3 rounded-lg border px-3 py-2'
                    >
                      {file.type.startsWith('image/') ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={URL.createObjectURL(file)}
                          alt={file.name}
                          className='h-10 w-10 rounded object-cover'
                        />
                      ) : (
                        <FileTextIcon className='text-muted-foreground bg-muted h-10 w-10 rounded p-2' />
                      )}
                      <div className='min-w-0 flex-1'>
                        <p className='truncate text-sm font-medium'>
                          {file.name}
                        </p>
                        <p className='text-muted-foreground text-xs'>
                          {(file.size / 1024).toFixed(0)} KB
                        </p>
                      </div>
                      <Button
                        type='button'
                        variant='ghost'
                        size='sm'
                        className='text-muted-foreground hover:text-destructive h-7 w-7 p-0'
                        onClick={() =>
                          setDeclarePaymentFiles((prev) =>
                            prev.filter((_, i) => i !== idx)
                          )
                        }
                      >
                        <XCircle className='h-4 w-4' />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className='space-y-2'>
              <Label className='text-sm'>Notes</Label>
              <Textarea
                placeholder='Optional notes (e.g. bank reference number)...'
                value={declarePaymentForm.notes}
                onChange={(e) =>
                  setDeclarePaymentForm((f) => ({
                    ...f,
                    notes: e.target.value
                  }))
                }
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setDeclarePaymentDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() =>
                declarePaymentMutation.mutate({
                  application_id: declarePaymentAppId,
                  payment_name: declarePaymentForm.payment_name,
                  mode: declarePaymentForm.mode,
                  notes: declarePaymentForm.notes,
                  files: declarePaymentFiles
                })
              }
              disabled={
                declarePaymentMutation.isPending ||
                declarePaymentFiles.length === 0
              }
            >
              {declarePaymentMutation.isPending ? (
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              ) : (
                <DollarSign className='mr-2 h-4 w-4' />
              )}
              Declare Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Link Student Dialog */}
      <Dialog
        open={linkDialogOpen}
        onOpenChange={(open) => {
          setLinkDialogOpen(open);
          if (!open) setLinkStudent(null);
        }}
      >
        <DialogContent className='max-w-md'>
          <DialogHeader>
            <DialogTitle>Link to Student Account</DialogTitle>
          </DialogHeader>
          <div className='space-y-4 py-2'>
            <div className='space-y-1.5'>
              <Label>Search Student</Label>
              <StudentPicker
                value={linkStudent}
                onSelect={setLinkStudent}
                placeholder='Search by name, email, or phone...'
              />
            </div>
            {linkStudent && (
              <div className='rounded-lg border bg-green-50/50 p-3 dark:bg-green-950/20'>
                <p className='text-sm font-medium'>{linkStudent.user_name}</p>
                <p className='text-muted-foreground text-xs'>
                  {linkStudent.user_email}
                  {linkStudent.education_level &&
                    ` · ${linkStudent.education_level}`}
                </p>
                <p className='text-muted-foreground mt-2 text-xs'>
                  Lead contact info will be updated to match this student&apos;s
                  profile.
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => {
                setLinkDialogOpen(false);
                setLinkStudent(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (linkStudent) {
                  linkStudentMutation.mutate(linkStudent.id);
                }
              }}
              disabled={!linkStudent || linkStudentMutation.isPending}
            >
              {linkStudentMutation.isPending ? 'Linking...' : 'Link Student'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
