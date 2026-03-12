'use client';

import { useState } from 'react';
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
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import {
  ArrowLeft,
  Phone,
  CalendarPlus,
  MessageSquarePlus,
  TrendingUp,
  User,
  Mail,
  Clock,
  CheckCircle,
  AlertCircle,
  PhoneOutgoing,
  PhoneIncoming,
  Calendar,
  FileText
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
  CONSULTATION_TYPE_OPTIONS
} from '@/features/consultations/types';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { format } from 'date-fns';
import { toast } from 'sonner';

// Unified timeline item
interface TimelineItem {
  id: string;
  type: 'call' | 'consultation' | 'status_change';
  title: string;
  description: string;
  date: string;
  icon: React.ReactNode;
  meta?: Record<string, string>;
}

const statusSteps: { value: LeadStatus; label: string }[] = [
  { value: 'NEW', label: 'New' },
  { value: 'CONTACTED', label: 'Contacted' },
  { value: 'CONSULTATION_SCHEDULED', label: 'Scheduled' },
  { value: 'CONSULTATION_DONE', label: 'Consulted' },
  { value: 'CONVERTED', label: 'Converted' }
];

export default function LeadDetailPage() {
  const params = useParams<{ leadId: string }>();
  const { api } = useClientApi();
  const queryClient = useQueryClient();
  const [callDialogOpen, setCallDialogOpen] = useState(false);
  const [consultationDialogOpen, setConsultationDialogOpen] = useState(false);
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [noteText, setNoteText] = useState('');

  // Call form
  const [callForm, setCallForm] = useState({
    call_type: 'OUTBOUND' as CallType,
    purpose: 'LEAD_FOLLOW_UP' as CallPurpose,
    outcome: 'ANSWERED' as CallOutcome,
    duration_minutes: 5,
    notes: '',
    follow_up_required: false,
    follow_up_date: ''
  });

  // Consultation form
  const [consultForm, setConsultForm] = useState({
    consultation_type: 'IN_PERSON' as ConsultationType,
    scheduled_at: '',
    summary: '',
    recommended_courses: '',
    recommended_universities: ''
  });

  const { data: lead, isLoading } = useQuery<Lead>({
    queryKey: ['lead', params.leadId],
    queryFn: async () => {
      if (!api) throw new Error('API not initialized');
      const response = await api.get(`/admin/leads/${params.leadId}/`);
      return response.data;
    },
    enabled: !!api && !!params.leadId
  });

  // Fetch calls for this lead
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

  // Fetch consultations for this lead
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

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ['lead', params.leadId] });
    queryClient.invalidateQueries({ queryKey: ['lead-calls', params.leadId] });
    queryClient.invalidateQueries({
      queryKey: ['lead-consultations', params.leadId]
    });
    queryClient.invalidateQueries({ queryKey: ['leads'] });
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
      const response = await api.post('/admin/consultations/', {
        ...data,
        lead: params.leadId
      });
      return response.data;
    },
    onSuccess: () => {
      invalidateAll();
      setConsultationDialogOpen(false);
      setConsultForm({
        consultation_type: 'IN_PERSON',
        scheduled_at: '',
        summary: '',
        recommended_courses: '',
        recommended_universities: ''
      });
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

  if (isLoading) {
    return (
      <PageContainer className='w-full'>
        <p className='text-muted-foreground py-12 text-center'>
          Loading lead...
        </p>
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

  // Build unified timeline
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
      description:
        call.notes || `Outcome: ${outcomeLabel}, ${call.duration_minutes} min`,
      date: call.created_at,
      icon:
        call.call_type === 'OUTBOUND' ? (
          <PhoneOutgoing className='h-3.5 w-3.5 text-blue-500' />
        ) : (
          <PhoneIncoming className='h-3.5 w-3.5 text-green-500' />
        ),
      meta: {
        outcome: outcomeLabel,
        duration: `${call.duration_minutes} min`
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
      description: consult.summary || `Status: ${consult.status}`,
      date: consult.scheduled_at,
      icon: <Calendar className='h-3.5 w-3.5 text-purple-500' />,
      meta: {
        status: consult.status,
        outcome: consult.outcome ?? '—'
      }
    });
  });

  // Sort newest first
  timeline.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const sourceLabel =
    LEAD_SOURCE_OPTIONS.find((o) => o.value === lead.source)?.label ??
    lead.source;
  const currentStatusLabel =
    LEAD_STATUS_OPTIONS.find((o) => o.value === lead.status)?.label ??
    lead.status;

  // Status progress
  const currentIdx = statusSteps.findIndex((s) => s.value === lead.status);
  const isLost = lead.status === 'LOST';

  return (
    <PageContainer className='w-full'>
      <div className='w-full space-y-6'>
        {/* Header */}
        <div className='flex items-center gap-4'>
          <Link href='/admin/leads'>
            <Button variant='ghost' size='icon'>
              <ArrowLeft className='h-4 w-4' />
            </Button>
          </Link>
          <div className='flex-1'>
            <h1 className='text-3xl font-bold'>{lead.student_name}</h1>
            <div className='mt-1 flex items-center gap-3'>
              <Badge variant='outline'>{sourceLabel}</Badge>
              <Badge
                variant={
                  isLost
                    ? 'destructive'
                    : lead.status === 'CONVERTED'
                      ? 'default'
                      : 'secondary'
                }
              >
                {currentStatusLabel}
              </Badge>
              {lead.assigned_to_name && (
                <span className='text-muted-foreground text-sm'>
                  Assigned to {lead.assigned_to_name}
                </span>
              )}
            </div>
          </div>
          <div className='flex gap-2'>
            <Button variant='outline' onClick={() => setCallDialogOpen(true)}>
              <Phone className='mr-2 h-4 w-4' />
              Log Call
            </Button>
            <Button
              variant='outline'
              onClick={() => setConsultationDialogOpen(true)}
            >
              <CalendarPlus className='mr-2 h-4 w-4' />
              Consultation
            </Button>
            <Button variant='outline' onClick={() => setNoteDialogOpen(true)}>
              <MessageSquarePlus className='mr-2 h-4 w-4' />
              Note
            </Button>
          </div>
        </div>

        {/* Status Pipeline */}
        {!isLost && (
          <Card>
            <CardContent className='py-4'>
              <div className='flex items-center gap-1'>
                {statusSteps.map((step, idx) => {
                  const isCompleted = idx <= currentIdx;
                  const isCurrent = idx === currentIdx;
                  return (
                    <div key={step.value} className='flex flex-1 items-center'>
                      <button
                        className={cn(
                          'flex flex-1 flex-col items-center gap-1 rounded-lg p-2 transition-colors',
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
                            'flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold',
                            isCompleted
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted text-muted-foreground'
                          )}
                        >
                          {isCompleted ? (
                            <CheckCircle className='h-4 w-4' />
                          ) : (
                            idx + 1
                          )}
                        </div>
                        <span
                          className={cn(
                            'text-xs font-medium',
                            !isCompleted && 'text-muted-foreground'
                          )}
                        >
                          {step.label}
                        </span>
                      </button>
                      {idx < statusSteps.length - 1 && (
                        <div
                          className={cn(
                            'h-0.5 w-4 shrink-0',
                            idx < currentIdx ? 'bg-primary' : 'bg-muted'
                          )}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
              {lead.status !== 'CONVERTED' && lead.status !== 'LOST' && (
                <div className='mt-3 flex justify-end'>
                  <Button
                    variant='ghost'
                    size='sm'
                    className='text-destructive'
                    onClick={() => updateStatus.mutate('LOST')}
                    disabled={updateStatus.isPending}
                  >
                    Mark as Lost
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
          {/* Left: Contact Info + Notes */}
          <div className='space-y-6'>
            <Card>
              <CardHeader>
                <CardTitle className='text-sm font-medium'>
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                <div className='flex items-center gap-2'>
                  <User className='text-muted-foreground h-4 w-4' />
                  <div>
                    <p className='text-sm font-medium'>{lead.student_name}</p>
                    <p className='text-muted-foreground text-xs'>Student</p>
                  </div>
                </div>
                {lead.parent_name && (
                  <div className='flex items-center gap-2'>
                    <User className='text-muted-foreground h-4 w-4' />
                    <div>
                      <p className='text-sm font-medium'>{lead.parent_name}</p>
                      <p className='text-muted-foreground text-xs'>Parent</p>
                    </div>
                  </div>
                )}
                <div className='flex items-center gap-2'>
                  <Phone className='text-muted-foreground h-4 w-4' />
                  <p className='text-sm'>{lead.phone_number}</p>
                </div>
                {lead.email && (
                  <div className='flex items-center gap-2'>
                    <Mail className='text-muted-foreground h-4 w-4' />
                    <p className='text-sm'>{lead.email}</p>
                  </div>
                )}
                {lead.follow_up_date && (
                  <div className='flex items-center gap-2'>
                    <Clock className='text-muted-foreground h-4 w-4' />
                    <div>
                      <p className='text-sm'>
                        {format(new Date(lead.follow_up_date), 'MMM d, yyyy')}
                      </p>
                      <p className='text-muted-foreground text-xs'>
                        Follow-up date
                      </p>
                    </div>
                  </div>
                )}
                <div className='text-muted-foreground text-xs'>
                  Created {format(new Date(lead.created_at), 'MMM d, yyyy')}
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            <Card>
              <CardHeader className='flex flex-row items-center justify-between'>
                <CardTitle className='text-sm font-medium'>Notes</CardTitle>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => setNoteDialogOpen(true)}
                >
                  <MessageSquarePlus className='mr-1 h-3 w-3' />
                  Add
                </Button>
              </CardHeader>
              <CardContent>
                {lead.notes ? (
                  <pre className='text-muted-foreground text-sm whitespace-pre-wrap'>
                    {lead.notes}
                  </pre>
                ) : (
                  <p className='text-muted-foreground text-sm'>No notes yet.</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right: Activity Timeline */}
          <div className='lg:col-span-2'>
            <Card>
              <CardHeader>
                <div className='flex items-center justify-between'>
                  <CardTitle>Activity Timeline</CardTitle>
                  <div className='flex gap-2'>
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
                  <div className='py-8 text-center'>
                    <p className='text-muted-foreground text-sm'>
                      No activity yet. Log a call or schedule a consultation.
                    </p>
                  </div>
                ) : (
                  <div className='relative space-y-0'>
                    {timeline.map((item, idx) => (
                      <div key={item.id} className='flex gap-3 pb-4'>
                        <div className='flex flex-col items-center'>
                          <div className='bg-muted flex h-7 w-7 shrink-0 items-center justify-center rounded-full'>
                            {item.icon}
                          </div>
                          {idx < timeline.length - 1 && (
                            <div className='bg-border w-px flex-1' />
                          )}
                        </div>
                        <div className='min-w-0 flex-1 pb-2'>
                          <div className='flex items-center justify-between'>
                            <p className='text-sm font-medium'>{item.title}</p>
                            <span className='text-muted-foreground text-xs'>
                              {format(new Date(item.date), 'MMM d, yyyy HH:mm')}
                            </span>
                          </div>
                          <p className='text-muted-foreground mt-0.5 text-sm'>
                            {item.description}
                          </p>
                          {item.meta && (
                            <div className='mt-1 flex gap-2'>
                              {Object.entries(item.meta).map(([key, val]) => (
                                <Badge
                                  key={key}
                                  variant='outline'
                                  className='text-xs'
                                >
                                  {val}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Log Call Dialog */}
      <Dialog open={callDialogOpen} onOpenChange={setCallDialogOpen}>
        <DialogContent className='max-w-md'>
          <DialogHeader>
            <DialogTitle>Log Call — {lead.student_name}</DialogTitle>
          </DialogHeader>
          <div className='space-y-4'>
            <div className='grid grid-cols-2 gap-3'>
              <div>
                <Label>Type</Label>
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
              <div>
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
            <div className='grid grid-cols-2 gap-3'>
              <div>
                <Label>Purpose</Label>
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
              <div>
                <Label>Outcome</Label>
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
            <div>
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
              <div>
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
            <DialogTitle>
              Schedule Consultation — {lead.student_name}
            </DialogTitle>
          </DialogHeader>
          <div className='space-y-4'>
            <div className='grid grid-cols-2 gap-3'>
              <div>
                <Label>Type</Label>
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
              <div>
                <Label>Date & Time</Label>
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
            <div>
              <Label>Recommended Courses</Label>
              <Input
                placeholder='e.g. Computer Science, Medicine...'
                value={consultForm.recommended_courses}
                onChange={(e) =>
                  setConsultForm((f) => ({
                    ...f,
                    recommended_courses: e.target.value
                  }))
                }
              />
            </div>
            <div>
              <Label>Recommended Universities</Label>
              <Input
                placeholder='e.g. Altai State University...'
                value={consultForm.recommended_universities}
                onChange={(e) =>
                  setConsultForm((f) => ({
                    ...f,
                    recommended_universities: e.target.value
                  }))
                }
              />
            </div>
            <div>
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

      {/* Add Note Dialog */}
      <Dialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Note — {lead.student_name}</DialogTitle>
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
    </PageContainer>
  );
}
