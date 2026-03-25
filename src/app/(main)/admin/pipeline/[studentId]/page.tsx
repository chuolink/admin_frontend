'use client';

import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useClientApi from '@/lib/axios/clientSide';
import PageContainer from '@/components/layout/page-container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
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
  CheckCircle,
  Circle,
  AlertTriangle,
  Clock,
  SkipForward,
  Upload,
  FileText,
  FileUp,
  User,
  Play,
  Ban,
  MessageSquarePlus,
  History,
  CreditCard,
  Plus,
  Check,
  X,
  GraduationCap,
  ChevronRight,
  ChevronDown,
  Calendar,
  Info,
  MapPin,
  Eye,
  Download,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Pencil
} from 'lucide-react';
import {
  type StudentPipeline,
  type StageInstance,
  type StageRequirement,
  type RequirementResponse,
  type JourneyEvent,
  type JourneyEventsResponse,
  type RelatedPipeline,
  type StageInstanceStatus,
  type RequirementResponseType,
  type FlowType,
  FLOW_TYPE_COLOR
} from '@/features/pipeline/types';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { toast } from 'sonner';

/* ── Constants ── */

const STATUS_DOT: Record<string, string> = {
  PENDING: 'bg-muted-foreground/30',
  ACTIVE: 'bg-blue-500 ring-4 ring-blue-500/20',
  COMPLETED: 'bg-green-500',
  BLOCKED: 'bg-red-500 ring-4 ring-red-500/20 animate-pulse',
  SKIPPED: 'bg-amber-400'
};

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Pending',
  ACTIVE: 'In Progress',
  COMPLETED: 'Completed',
  BLOCKED: 'Blocked',
  SKIPPED: 'Skipped'
};

const REQ_STATUS_COLOR: Record<string, string> = {
  PENDING: 'bg-muted text-muted-foreground',
  SUBMITTED:
    'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  APPROVED:
    'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  REJECTED: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
};

const PHASE_LABEL: Record<string, string> = {
  CONSULTATION: 'Consultation',
  PRE_APPLICATION: 'Pre-Application',
  POST_APPLICATION: 'Post-Application',
  ORIENTATION: 'Orientation',
  DEPARTED: 'Departed',
  MONITORING: 'Monitoring'
};

/* ── Main Page ── */

export default function PipelineDetailPage() {
  const params = useParams<{ studentId: string }>();
  const router = useRouter();
  const { api } = useClientApi();
  const queryClient = useQueryClient();
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [addReqDialogOpen, setAddReqDialogOpen] = useState(false);
  const [addReqStageId, setAddReqStageId] = useState<string | null>(null);
  const [rejectReqDialogOpen, setRejectReqDialogOpen] = useState(false);
  const [rejectReqId, setRejectReqId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const paramId = params.studentId;
  const isStudentId = paramId?.startsWith('student_');

  const { data: studentPipelinesData } = useQuery<{
    results: StudentPipeline[];
  }>({
    queryKey: ['student-pipelines-lookup', paramId],
    queryFn: async () => {
      if (!api) throw new Error('API not initialized');
      const response = await api.get('/admin/pipelines/', {
        params: { student: paramId, page_size: 1 }
      });
      return response.data;
    },
    enabled: !!api && !!isStudentId
  });

  const resolvedPipelineId = isStudentId
    ? studentPipelinesData?.results?.[0]?.id
    : paramId;

  React.useEffect(() => {
    if (isStudentId && resolvedPipelineId && resolvedPipelineId !== paramId) {
      router.replace(`/admin/pipeline/${resolvedPipelineId}`);
    }
  }, [isStudentId, resolvedPipelineId, paramId, router]);

  const pipelineId = resolvedPipelineId;

  const { data: pipeline, isLoading } = useQuery<StudentPipeline>({
    queryKey: ['pipeline', pipelineId],
    queryFn: async () => {
      if (!api) throw new Error('API not initialized');
      return (await api.get(`/admin/pipelines/${pipelineId}/`)).data;
    },
    enabled: !!api && !!pipelineId && !isStudentId
  });

  const { data: journeyData } = useQuery<JourneyEventsResponse>({
    queryKey: ['pipeline-journey', pipelineId],
    queryFn: async () => {
      if (!api) throw new Error('API not initialized');
      return (await api.get(`/admin/pipelines/${pipelineId}/journey/`)).data;
    },
    enabled: !!api && !!pipelineId && !isStudentId
  });

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ['pipeline', pipelineId] });
    queryClient.invalidateQueries({
      queryKey: ['pipeline-journey', pipelineId]
    });
  };

  /* ── Mutations ── */

  const stageComplete = useMutation({
    mutationFn: async ({
      stageId,
      notes
    }: {
      stageId: string;
      notes?: string;
    }) => {
      if (!api) throw new Error('API not initialized');
      return (
        await api.post(
          `/admin/stage-instances/${stageId}/complete/`,
          notes ? { notes } : {}
        )
      ).data;
    },
    onSuccess: () => {
      invalidateAll();
      toast.success('Stage completed');
    },
    onError: () => toast.error('Failed to complete stage')
  });

  const stageSkip = useMutation({
    mutationFn: async ({
      stageId,
      notes
    }: {
      stageId: string;
      notes?: string;
    }) => {
      if (!api) throw new Error('API not initialized');
      return (
        await api.post(
          `/admin/stage-instances/${stageId}/skip/`,
          notes ? { notes } : {}
        )
      ).data;
    },
    onSuccess: () => {
      invalidateAll();
      toast.success('Stage skipped');
    },
    onError: () => toast.error('Failed to skip stage')
  });

  const stageActivate = useMutation({
    mutationFn: async (stageId: string) => {
      if (!api) throw new Error('API not initialized');
      return (
        await api.patch(`/admin/stage-instances/${stageId}/`, {
          status: 'ACTIVE'
        })
      ).data;
    },
    onSuccess: () => {
      invalidateAll();
      toast.success('Stage activated');
    },
    onError: () => toast.error('Failed to activate stage')
  });

  const stageBlock = useMutation({
    mutationFn: async ({
      stageId,
      notes
    }: {
      stageId: string;
      notes?: string;
    }) => {
      if (!api) throw new Error('API not initialized');
      return (
        await api.patch(`/admin/stage-instances/${stageId}/`, {
          status: 'BLOCKED',
          ...(notes ? { notes } : {})
        })
      ).data;
    },
    onSuccess: () => {
      invalidateAll();
      toast.success('Stage blocked');
    },
    onError: () => toast.error('Failed to block stage')
  });

  const approveRequirement = useMutation({
    mutationFn: async (reqId: string) => {
      if (!api) throw new Error('API not initialized');
      return (await api.post(`/admin/requirements/${reqId}/approve/`)).data;
    },
    onSuccess: () => {
      invalidateAll();
      toast.success('Requirement approved');
    },
    onError: () => toast.error('Failed to approve requirement')
  });

  const rejectRequirement = useMutation({
    mutationFn: async ({
      reqId,
      reason
    }: {
      reqId: string;
      reason: string;
    }) => {
      if (!api) throw new Error('API not initialized');
      return (
        await api.post(`/admin/requirements/${reqId}/reject/`, {
          rejection_reason: reason
        })
      ).data;
    },
    onSuccess: () => {
      invalidateAll();
      setRejectReqDialogOpen(false);
      setRejectReqId(null);
      setRejectReason('');
      toast.success('Requirement rejected');
    },
    onError: () => toast.error('Failed to reject requirement')
  });

  const addRequirement = useMutation({
    mutationFn: async (data: {
      stageId: string;
      response_type: string;
      title: string;
      description?: string;
      is_required?: boolean;
      owner?: string;
    }) => {
      if (!api) throw new Error('API not initialized');
      const { stageId, ...payload } = data;
      return (
        await api.post(
          `/admin/stage-instances/${stageId}/add-requirement/`,
          payload
        )
      ).data;
    },
    onSuccess: () => {
      invalidateAll();
      setAddReqDialogOpen(false);
      setAddReqStageId(null);
      toast.success('Requirement added. Student has been notified.');
    },
    onError: () => toast.error('Failed to add requirement')
  });

  const submitOnBehalf = useMutation({
    mutationFn: async ({
      reqId,
      textResponse,
      fileResponse,
      scheduleResponse
    }: {
      reqId: string;
      textResponse?: string;
      fileResponse?: File;
      scheduleResponse?: string;
    }) => {
      if (!api) throw new Error('API not initialized');
      if (fileResponse) {
        const formData = new FormData();
        formData.append('file_response', fileResponse);
        return (
          await api.post(
            `/admin/requirements/${reqId}/submit_on_behalf/`,
            formData,
            {
              headers: { 'Content-Type': 'multipart/form-data' }
            }
          )
        ).data;
      }
      const body: Record<string, string> = {};
      if (textResponse) body.text_response = textResponse;
      if (scheduleResponse) body.schedule_response = scheduleResponse;
      return (
        await api.post(`/admin/requirements/${reqId}/submit_on_behalf/`, body)
      ).data;
    },
    onSuccess: () => {
      invalidateAll();
      toast.success('Answered on behalf of student');
    },
    onError: () => toast.error('Failed to submit on behalf')
  });

  const updateRequirement = useMutation({
    mutationFn: async ({
      reqId,
      data
    }: {
      reqId: string;
      data: Record<string, unknown>;
    }) => {
      if (!api) throw new Error('API not initialized');
      return (await api.patch(`/admin/requirements/${reqId}/`, data)).data;
    },
    onSuccess: () => invalidateAll(),
    onError: () => toast.error('Failed to update requirement')
  });

  const addNote = useMutation({
    mutationFn: async (description: string) => {
      if (!api) throw new Error('API not initialized');
      return (
        await api.post('/admin/journey-events/', {
          student: pipeline?.student,
          pipeline: pipeline?.id,
          event_type: 'NOTE',
          title: 'Note added',
          description
        })
      ).data;
    },
    onSuccess: () => {
      invalidateAll();
      setNoteDialogOpen(false);
      setNoteText('');
      toast.success('Note added');
    },
    onError: () => toast.error('Failed to add note')
  });

  const commitPipeline = useMutation({
    mutationFn: async () => {
      if (!api) throw new Error('API not initialized');
      return (await api.post(`/admin/pipelines/${pipeline?.id}/commit/`)).data;
    },
    onSuccess: () => {
      invalidateAll();
      toast.success('Committed');
    },
    onError: () => toast.error('Failed to commit')
  });

  const uncommitPipeline = useMutation({
    mutationFn: async () => {
      if (!api) throw new Error('API not initialized');
      return (await api.post(`/admin/pipelines/${pipeline?.id}/uncommit/`))
        .data;
    },
    onSuccess: () => {
      invalidateAll();
      toast.success('Uncommitted');
    },
    onError: () => toast.error('Failed to uncommit')
  });

  const isStagePending =
    stageComplete.isPending ||
    stageSkip.isPending ||
    stageActivate.isPending ||
    stageBlock.isPending;
  const isReqPending =
    approveRequirement.isPending || rejectRequirement.isPending;

  /* ── Loading / Not Found ── */

  if (isLoading) {
    return (
      <PageContainer className='w-full'>
        <div className='flex items-center justify-center py-20'>
          <div className='text-muted-foreground h-8 w-8 animate-spin rounded-full border-2 border-current border-t-transparent' />
        </div>
      </PageContainer>
    );
  }

  if (!pipeline) {
    return (
      <PageContainer className='w-full'>
        <div className='flex flex-col items-center justify-center py-20'>
          <p className='text-muted-foreground mb-4'>Pipeline not found.</p>
          <Link href='/admin/pipeline'>
            <Button variant='outline' size='sm'>
              Back to Pipeline
            </Button>
          </Link>
        </div>
      </PageContainer>
    );
  }

  const stageInstances = pipeline.stage_instances ?? [];
  const sortedStages = stageInstances
    .slice()
    .sort((a, b) => a.stage_order - b.stage_order);
  const totalStages = stageInstances.length;
  const completedCount = stageInstances.filter(
    (s) => s.status === 'COMPLETED'
  ).length;
  const progress =
    totalStages > 0 ? Math.round((completedCount / totalStages) * 100) : 0;
  const activeStage = stageInstances.find((s) => s.status === 'ACTIVE');
  const journeyEvents = journeyData?.results ?? [];

  return (
    <PageContainer className='w-full'>
      <div className='w-full space-y-6'>
        {/* ── Header ── */}
        <div className='flex items-start gap-4'>
          <Link href='/admin/pipeline'>
            <Button variant='ghost' size='icon' className='mt-1 h-8 w-8'>
              <ArrowLeft className='h-4 w-4' />
            </Button>
          </Link>
          <div className='min-w-0 flex-1'>
            <div className='flex items-center gap-2'>
              <h1 className='truncate text-xl font-bold tracking-tight'>
                {pipeline.student_name ?? 'Unknown Student'}
              </h1>
              {pipeline.flow_type && (
                <Badge
                  className={cn(
                    'px-1.5 py-0 text-[10px]',
                    FLOW_TYPE_COLOR[pipeline.flow_type]
                  )}
                >
                  {pipeline.flow_type === 'LOCAL' ? 'Local' : 'Abroad'}
                </Badge>
              )}
              {pipeline.is_committed && (
                <Badge className='bg-green-100 px-1.5 py-0 text-[10px] text-green-700 dark:bg-green-900 dark:text-green-300'>
                  Committed
                </Badge>
              )}
            </div>
            <div className='text-muted-foreground mt-0.5 flex flex-wrap items-center gap-2 text-sm'>
              <span>{pipeline.university_name}</span>
              {pipeline.country_name && <span className='opacity-50'>|</span>}
              {pipeline.country_name && <span>{pipeline.country_name}</span>}
              {pipeline.app_id && (
                <Badge
                  variant='outline'
                  className='px-1 py-0 font-mono text-[10px]'
                >
                  {pipeline.app_id}
                </Badge>
              )}
              {(pipeline.application_id || pipeline.application) && (
                <Link
                  href={`/admin/applications/${pipeline.application_id || pipeline.application}`}
                >
                  <Badge
                    variant='outline'
                    className='hover:bg-primary/10 hover:text-primary cursor-pointer px-1.5 py-0.5 text-[10px] transition-colors'
                  >
                    <ExternalLink className='mr-1 h-2.5 w-2.5' />
                    View Application
                  </Badge>
                </Link>
              )}
            </div>
            {/* Courses */}
            {(pipeline as any).courses?.length > 0 && (
              <div className='mt-1.5 flex flex-wrap items-center gap-1.5'>
                <span className='text-muted-foreground text-xs'>Courses:</span>
                {(
                  (pipeline as any).courses as { id: string; name: string }[]
                ).map((c) => (
                  <Badge
                    key={c.id}
                    variant='secondary'
                    className='px-1.5 py-0 text-[10px]'
                  >
                    {c.name}
                  </Badge>
                ))}
              </div>
            )}
          </div>
          <div className='flex shrink-0 items-center gap-2'>
            {pipeline.is_committed ? (
              <Button
                variant='ghost'
                size='sm'
                onClick={() => uncommitPipeline.mutate()}
                disabled={uncommitPipeline.isPending}
              >
                Uncommit
              </Button>
            ) : (
              <Button
                size='sm'
                onClick={() => commitPipeline.mutate()}
                disabled={commitPipeline.isPending}
              >
                <GraduationCap className='mr-1.5 h-3.5 w-3.5' />
                Commit
              </Button>
            )}
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

        {/* ── Progress overview ── */}
        <div className='flex items-center gap-4 rounded-lg border p-4'>
          {/* Progress ring */}
          <div className='relative flex h-14 w-14 shrink-0 items-center justify-center'>
            <svg className='h-14 w-14 -rotate-90' viewBox='0 0 56 56'>
              <circle
                cx='28'
                cy='28'
                r='24'
                fill='none'
                strokeWidth='4'
                className='stroke-muted'
              />
              <circle
                cx='28'
                cy='28'
                r='24'
                fill='none'
                strokeWidth='4'
                className='stroke-blue-500 transition-all duration-500'
                strokeLinecap='round'
                strokeDasharray={2 * Math.PI * 24}
                strokeDashoffset={2 * Math.PI * 24 * (1 - progress / 100)}
              />
            </svg>
            <span className='absolute text-xs font-bold'>{progress}%</span>
          </div>

          <div className='min-w-0 flex-1'>
            <div className='flex items-center justify-between'>
              <p className='text-sm font-medium'>
                {completedCount} of {totalStages} stages complete
              </p>
              <Badge variant='outline' className='text-xs'>
                {PHASE_LABEL[pipeline.current_phase] ?? pipeline.current_phase}
              </Badge>
            </div>
            {/* Mini stage dots */}
            <div className='mt-2 flex items-center gap-1'>
              {sortedStages.map((s) => (
                <div
                  key={s.id}
                  className={cn(
                    'h-2 flex-1 rounded-full transition-colors',
                    STATUS_DOT[s.status ?? 'PENDING']?.replace(/ring[^ ]*/g, '')
                  )}
                  title={`${s.stage_order}. ${s.stage_name}`}
                />
              ))}
            </div>
            <div className='text-muted-foreground mt-1.5 flex items-center gap-4 text-xs'>
              {pipeline.consultant_name && (
                <span className='flex items-center gap-1'>
                  <User className='h-3 w-3' />
                  {pipeline.consultant_name}
                </span>
              )}
              <span className='flex items-center gap-1'>
                <Clock className='h-3 w-3' />
                Started {format(new Date(pipeline.started_at), 'MMM d, yyyy')}
              </span>
            </div>
          </div>
        </div>

        {/* ── Main Layout ── */}
        <div className='grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]'>
          {/* Left: Stage timeline */}
          <div className='space-y-0'>
            {sortedStages.map((stage, idx) => (
              <StageRow
                key={stage.id}
                stage={stage}
                isFirst={idx === 0}
                isLast={idx === sortedStages.length - 1}
                onComplete={(id) => stageComplete.mutate({ stageId: id })}
                onSkip={(id) => stageSkip.mutate({ stageId: id })}
                onActivate={(id) => stageActivate.mutate(id)}
                onBlock={(id) => stageBlock.mutate({ stageId: id })}
                onApproveReq={(id) => approveRequirement.mutate(id)}
                onRejectReq={(id) => {
                  setRejectReqId(id);
                  setRejectReqDialogOpen(true);
                }}
                onAddReq={(id) => {
                  setAddReqStageId(id);
                  setAddReqDialogOpen(true);
                }}
                onSubmitOnBehalf={(reqId, data) =>
                  submitOnBehalf.mutate({ reqId, ...data })
                }
                isStagePending={isStagePending}
                isReqPending={isReqPending}
              />
            ))}
          </div>

          {/* Right sidebar */}
          <div className='space-y-4'>
            {/* Related pipelines */}
            {pipeline.related_pipelines &&
              pipeline.related_pipelines.length > 0 && (
                <Card>
                  <CardHeader className='pb-2'>
                    <CardTitle className='text-muted-foreground text-xs font-semibold tracking-wide uppercase'>
                      Related Applications
                    </CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-2'>
                    {pipeline.related_pipelines.map((rp) => (
                      <Link
                        key={rp.id}
                        href={`/admin/pipeline/${rp.id}`}
                        className={cn(
                          'hover:bg-accent/50 flex items-center gap-2 rounded-md border p-2 text-xs transition-colors',
                          rp.id === pipeline.id &&
                            'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20'
                        )}
                      >
                        <div className='min-w-0 flex-1'>
                          <p className='truncate font-medium'>
                            {rp.university_name ?? 'Unknown'}
                          </p>
                          <p className='text-muted-foreground'>
                            {rp.completed_stages ?? 0}/{rp.total_stages ?? 0}{' '}
                            stages
                          </p>
                        </div>
                        {rp.flow_type && (
                          <Badge
                            className={cn(
                              'px-1 py-0 text-[9px]',
                              FLOW_TYPE_COLOR[rp.flow_type]
                            )}
                          >
                            {rp.flow_type === 'LOCAL' ? 'L' : 'A'}
                          </Badge>
                        )}
                      </Link>
                    ))}
                  </CardContent>
                </Card>
              )}

            {/* Activity */}
            <Card>
              <CardHeader className='pb-2'>
                <div className='flex items-center justify-between'>
                  <CardTitle className='text-muted-foreground text-xs font-semibold tracking-wide uppercase'>
                    Activity
                  </CardTitle>
                  <Button
                    variant='ghost'
                    size='sm'
                    className='h-6 text-[10px]'
                    onClick={() => setNoteDialogOpen(true)}
                  >
                    <Plus className='mr-0.5 h-3 w-3' /> Note
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {journeyEvents.length === 0 ? (
                  <p className='text-muted-foreground py-4 text-center text-xs'>
                    No activity yet
                  </p>
                ) : (
                  <div className='max-h-[400px] space-y-3 overflow-y-auto pr-1'>
                    {journeyEvents.slice(0, 20).map((event) => (
                      <div key={event.id} className='flex gap-2'>
                        <div className='bg-muted-foreground/40 mt-1 h-1.5 w-1.5 shrink-0 rounded-full' />
                        <div className='min-w-0'>
                          <p className='text-xs leading-tight font-medium'>
                            {event.title}
                          </p>
                          {event.description && (
                            <p className='text-muted-foreground line-clamp-2 text-[11px]'>
                              {event.description}
                            </p>
                          )}
                          <p className='text-muted-foreground mt-0.5 text-[10px]'>
                            {format(new Date(event.created_at), 'MMM d, HH:mm')}
                          </p>
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

      {/* ── Dialogs ── */}

      {/* Add Note */}
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
              onClick={() => addNote.mutate(noteText)}
              disabled={!noteText.trim() || addNote.isPending}
            >
              {addNote.isPending ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Requirement */}
      <Dialog open={rejectReqDialogOpen} onOpenChange={setRejectReqDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Requirement</DialogTitle>
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
                setRejectReqDialogOpen(false);
                setRejectReqId(null);
                setRejectReason('');
              }}
            >
              Cancel
            </Button>
            <Button
              variant='destructive'
              onClick={() => {
                if (rejectReqId)
                  rejectRequirement.mutate({
                    reqId: rejectReqId,
                    reason: rejectReason
                  });
              }}
              disabled={!rejectReason.trim() || rejectRequirement.isPending}
            >
              {rejectRequirement.isPending ? 'Rejecting...' : 'Reject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Requirement */}
      <AddRequirementDialog
        open={addReqDialogOpen}
        onOpenChange={setAddReqDialogOpen}
        stageId={addReqStageId}
        isPending={addRequirement.isPending}
        onSubmit={(data) => {
          if (addReqStageId)
            addRequirement.mutate({ stageId: addReqStageId, ...data });
        }}
      />
    </PageContainer>
  );
}

/* ================================================================
   Stage Row — timeline-style with vertical connector line
   ================================================================ */

function StageRow({
  stage,
  isFirst,
  isLast,
  onComplete,
  onSkip,
  onActivate,
  onBlock,
  onApproveReq,
  onRejectReq,
  onAddReq,
  onSubmitOnBehalf,
  isStagePending,
  isReqPending
}: {
  stage: StageInstance;
  isFirst: boolean;
  isLast: boolean;
  onComplete: (id: string) => void;
  onSkip: (id: string) => void;
  onActivate: (id: string) => void;
  onBlock: (id: string) => void;
  onApproveReq: (id: string) => void;
  onRejectReq: (id: string) => void;
  onAddReq: (id: string) => void;
  onSubmitOnBehalf: (
    reqId: string,
    data: {
      textResponse?: string;
      fileResponse?: File;
      scheduleResponse?: string;
    }
  ) => void;
  isStagePending: boolean;
  isReqPending: boolean;
}) {
  const status = stage.status ?? 'PENDING';
  const isActive = status === 'ACTIVE';
  const isBlocked = status === 'BLOCKED';
  const [expanded, setExpanded] = useState(isActive || isBlocked);
  const requirements = stage.requirements ?? [];
  const summary = stage.requirements_summary;

  return (
    <div className='flex gap-4'>
      {/* Timeline connector */}
      <div className='flex flex-col items-center'>
        {/* Top line */}
        <div
          className={cn(
            'w-px flex-1',
            isFirst ? 'bg-transparent' : 'bg-border'
          )}
        />
        {/* Dot */}
        <div
          className={cn(
            'my-1 h-3 w-3 shrink-0 rounded-full',
            STATUS_DOT[status]
          )}
        />
        {/* Bottom line */}
        <div
          className={cn('w-px flex-1', isLast ? 'bg-transparent' : 'bg-border')}
        />
      </div>

      {/* Content */}
      <div
        className={cn(
          'mb-1 min-w-0 flex-1 rounded-lg border py-2.5 pr-3 pl-3 transition-colors',
          isActive &&
            'border-blue-200 bg-blue-50/30 dark:border-blue-900 dark:bg-blue-950/20',
          isBlocked &&
            'border-red-200 bg-red-50/30 dark:border-red-900 dark:bg-red-950/20'
        )}
      >
        {/* Stage header */}
        <button
          type='button'
          className='flex w-full items-center gap-2 text-left'
          onClick={() => setExpanded(!expanded)}
        >
          <span className='text-muted-foreground w-5 shrink-0 text-right font-mono text-xs'>
            {stage.stage_order}
          </span>
          <span
            className={cn(
              'flex-1 truncate text-sm font-medium',
              status === 'PENDING' && 'text-muted-foreground'
            )}
          >
            {stage.stage_name}
          </span>

          {/* Requirement summary pills */}
          {summary && summary.total > 0 && (
            <div className='hidden items-center gap-1 sm:flex'>
              {summary.approved + summary.submitted > 0 && (
                <span className='flex h-5 items-center gap-0.5 rounded-full bg-green-100 px-1.5 text-[10px] font-medium text-green-700 dark:bg-green-900/40 dark:text-green-300'>
                  <Check className='h-2.5 w-2.5' />{' '}
                  {summary.approved + summary.submitted} answered
                </span>
              )}
              {summary.rejected > 0 && (
                <span className='flex h-5 items-center gap-0.5 rounded-full bg-red-100 px-1.5 text-[10px] font-medium text-red-700 dark:bg-red-900/40 dark:text-red-300'>
                  <X className='h-2.5 w-2.5' /> {summary.rejected}
                </span>
              )}
              {summary.pending > 0 && (
                <span className='text-muted-foreground text-[10px]'>
                  {summary.pending} unanswered
                </span>
              )}
            </div>
          )}

          <Badge
            variant='outline'
            className={cn(
              'shrink-0 px-1.5 py-0 text-[10px]',
              status === 'COMPLETED' &&
                'border-green-300 text-green-700 dark:border-green-800 dark:text-green-400',
              status === 'ACTIVE' &&
                'border-blue-300 text-blue-700 dark:border-blue-800 dark:text-blue-400',
              status === 'BLOCKED' &&
                'border-red-300 text-red-700 dark:border-red-800 dark:text-red-400',
              status === 'SKIPPED' &&
                'border-amber-300 text-amber-700 dark:border-amber-800 dark:text-amber-400'
            )}
          >
            {STATUS_LABEL[status] ?? status}
          </Badge>

          {expanded ? (
            <ChevronDown className='text-muted-foreground h-3.5 w-3.5 shrink-0' />
          ) : (
            <ChevronRight className='text-muted-foreground h-3.5 w-3.5 shrink-0' />
          )}
        </button>

        {/* Expanded content */}
        {expanded && (
          <div className='mt-3 space-y-3 pl-6'>
            {stage.description && (
              <p className='text-muted-foreground text-xs'>
                {stage.description}
              </p>
            )}

            {/* Requirements */}
            {requirements.length > 0 && (
              <div className='space-y-2'>
                {requirements
                  .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                  .map((req) => (
                    <RequirementCard
                      key={req.id}
                      requirement={req}
                      onApprove={onApproveReq}
                      onReject={onRejectReq}
                      onSubmitOnBehalf={onSubmitOnBehalf}
                      isPending={isReqPending}
                    />
                  ))}
              </div>
            )}

            {/* Actions */}
            <div className='flex items-center gap-2 pt-1'>
              <Button
                variant='ghost'
                size='sm'
                className='text-muted-foreground h-7 text-xs'
                onClick={() => onAddReq(stage.id)}
              >
                <Plus className='mr-1 h-3 w-3' /> Add requirement
              </Button>
              <div className='flex-1' />
              <StageActions
                stage={stage}
                onComplete={onComplete}
                onSkip={onSkip}
                onActivate={onActivate}
                onBlock={onBlock}
                isPending={isStagePending}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Stage Actions ── */

function StageActions({
  stage,
  onComplete,
  onSkip,
  onActivate,
  onBlock,
  isPending
}: {
  stage: StageInstance;
  onComplete: (id: string) => void;
  onSkip: (id: string) => void;
  onActivate: (id: string) => void;
  onBlock: (id: string) => void;
  isPending: boolean;
}) {
  const status = stage.status ?? 'PENDING';

  if (status === 'COMPLETED') return null;

  return (
    <div className='flex items-center gap-1'>
      {status === 'PENDING' && (
        <>
          <Button
            size='sm'
            className='h-7 text-xs'
            onClick={() => onActivate(stage.id)}
            disabled={isPending}
          >
            <Play className='mr-1 h-3 w-3' /> Start
          </Button>
          <Button
            variant='ghost'
            size='sm'
            className='h-7 text-xs'
            onClick={() => onSkip(stage.id)}
            disabled={isPending}
          >
            <SkipForward className='mr-1 h-3 w-3' /> Skip
          </Button>
        </>
      )}
      {status === 'ACTIVE' && (
        <>
          <Button
            size='sm'
            className='h-7 bg-green-600 text-xs hover:bg-green-700'
            onClick={() => onComplete(stage.id)}
            disabled={isPending}
          >
            <CheckCircle className='mr-1 h-3 w-3' /> Complete
          </Button>
          <Button
            variant='destructive'
            size='sm'
            className='h-7 text-xs'
            onClick={() => onBlock(stage.id)}
            disabled={isPending}
          >
            <Ban className='mr-1 h-3 w-3' /> Block
          </Button>
        </>
      )}
      {status === 'BLOCKED' && (
        <Button
          size='sm'
          className='h-7 text-xs'
          onClick={() => onActivate(stage.id)}
          disabled={isPending}
        >
          <Play className='mr-1 h-3 w-3' /> Resume
        </Button>
      )}
      {status === 'SKIPPED' && (
        <Button
          variant='outline'
          size='sm'
          className='h-7 text-xs'
          onClick={() => onActivate(stage.id)}
          disabled={isPending}
        >
          <Play className='mr-1 h-3 w-3' /> Reactivate
        </Button>
      )}
    </div>
  );
}

/* ================================================================
   Requirement Card — clean Q&A layout
   ================================================================ */

function RequirementCard({
  requirement,
  onApprove,
  onReject,
  onSubmitOnBehalf,
  isPending
}: {
  requirement: StageRequirement;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onSubmitOnBehalf: (
    reqId: string,
    data: {
      textResponse?: string;
      fileResponse?: File;
      scheduleResponse?: string;
    }
  ) => void;
  isPending: boolean;
}) {
  const [showHistory, setShowHistory] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [inputText, setInputText] = useState('');
  const [inputFile, setInputFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const updateFileRef = useRef<HTMLInputElement>(null);
  const status = requirement.status ?? 'PENDING';
  const latest = requirement.latest_response;
  const responses = requirement.responses ?? [];
  const needsReview = requirement.requires_review;
  const isStaffOwned = requirement.owner === 'staff';
  const isAnswered =
    status === 'APPROVED' || (status === 'SUBMITTED' && !needsReview);
  const isWaitingReview = status === 'SUBMITTED' && needsReview;
  const isRejected = status === 'REJECTED';
  const needsInput = status === 'PENDING' || isRejected;
  const hasContent =
    latest && hasResponseContent(latest, requirement.response_type);

  const typeIcon: Record<string, React.ReactNode> = {
    DOCUMENT: <FileUp className='h-3.5 w-3.5' />,
    TEXT: <FileText className='h-3.5 w-3.5' />,
    SCHEDULE: <Calendar className='h-3.5 w-3.5' />,
    INFO: <Info className='h-3.5 w-3.5' />
  };

  // INFO type = highlight message — render as a prominent card, no input
  if (requirement.response_type === 'INFO') {
    return (
      <div className='border-primary/30 bg-primary/[0.06] rounded-lg border px-4 py-3'>
        <div className='flex items-start gap-2.5'>
          <Info className='text-primary mt-0.5 h-4 w-4 shrink-0' />
          <div className='min-w-0'>
            <p className='text-sm font-medium'>{requirement.title}</p>
            {requirement.description && (
              <p className='text-muted-foreground mt-0.5 text-xs leading-relaxed'>
                {requirement.description}
              </p>
            )}
            <p className='text-muted-foreground/60 mt-1 text-[10px]'>
              Visible to student as a highlight
            </p>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = () => {
    onSubmitOnBehalf(requirement.id, {
      textResponse:
        requirement.response_type === 'TEXT' ? inputText : undefined,
      fileResponse:
        requirement.response_type === 'DOCUMENT'
          ? inputFile || undefined
          : undefined,
      scheduleResponse:
        requirement.response_type === 'SCHEDULE'
          ? requirement.scheduled_date || undefined
          : undefined
    });
    setInputText('');
    setInputFile(null);
    setIsUpdating(false);
  };

  const handleUpdateFile = (file: File) => {
    onSubmitOnBehalf(requirement.id, { fileResponse: file });
    setIsUpdating(false);
  };

  // Status badge logic
  const getBadge = () => {
    if (isRejected)
      return (
        <Badge
          className={cn(
            'px-1.5 py-0 text-[10px]',
            REQ_STATUS_COLOR['REJECTED']
          )}
        >
          Rejected
        </Badge>
      );
    if (isWaitingReview)
      return (
        <Badge
          className={cn(
            'px-1.5 py-0 text-[10px]',
            REQ_STATUS_COLOR['SUBMITTED']
          )}
        >
          Under review
        </Badge>
      );
    if (isStaffOwned && needsInput)
      return (
        <Badge
          variant='outline'
          className='border-amber-200 px-1.5 py-0 text-[10px] text-amber-500'
        >
          Waiting
        </Badge>
      );
    if (isAnswered && hasContent)
      return (
        <span className='text-green-500'>
          <Check className='h-3.5 w-3.5' />
        </span>
      );
    return null;
  };

  return (
    <div className='bg-background rounded-lg border'>
      {/* Header */}
      <div className='flex items-center gap-2.5 px-3 py-2'>
        <span className='text-muted-foreground'>
          {typeIcon[requirement.response_type] ?? (
            <FileText className='h-3.5 w-3.5' />
          )}
        </span>
        <span className='flex-1 truncate text-sm font-medium'>
          {requirement.title}
        </span>
        {requirement.is_required && (
          <span className='text-xs font-bold text-red-500'>*</span>
        )}
        {!requirement.from_template && (
          <Badge
            variant='outline'
            className='border-amber-200 px-1 py-0 text-[9px] text-amber-600'
          >
            Ad-hoc
          </Badge>
        )}
        {needsReview && (
          <Badge
            variant='outline'
            className='border-blue-200 px-1 py-0 text-[9px] text-blue-500'
          >
            Review
          </Badge>
        )}
        {getBadge()}
        {isWaitingReview && (
          <div className='flex gap-0.5'>
            <Button
              variant='ghost'
              size='icon'
              className='h-6 w-6'
              title='Approve'
              onClick={() => onApprove(requirement.id)}
              disabled={isPending}
            >
              <Check className='h-3.5 w-3.5 text-green-600' />
            </Button>
            <Button
              variant='ghost'
              size='icon'
              className='h-6 w-6'
              title='Reject'
              onClick={() => onReject(requirement.id)}
              disabled={isPending}
            >
              <X className='h-3.5 w-3.5 text-red-600' />
            </Button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className='border-t px-3 py-2'>
        {requirement.description && needsInput && (
          <p className='text-muted-foreground mb-1.5 text-[11px]'>
            {requirement.description}
          </p>
        )}

        {/* Has content — show the response with View / Update actions */}
        {hasContent ? (
          <div>
            {/* Document: file preview row with View + Update */}
            {requirement.response_type === 'DOCUMENT' ? (
              <div className='space-y-1.5'>
                <div className='bg-muted/50 flex items-center gap-2 rounded-md px-2.5 py-2'>
                  <FileText className='h-4 w-4 shrink-0 text-blue-500' />
                  <span className='flex-1 truncate text-xs font-medium'>
                    {requirement.title}
                  </span>
                  <a
                    href={
                      latest!.file_response_url || latest!.file_response || ''
                    }
                    target='_blank'
                    rel='noopener noreferrer'
                  >
                    <Button
                      variant='ghost'
                      size='sm'
                      className='h-6 px-2 text-xs'
                    >
                      <Eye className='mr-1 h-3 w-3' /> View
                    </Button>
                  </a>
                  <input
                    ref={updateFileRef}
                    type='file'
                    className='hidden'
                    accept={
                      requirement.accepted_file_types?.join(',') || undefined
                    }
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleUpdateFile(file);
                      e.target.value = '';
                    }}
                  />
                  <Button
                    variant='ghost'
                    size='sm'
                    className='h-6 px-2 text-xs'
                    disabled={isPending}
                    onClick={() => updateFileRef.current?.click()}
                  >
                    <Upload className='mr-1 h-3 w-3' /> Update
                  </Button>
                </div>
                {latest!.submitted_by_name && (
                  <p className='text-muted-foreground text-[10px]'>
                    by{' '}
                    <span className='text-foreground/70'>
                      {latest!.submitted_by_name}
                    </span>
                  </p>
                )}
              </div>
            ) : /* Text / Schedule: show content + who answered + edit button */
            isUpdating ? (
              /* Edit mode — show input to update the value */
              <div className='space-y-1.5'>
                {(requirement.response_type === 'TEXT' ||
                  requirement.response_type === 'TEXTAREA' ||
                  requirement.response_type === 'NUMBER' ||
                  requirement.response_type === 'DATE') && (
                  <div className='flex gap-1.5'>
                    <input
                      type={
                        requirement.response_type === 'NUMBER'
                          ? 'number'
                          : requirement.response_type === 'DATE'
                            ? 'date'
                            : 'text'
                      }
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && inputText.trim())
                          handleSubmit();
                      }}
                      placeholder='Update value...'
                      className='placeholder:text-muted-foreground/50 focus:ring-ring flex-1 rounded-md border bg-transparent px-2.5 py-1.5 text-xs [color-scheme:dark] focus:ring-1 focus:outline-none'
                      autoFocus
                    />
                    <Button
                      size='sm'
                      className='h-7 px-2.5 text-[11px]'
                      disabled={isPending || !inputText.trim()}
                      onClick={handleSubmit}
                    >
                      Save
                    </Button>
                    <Button
                      size='sm'
                      variant='ghost'
                      className='h-7 px-2 text-[11px]'
                      onClick={() => {
                        setIsUpdating(false);
                        setInputText('');
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
                {requirement.response_type === 'SCHEDULE' && (
                  <div className='space-y-1.5'>
                    <ScheduleInput
                      scheduledDate={
                        latest?.schedule_response || requirement.scheduled_date
                      }
                      scheduledLocation={requirement.scheduled_location}
                      isPending={isPending}
                      onSubmit={(date, location) => {
                        // Update location on requirement + submit schedule response
                        updateRequirement.mutate({
                          reqId: requirement.id,
                          data: {
                            scheduled_date: date,
                            scheduled_location: location || ''
                          }
                        });
                        onSubmitOnBehalf(requirement.id, {
                          scheduleResponse: date
                        });
                        setIsUpdating(false);
                      }}
                    />
                    <Button
                      size='sm'
                      variant='ghost'
                      className='h-7 px-2 text-[11px]'
                      onClick={() => setIsUpdating(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <div className='flex items-start justify-between gap-2'>
                  <ResponseContent
                    response={latest!}
                    type={requirement.response_type}
                    title={requirement.title}
                  />
                  <Button
                    size='sm'
                    variant='ghost'
                    className='text-muted-foreground hover:text-foreground h-6 shrink-0 px-1.5 text-[10px]'
                    onClick={() => {
                      setIsUpdating(true);
                      setInputText(latest?.text_response || '');
                    }}
                  >
                    <Pencil className='mr-1 h-3 w-3' /> Edit
                  </Button>
                </div>
                {latest!.submitted_by_name && (
                  <p className='text-muted-foreground mt-1 text-[10px]'>
                    by{' '}
                    <span className='text-foreground/70'>
                      {latest!.submitted_by_name}
                    </span>
                  </p>
                )}
              </div>
            )}
          </div>
        ) : (
          /* No answer yet — show input field */
          <div className='space-y-1.5'>
            {requirement.response_type === 'TEXT' && (
              <div className='flex gap-1.5'>
                <input
                  type='text'
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && inputText.trim()) handleSubmit();
                  }}
                  placeholder='Type answer...'
                  className='placeholder:text-muted-foreground/50 focus:ring-ring flex-1 rounded-md border bg-transparent px-2.5 py-1.5 text-xs focus:ring-1 focus:outline-none'
                />
                <Button
                  size='sm'
                  className='h-7 px-2.5 text-[11px]'
                  disabled={isPending || !inputText.trim()}
                  onClick={handleSubmit}
                >
                  Save
                </Button>
              </div>
            )}
            {requirement.response_type === 'DOCUMENT' && (
              <div className='flex items-center gap-1.5'>
                <input
                  ref={fileInputRef}
                  type='file'
                  className='hidden'
                  accept={
                    requirement.accepted_file_types?.join(',') || undefined
                  }
                  onChange={(e) => setInputFile(e.target.files?.[0] || null)}
                />
                <button
                  type='button'
                  onClick={() => fileInputRef.current?.click()}
                  className='text-muted-foreground hover:border-foreground/20 hover:text-foreground/70 flex flex-1 items-center gap-2 rounded-md border border-dashed px-2.5 py-2 text-xs transition-colors'
                >
                  <Upload className='h-3.5 w-3.5' />
                  {inputFile ? inputFile.name : 'Choose file to upload'}
                </button>
                {inputFile && (
                  <Button
                    size='sm'
                    className='h-7 px-2.5 text-[11px]'
                    disabled={isPending}
                    onClick={handleSubmit}
                  >
                    Upload
                  </Button>
                )}
              </div>
            )}
            {requirement.response_type === 'SCHEDULE' && (
              <ScheduleInput
                scheduledDate={requirement.scheduled_date}
                scheduledLocation={requirement.scheduled_location}
                isPending={isPending}
                onSubmit={(date, location) => {
                  updateRequirement.mutate({
                    reqId: requirement.id,
                    data: {
                      scheduled_date: date,
                      scheduled_location: location || ''
                    }
                  });
                  onSubmitOnBehalf(requirement.id, { scheduleResponse: date });
                }}
              />
            )}
          </div>
        )}

        {/* Rejection reason */}
        {latest?.review_notes && latest.status === 'REJECTED' && (
          <div className='mt-2 flex items-start gap-2 rounded bg-red-50 px-2.5 py-1.5 text-xs text-red-700 dark:bg-red-950/30 dark:text-red-300'>
            <AlertCircle className='mt-0.5 h-3 w-3 shrink-0' />
            <span>{latest.review_notes}</span>
          </div>
        )}

        {/* History */}
        {responses.length > 1 && (
          <div className='mt-2'>
            <button
              type='button'
              className='text-muted-foreground hover:text-foreground flex items-center gap-1 text-[11px]'
              onClick={() => setShowHistory(!showHistory)}
            >
              <History className='h-3 w-3' />
              {showHistory ? 'Hide' : 'View'} {responses.length} submissions
            </button>
            {showHistory && (
              <div className='mt-2 space-y-1.5 border-l-2 pl-3'>
                {responses.map((resp) => (
                  <HistoryEntry
                    key={resp.id}
                    response={resp}
                    type={requirement.response_type}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Response Content ── */

/** Returns true if the response actually has content worth displaying */
function hasResponseContent(
  response: RequirementResponse,
  type: string
): boolean {
  if (type === 'DOCUMENT')
    return !!(response.file_response_url || response.file_response);
  if (type === 'TEXT') return !!response.text_response;
  if (type === 'SCHEDULE') return !!response.schedule_response;
  return false;
}

function ResponseContent({
  response,
  type,
  title
}: {
  response: RequirementResponse;
  type: string;
  title: string;
}) {
  const [visible, setVisible] = useState(false);
  const isPassword = title?.toLowerCase().includes('password');

  if (type === 'TEXT' && response.text_response) {
    if (isPassword) {
      return (
        <div className='flex items-center gap-2'>
          <p className='text-foreground/80 font-mono text-sm'>
            {visible ? response.text_response : '••••••••'}
          </p>
          <button
            type='button'
            onClick={() => setVisible(!visible)}
            className='text-muted-foreground hover:text-foreground rounded p-0.5 transition-colors'
            title={visible ? 'Hide password' : 'Show password'}
          >
            {visible ? (
              <X className='h-3.5 w-3.5' />
            ) : (
              <Eye className='h-3.5 w-3.5' />
            )}
          </button>
        </div>
      );
    }
    return (
      <p className='text-foreground/80 text-sm'>{response.text_response}</p>
    );
  }

  if (type === 'SCHEDULE' && response.schedule_response) {
    return (
      <div className='bg-muted/50 flex items-center gap-2 rounded-md px-2.5 py-2'>
        <Calendar className='h-4 w-4 shrink-0 text-purple-500' />
        <span className='text-sm font-medium'>
          {format(new Date(response.schedule_response), 'MMM d, yyyy')}
        </span>
        <span className='text-muted-foreground text-xs'>
          {format(new Date(response.schedule_response), 'h:mm a')}
        </span>
      </div>
    );
  }

  return null;
}

/* ── History Entry ── */

function HistoryEntry({
  response,
  type
}: {
  response: RequirementResponse;
  type: string;
}) {
  const color: Record<string, string> = {
    PENDING_REVIEW: 'text-amber-600 dark:text-amber-400',
    APPROVED: 'text-green-600 dark:text-green-400',
    REJECTED: 'text-red-600 dark:text-red-400'
  };
  const respStatus = response.status ?? 'PENDING_REVIEW';

  return (
    <div className='text-xs'>
      <div className='flex items-center gap-1.5'>
        <span className={cn('font-semibold', color[respStatus])}>
          {respStatus === 'PENDING_REVIEW'
            ? 'Pending'
            : respStatus === 'APPROVED'
              ? 'Approved'
              : 'Rejected'}
        </span>
        <span className='text-muted-foreground'>
          {format(new Date(response.created_at), 'MMM d HH:mm')}
        </span>
      </div>
      {type === 'TEXT' && response.text_response && (
        <p className='text-muted-foreground mt-0.5 line-clamp-2'>
          {response.text_response}
        </p>
      )}
      {type === 'DOCUMENT' && response.file_response_url && (
        <a
          href={response.file_response_url}
          target='_blank'
          rel='noopener noreferrer'
          className='text-primary hover:underline'
        >
          View document
        </a>
      )}
      {response.review_notes && response.status === 'REJECTED' && (
        <p className='text-muted-foreground mt-0.5'>{response.review_notes}</p>
      )}
    </div>
  );
}

/* ── Add Requirement Dialog ── */

function AddRequirementDialog({
  open,
  onOpenChange,
  stageId,
  isPending,
  onSubmit
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  stageId: string | null;
  isPending: boolean;
  onSubmit: (data: {
    response_type: string;
    title: string;
    description?: string;
    is_required?: boolean;
    owner?: string;
  }) => void;
}) {
  const [mode, setMode] = useState<'highlight' | 'requirement'>('requirement');
  const [responseType, setResponseType] = useState<string>('TEXT');
  const [owner, setOwner] = useState<string>('student');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isRequired, setIsRequired] = useState(true);

  const isHighlight = mode === 'highlight';

  const handleSubmit = () => {
    if (isHighlight) {
      // Highlight = INFO type, staff-owned, not required, auto-approved
      onSubmit({
        response_type: 'INFO',
        title,
        description: description || undefined,
        is_required: false,
        owner: 'staff'
      });
    } else {
      onSubmit({
        response_type: responseType,
        title,
        description: description || undefined,
        is_required: isRequired,
        owner
      });
    }
    setTitle('');
    setDescription('');
    setResponseType('TEXT');
    setOwner('student');
    setIsRequired(true);
    setMode('requirement');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isHighlight ? 'Send Highlight' : 'Add Requirement'}
          </DialogTitle>
        </DialogHeader>
        <div className='space-y-4'>
          {/* Mode toggle — Highlight vs Requirement */}
          <div className='flex gap-2'>
            <Button
              type='button'
              variant={mode === 'highlight' ? 'default' : 'outline'}
              size='sm'
              onClick={() => setMode('highlight')}
              className='flex-1'
            >
              Highlight / Message
            </Button>
            <Button
              type='button'
              variant={mode === 'requirement' ? 'default' : 'outline'}
              size='sm'
              onClick={() => setMode('requirement')}
              className='flex-1'
            >
              Requirement
            </Button>
          </div>

          {isHighlight ? (
            <>
              {/* Highlight mode — simple message to student */}
              <p className='text-muted-foreground text-xs'>
                Send a highlighted message to the student on this stage. They
                will see it but don&apos;t need to respond.
              </p>
              <div>
                <label className='text-sm font-medium'>Title</label>
                <Input
                  className='mt-1'
                  placeholder='e.g. Important: Bring original documents'
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div>
                <label className='text-sm font-medium'>
                  Details (optional)
                </label>
                <Textarea
                  className='mt-1'
                  placeholder='Additional details for the student...'
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>
            </>
          ) : (
            <>
              {/* Requirement mode — needs a response */}
              {/* Owner */}
              <div>
                <label className='text-sm font-medium'>
                  Who provides this?
                </label>
                <Select value={owner} onValueChange={setOwner}>
                  <SelectTrigger className='mt-1'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='student'>
                      Student (student fills this in)
                    </SelectItem>
                    <SelectItem value='staff'>
                      Admin/Staff (you fill this in)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Response Type */}
              <div>
                <label className='text-sm font-medium'>Response Type</label>
                <Select value={responseType} onValueChange={setResponseType}>
                  <SelectTrigger className='mt-1'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='TEXT'>Short Text</SelectItem>
                    <SelectItem value='TEXTAREA'>Long Text</SelectItem>
                    <SelectItem value='NUMBER'>Number</SelectItem>
                    <SelectItem value='DATE'>Date</SelectItem>
                    <SelectItem value='SELECT'>Selection (Dropdown)</SelectItem>
                    <SelectItem value='DOCUMENT'>Document Upload</SelectItem>
                    <SelectItem value='MULTI_FILE'>Multiple Files</SelectItem>
                    <SelectItem value='IMAGE'>Image Upload</SelectItem>
                    <SelectItem value='MULTI_IMAGE'>Multiple Images</SelectItem>
                    <SelectItem value='SCHEDULE'>
                      Schedule / Appointment
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className='text-sm font-medium'>Title</label>
                <Input
                  className='mt-1'
                  placeholder='e.g. Birth Certificate, Portal Username'
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div>
                <label className='text-sm font-medium'>Description</label>
                <Textarea
                  className='mt-1'
                  placeholder='Instructions or details...'
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                />
              </div>
              <label className='flex items-center gap-2 text-sm'>
                <input
                  type='checkbox'
                  checked={isRequired}
                  onChange={(e) => setIsRequired(e.target.checked)}
                  className='rounded'
                />
                Required
              </label>
            </>
          )}
        </div>
        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!title.trim() || isPending}>
            {isPending
              ? 'Adding...'
              : isHighlight
                ? 'Send Highlight'
                : 'Add Requirement'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ── Schedule Input — date/time/location picker for SCHEDULE requirements ── */

function ScheduleInput({
  scheduledDate,
  scheduledLocation,
  isPending,
  onSubmit
}: {
  scheduledDate?: string | null;
  scheduledLocation?: string | null;
  isPending: boolean;
  onSubmit: (date: string, location?: string) => void;
}) {
  const [date, setDate] = useState(
    scheduledDate ? scheduledDate.split('T')[0] : ''
  );
  const [time, setTime] = useState(
    scheduledDate
      ? scheduledDate.split('T')[1]?.substring(0, 5) || '09:00'
      : '09:00'
  );
  const [location, setLocation] = useState(scheduledLocation || '');

  const handleSave = () => {
    const dateTime = `${date}T${time}:00`;
    onSubmit(dateTime, location || undefined);
  };

  return (
    <div className='space-y-2'>
      <div className='grid grid-cols-2 gap-2'>
        <div>
          <label className='text-muted-foreground text-[10px] font-medium'>
            Date
          </label>
          <input
            type='date'
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className='focus:ring-ring w-full rounded-md border bg-transparent px-2.5 py-1.5 text-xs [color-scheme:dark] focus:ring-1 focus:outline-none'
          />
        </div>
        <div>
          <label className='text-muted-foreground text-[10px] font-medium'>
            Time
          </label>
          <input
            type='time'
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className='focus:ring-ring w-full rounded-md border bg-transparent px-2.5 py-1.5 text-xs [color-scheme:dark] focus:ring-1 focus:outline-none'
          />
        </div>
      </div>
      <div>
        <label className='text-muted-foreground text-[10px] font-medium'>
          Location (optional)
        </label>
        <input
          type='text'
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder='e.g. Room 201, Main Campus'
          className='placeholder:text-muted-foreground/50 focus:ring-ring w-full rounded-md border bg-transparent px-2.5 py-1.5 text-xs focus:ring-1 focus:outline-none'
        />
      </div>
      <Button
        size='sm'
        className='h-7 px-3 text-[11px]'
        disabled={isPending || !date}
        onClick={handleSave}
      >
        <Calendar className='mr-1.5 h-3 w-3' />
        {scheduledDate ? 'Update Schedule' : 'Set Schedule'}
      </Button>
    </div>
  );
}
