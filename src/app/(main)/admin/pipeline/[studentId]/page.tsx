'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useClientApi from '@/lib/axios/clientSide';
import PageContainer from '@/components/layout/page-container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  ArrowLeft,
  CheckCircle,
  Circle,
  AlertTriangle,
  Clock,
  SkipForward,
  Upload,
  FileText,
  User,
  MoreVertical,
  Play,
  Ban,
  MessageSquarePlus,
  History,
  CreditCard,
  Plus,
  Check,
  X
} from 'lucide-react';
import {
  type StudentPipeline,
  type PipelineStage,
  type DocumentRequirement,
  type JourneyEvent,
  type JourneyEventsResponse,
  type PipelinePayment,
  PIPELINE_STAGES,
  STAGE_STATUS_COLOR,
  PAYMENT_TYPE_OPTIONS
} from '@/features/pipeline/types';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { format } from 'date-fns';
import { toast } from 'sonner';

const statusIcon: Record<string, React.ReactNode> = {
  NOT_STARTED: <Circle className='text-muted-foreground h-4 w-4' />,
  IN_PROGRESS: <Clock className='h-4 w-4 text-blue-500' />,
  COMPLETED: <CheckCircle className='h-4 w-4 text-green-500' />,
  BLOCKED: <AlertTriangle className='h-4 w-4 text-red-500' />,
  SKIPPED: <SkipForward className='h-4 w-4 text-yellow-500' />
};

const eventIcon: Record<string, React.ReactNode> = {
  STAGE_STARTED: <Play className='h-3.5 w-3.5 text-blue-500' />,
  STAGE_COMPLETED: <CheckCircle className='h-3.5 w-3.5 text-green-500' />,
  STAGE_BLOCKED: <AlertTriangle className='h-3.5 w-3.5 text-red-500' />,
  DOCUMENT_UPLOADED: <Upload className='h-3.5 w-3.5 text-blue-500' />,
  DOCUMENT_VERIFIED: <Check className='h-3.5 w-3.5 text-green-500' />,
  DOCUMENT_REJECTED: <X className='h-3.5 w-3.5 text-red-500' />,
  PAYMENT_RECEIVED: <CreditCard className='h-3.5 w-3.5 text-green-500' />,
  NOTE_ADDED: <MessageSquarePlus className='h-3.5 w-3.5 text-gray-500' />,
  CALL_LOGGED: <Clock className='h-3.5 w-3.5 text-blue-500' />,
  OTHER: <History className='h-3.5 w-3.5 text-gray-400' />
};

export default function PipelineDetailPage() {
  const params = useParams<{ studentId: string }>();
  const { api } = useClientApi();
  const queryClient = useQueryClient();
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectDocId, setRejectDocId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const { data: pipeline, isLoading } = useQuery<StudentPipeline>({
    queryKey: ['pipeline', params.studentId],
    queryFn: async () => {
      if (!api) throw new Error('API not initialized');
      const response = await api.get(`/admin/pipelines/${params.studentId}/`);
      return response.data;
    },
    enabled: !!api && !!params.studentId
  });

  const { data: documents } = useQuery<DocumentRequirement[]>({
    queryKey: ['pipeline-documents', params.studentId],
    queryFn: async () => {
      if (!api) throw new Error('API not initialized');
      const response = await api.get(
        `/admin/pipelines/${params.studentId}/documents/`
      );
      return response.data;
    },
    enabled: !!api && !!params.studentId
  });

  const { data: journeyData } = useQuery<JourneyEventsResponse>({
    queryKey: ['pipeline-journey', params.studentId],
    queryFn: async () => {
      if (!api) throw new Error('API not initialized');
      const response = await api.get(
        `/admin/pipelines/${params.studentId}/journey/`
      );
      return response.data;
    },
    enabled: !!api && !!params.studentId
  });

  const { data: payments } = useQuery<PipelinePayment[]>({
    queryKey: ['pipeline-payments', params.studentId],
    queryFn: async () => {
      if (!api) throw new Error('API not initialized');
      const response = await api.get(
        `/admin/pipeline-payments/?pipeline=${pipeline?.id}`
      );
      return response.data?.results ?? response.data ?? [];
    },
    enabled: !!api && !!pipeline?.id
  });

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ['pipeline', params.studentId] });
    queryClient.invalidateQueries({
      queryKey: ['pipeline-documents', params.studentId]
    });
    queryClient.invalidateQueries({
      queryKey: ['pipeline-journey', params.studentId]
    });
    queryClient.invalidateQueries({
      queryKey: ['pipeline-payments', params.studentId]
    });
  };

  // Stage transition mutation
  const stageTransition = useMutation({
    mutationFn: async ({
      stageId,
      status,
      notes
    }: {
      stageId: string;
      status: string;
      notes?: string;
    }) => {
      if (!api) throw new Error('API not initialized');
      const payload: Record<string, string> = { status };
      if (notes) payload.notes = notes;
      const response = await api.patch(
        `/admin/pipeline-stages/${stageId}/`,
        payload
      );
      return response.data;
    },
    onSuccess: () => {
      invalidateAll();
      toast.success('Stage updated');
    },
    onError: () => toast.error('Failed to update stage')
  });

  // Document verify mutation
  const verifyDoc = useMutation({
    mutationFn: async (docId: string) => {
      if (!api) throw new Error('API not initialized');
      const response = await api.post(`/admin/documents/${docId}/verify/`);
      return response.data;
    },
    onSuccess: () => {
      invalidateAll();
      toast.success('Document verified');
    },
    onError: () => toast.error('Failed to verify document')
  });

  // Document reject mutation
  const rejectDoc = useMutation({
    mutationFn: async ({
      docId,
      reason
    }: {
      docId: string;
      reason: string;
    }) => {
      if (!api) throw new Error('API not initialized');
      const response = await api.post(`/admin/documents/${docId}/reject/`, {
        reason
      });
      return response.data;
    },
    onSuccess: () => {
      invalidateAll();
      setRejectDialogOpen(false);
      setRejectDocId(null);
      setRejectReason('');
      toast.success('Document rejected');
    },
    onError: () => toast.error('Failed to reject document')
  });

  // Add note mutation
  const addNote = useMutation({
    mutationFn: async (description: string) => {
      if (!api) throw new Error('API not initialized');
      const response = await api.post('/admin/journey-events/', {
        student: pipeline?.student,
        pipeline: pipeline?.id,
        event_type: 'NOTE_ADDED',
        title: 'Note added',
        description
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
          Loading pipeline...
        </p>
      </PageContainer>
    );
  }

  if (!pipeline) {
    return (
      <PageContainer className='w-full'>
        <div className='py-12 text-center'>
          <p className='text-muted-foreground'>Pipeline not found.</p>
          <Link href='/admin/pipeline'>
            <Button variant='link'>Back to Pipeline</Button>
          </Link>
        </div>
      </PageContainer>
    );
  }

  const completedCount =
    pipeline.stages?.filter((s) => s.status === 'COMPLETED').length ?? 0;
  const activeStage = pipeline.stages?.find((s) => s.status === 'IN_PROGRESS');
  const progress = Math.round((completedCount / 16) * 100);
  const journeyEvents = journeyData?.results ?? [];

  const phaseLabel: Record<string, string> = {
    CONSULTATION: 'Consultation',
    PRE_APPLICATION: 'Pre-Application',
    POST_APPLICATION: 'Post-Application',
    ORIENTATION: 'Orientation',
    DEPARTED: 'Departed',
    MONITORING: 'Monitoring'
  };

  return (
    <PageContainer className='w-full'>
      <div className='w-full space-y-6'>
        {/* Header */}
        <div className='flex items-center gap-4'>
          <Link href='/admin/pipeline'>
            <Button variant='ghost' size='icon'>
              <ArrowLeft className='h-4 w-4' />
            </Button>
          </Link>
          <div className='flex-1'>
            <h1 className='text-3xl font-bold'>
              {pipeline.student_name ?? 'Unknown Student'}
            </h1>
            <div className='mt-1 flex items-center gap-3'>
              <Badge variant='outline'>
                {phaseLabel[pipeline.current_phase] ?? pipeline.current_phase}
              </Badge>
              {pipeline.university_name && (
                <span className='text-muted-foreground text-sm'>
                  {pipeline.university_name}
                </span>
              )}
              {pipeline.country_name && (
                <span className='text-muted-foreground text-sm'>
                  — {pipeline.country_name}
                </span>
              )}
            </div>
          </div>
          <Button variant='outline' onClick={() => setNoteDialogOpen(true)}>
            <MessageSquarePlus className='mr-2 h-4 w-4' />
            Add Note
          </Button>
          <div className='text-right'>
            <p className='text-2xl font-bold'>{progress}%</p>
            <p className='text-muted-foreground text-xs'>Complete</p>
          </div>
        </div>

        {/* Info Cards */}
        <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
          <Card>
            <CardHeader className='flex flex-row items-center gap-2 space-y-0 pb-2'>
              <User className='text-muted-foreground h-4 w-4' />
              <CardTitle className='text-sm font-medium'>
                Assigned Staff
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className='font-medium'>
                {pipeline.assigned_staff_name ?? 'Unassigned'}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center gap-2 space-y-0 pb-2'>
              <Clock className='text-muted-foreground h-4 w-4' />
              <CardTitle className='text-sm font-medium'>Started</CardTitle>
            </CardHeader>
            <CardContent>
              <p className='font-medium'>
                {format(new Date(pipeline.started_at), 'MMM d, yyyy')}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center gap-2 space-y-0 pb-2'>
              <CheckCircle className='text-muted-foreground h-4 w-4' />
              <CardTitle className='text-sm font-medium'>Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <p className='font-medium'>
                {completedCount} of 16 stages complete
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 16-Stage Progress */}
        <Card>
          <CardHeader>
            <CardTitle>Pipeline Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-6'>
              {/* Pre-Application */}
              <div>
                <h3 className='text-muted-foreground mb-3 text-sm font-semibold'>
                  Pre-Application (Stages 1-7)
                </h3>
                <div className='space-y-2'>
                  {PIPELINE_STAGES.filter((s) => s.phase === 'pre').map(
                    (stage) => {
                      const pipelineStage = pipeline.stages?.find(
                        (ps) => ps.stage_type === stage.key
                      );
                      const status = pipelineStage?.status ?? 'NOT_STARTED';
                      const stageDocuments =
                        documents?.filter(
                          (d) => d.stage === pipelineStage?.id
                        ) ?? [];

                      return (
                        <StageRow
                          key={stage.key}
                          number={stage.number}
                          label={stage.label}
                          status={status}
                          stage={pipelineStage}
                          documents={stageDocuments}
                          isActive={activeStage?.stage_type === stage.key}
                          onTransition={(stageId, newStatus) =>
                            stageTransition.mutate({
                              stageId,
                              status: newStatus
                            })
                          }
                          isPending={stageTransition.isPending}
                        />
                      );
                    }
                  )}
                </div>
              </div>

              {/* Post-Application */}
              <div>
                <h3 className='text-muted-foreground mb-3 text-sm font-semibold'>
                  Post-Application (Stages 8-16)
                </h3>
                <div className='space-y-2'>
                  {PIPELINE_STAGES.filter((s) => s.phase === 'post').map(
                    (stage) => {
                      const pipelineStage = pipeline.stages?.find(
                        (ps) => ps.stage_type === stage.key
                      );
                      const status = pipelineStage?.status ?? 'NOT_STARTED';
                      const stageDocuments =
                        documents?.filter(
                          (d) => d.stage === pipelineStage?.id
                        ) ?? [];

                      return (
                        <StageRow
                          key={stage.key}
                          number={stage.number}
                          label={stage.label}
                          status={status}
                          stage={pipelineStage}
                          documents={stageDocuments}
                          isActive={activeStage?.stage_type === stage.key}
                          onTransition={(stageId, newStatus) =>
                            stageTransition.mutate({
                              stageId,
                              status: newStatus
                            })
                          }
                          isPending={stageTransition.isPending}
                        />
                      );
                    }
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Documents for Active Stage */}
        {activeStage && documents && documents.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>
                Documents —{' '}
                {
                  PIPELINE_STAGES.find((s) => s.key === activeStage.stage_type)
                    ?.label
                }
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-3'>
                {documents
                  .filter((d) => d.stage === activeStage.id)
                  .map((doc) => (
                    <DocumentRow
                      key={doc.id}
                      document={doc}
                      onVerify={(id) => verifyDoc.mutate(id)}
                      onReject={(id) => {
                        setRejectDocId(id);
                        setRejectDialogOpen(true);
                      }}
                      isPending={verifyDoc.isPending || rejectDoc.isPending}
                    />
                  ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Payments */}
        {payments && payments.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-2'>
                {payments.map((payment) => {
                  const typeLabel =
                    PAYMENT_TYPE_OPTIONS.find(
                      (o) => o.value === payment.payment_type
                    )?.label ?? payment.payment_type;
                  const statusColor: Record<string, string> = {
                    PENDING: 'text-amber-600',
                    PAID: 'text-green-600',
                    OVERDUE: 'text-red-600'
                  };
                  return (
                    <div
                      key={payment.id}
                      className='flex items-center gap-3 rounded-lg border p-3'
                    >
                      <CreditCard className='text-muted-foreground h-4 w-4 shrink-0' />
                      <div className='min-w-0 flex-1'>
                        <p className='text-sm font-medium'>{typeLabel}</p>
                        {payment.notes && (
                          <p className='text-muted-foreground truncate text-xs'>
                            {payment.notes}
                          </p>
                        )}
                      </div>
                      <span className='text-sm font-medium tabular-nums'>
                        {payment.currency}{' '}
                        {Number(payment.amount).toLocaleString()}
                      </span>
                      <Badge
                        variant='outline'
                        className={statusColor[payment.status] ?? ''}
                      >
                        {payment.status}
                      </Badge>
                      {payment.payment_date && (
                        <span className='text-muted-foreground text-xs'>
                          {format(new Date(payment.payment_date), 'MMM d')}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Journey Timeline */}
        <Card>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <CardTitle>Activity Timeline</CardTitle>
              <Button
                variant='outline'
                size='sm'
                onClick={() => setNoteDialogOpen(true)}
              >
                <Plus className='mr-1 h-3 w-3' />
                Add Note
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {journeyEvents.length === 0 ? (
              <p className='text-muted-foreground py-6 text-center text-sm'>
                No activity yet.
              </p>
            ) : (
              <div className='relative space-y-0'>
                {journeyEvents.map((event, idx) => (
                  <div key={event.id} className='flex gap-3 pb-4'>
                    <div className='flex flex-col items-center'>
                      <div className='bg-muted flex h-7 w-7 shrink-0 items-center justify-center rounded-full'>
                        {eventIcon[event.event_type] ?? eventIcon.OTHER}
                      </div>
                      {idx < journeyEvents.length - 1 && (
                        <div className='bg-border w-px flex-1' />
                      )}
                    </div>
                    <div className='min-w-0 flex-1 pb-2'>
                      <div className='flex items-center gap-2'>
                        <p className='text-sm font-medium'>{event.title}</p>
                        <span className='text-muted-foreground text-xs'>
                          {format(
                            new Date(event.created_at),
                            'MMM d, yyyy HH:mm'
                          )}
                        </span>
                      </div>
                      {event.description && (
                        <p className='text-muted-foreground mt-0.5 text-sm'>
                          {event.description}
                        </p>
                      )}
                      {event.performed_by_name && (
                        <p className='text-muted-foreground mt-0.5 text-xs'>
                          by {event.performed_by_name}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Note Dialog */}
      <Dialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Note</DialogTitle>
          </DialogHeader>
          <Textarea
            placeholder='Write a note about this student...'
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            rows={4}
          />
          <DialogFooter>
            <Button variant='outline' onClick={() => setNoteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => addNote.mutate(noteText)}
              disabled={!noteText.trim() || addNote.isPending}
            >
              {addNote.isPending ? 'Saving...' : 'Save Note'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Document Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Document</DialogTitle>
          </DialogHeader>
          <Textarea
            placeholder='Reason for rejection...'
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={3}
          />
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => {
                setRejectDialogOpen(false);
                setRejectDocId(null);
                setRejectReason('');
              }}
            >
              Cancel
            </Button>
            <Button
              variant='destructive'
              onClick={() => {
                if (rejectDocId) {
                  rejectDoc.mutate({
                    docId: rejectDocId,
                    reason: rejectReason
                  });
                }
              }}
              disabled={!rejectReason.trim() || rejectDoc.isPending}
            >
              {rejectDoc.isPending ? 'Rejecting...' : 'Reject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}

function StageRow({
  number,
  label,
  status,
  stage,
  documents,
  isActive,
  onTransition,
  isPending
}: {
  number: number;
  label: string;
  status: string;
  stage?: PipelineStage;
  documents: DocumentRequirement[];
  isActive: boolean;
  onTransition: (stageId: string, status: string) => void;
  isPending: boolean;
}) {
  const docsVerified = documents.filter((d) => d.status === 'VERIFIED').length;

  const availableActions: {
    label: string;
    status: string;
    icon: React.ReactNode;
  }[] = [];
  if (stage) {
    if (status === 'NOT_STARTED') {
      availableActions.push({
        label: 'Start',
        status: 'IN_PROGRESS',
        icon: <Play className='mr-2 h-3.5 w-3.5' />
      });
      availableActions.push({
        label: 'Skip',
        status: 'SKIPPED',
        icon: <SkipForward className='mr-2 h-3.5 w-3.5' />
      });
    }
    if (status === 'IN_PROGRESS') {
      availableActions.push({
        label: 'Complete',
        status: 'COMPLETED',
        icon: <CheckCircle className='mr-2 h-3.5 w-3.5' />
      });
      availableActions.push({
        label: 'Block',
        status: 'BLOCKED',
        icon: <Ban className='mr-2 h-3.5 w-3.5' />
      });
    }
    if (status === 'BLOCKED') {
      availableActions.push({
        label: 'Resume',
        status: 'IN_PROGRESS',
        icon: <Play className='mr-2 h-3.5 w-3.5' />
      });
    }
    if (status === 'SKIPPED') {
      availableActions.push({
        label: 'Start',
        status: 'IN_PROGRESS',
        icon: <Play className='mr-2 h-3.5 w-3.5' />
      });
    }
  }

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-lg border p-3 transition-colors',
        isActive && 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20'
      )}
    >
      {statusIcon[status]}
      <div className='flex min-w-0 flex-1 items-center gap-2'>
        <span className='text-muted-foreground w-5 font-mono text-xs'>
          {number}.
        </span>
        <span
          className={cn(
            'text-sm font-medium',
            status === 'NOT_STARTED' && 'text-muted-foreground'
          )}
        >
          {label}
        </span>
      </div>
      {documents.length > 0 && (
        <div className='text-muted-foreground flex items-center gap-1 text-xs'>
          <FileText className='h-3 w-3' />
          {docsVerified}/{documents.length}
        </div>
      )}
      <Badge
        variant='outline'
        className={cn(
          'text-xs',
          STAGE_STATUS_COLOR[status as keyof typeof STAGE_STATUS_COLOR]
        )}
      >
        {status.replace('_', ' ')}
      </Badge>
      {stage?.due_date && (
        <span className='text-muted-foreground hidden text-xs md:block'>
          Due {format(new Date(stage.due_date), 'MMM d')}
        </span>
      )}
      {availableActions.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' size='icon' className='h-7 w-7'>
              <MoreVertical className='h-3.5 w-3.5' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            {availableActions.map((action) => (
              <DropdownMenuItem
                key={action.status}
                onClick={() => onTransition(stage!.id, action.status)}
                disabled={isPending}
              >
                {action.icon}
                {action.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}

function DocumentRow({
  document,
  onVerify,
  onReject,
  isPending
}: {
  document: DocumentRequirement;
  onVerify: (id: string) => void;
  onReject: (id: string) => void;
  isPending: boolean;
}) {
  const docTypeLabel = document.document_type
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

  const statusVariant: Record<
    string,
    'default' | 'secondary' | 'destructive' | 'outline'
  > = {
    REQUIRED: 'outline',
    UPLOADED: 'secondary',
    VERIFIED: 'default',
    REJECTED: 'destructive',
    NOT_APPLICABLE: 'secondary'
  };

  return (
    <div className='flex items-center gap-3 rounded-lg border p-3'>
      <FileText className='text-muted-foreground h-4 w-4 shrink-0' />
      <div className='min-w-0 flex-1'>
        <p className='text-sm font-medium'>{docTypeLabel}</p>
        {document.notes && (
          <p className='text-muted-foreground truncate text-xs'>
            {document.notes}
          </p>
        )}
        {document.rejection_reason && (
          <p className='text-destructive text-xs'>
            {document.rejection_reason}
          </p>
        )}
      </div>
      <Badge variant={statusVariant[document.status] ?? 'secondary'}>
        {document.status}
      </Badge>
      {document.status === 'UPLOADED' && (
        <div className='flex gap-1'>
          <Button
            variant='ghost'
            size='icon'
            className='h-7 w-7'
            title='Verify'
            onClick={() => onVerify(document.id)}
            disabled={isPending}
          >
            <CheckCircle className='h-4 w-4 text-green-600' />
          </Button>
          <Button
            variant='ghost'
            size='icon'
            className='h-7 w-7'
            title='Reject'
            onClick={() => onReject(document.id)}
            disabled={isPending}
          >
            <X className='h-4 w-4 text-red-600' />
          </Button>
        </div>
      )}
      {document.status === 'REQUIRED' && (
        <Button variant='outline' size='sm'>
          <Upload className='mr-1 h-3 w-3' />
          Upload
        </Button>
      )}
    </div>
  );
}
