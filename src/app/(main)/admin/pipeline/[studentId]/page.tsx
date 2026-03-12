'use client';

import { useQuery } from '@tanstack/react-query';
import useClientApi from '@/lib/axios/clientSide';
import PageContainer from '@/components/layout/page-container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  Phone,
  Mail
} from 'lucide-react';
import {
  type StudentPipeline,
  type PipelineStage,
  type DocumentRequirement,
  PIPELINE_STAGES,
  STAGE_STATUS_COLOR
} from '@/features/pipeline/types';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { format } from 'date-fns';

const statusIcon: Record<string, React.ReactNode> = {
  NOT_STARTED: <Circle className='text-muted-foreground h-4 w-4' />,
  IN_PROGRESS: <Clock className='h-4 w-4 text-blue-500' />,
  COMPLETED: <CheckCircle className='h-4 w-4 text-green-500' />,
  BLOCKED: <AlertTriangle className='h-4 w-4 text-red-500' />,
  SKIPPED: <SkipForward className='h-4 w-4 text-yellow-500' />
};

export default function PipelineDetailPage() {
  const params = useParams<{ studentId: string }>();
  const { api } = useClientApi();

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
              <CardTitle className='text-sm font-medium'>Consultant</CardTitle>
            </CardHeader>
            <CardContent>
              <p className='font-medium'>
                {pipeline.consultant_name ?? 'Unassigned'}
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

        {/* 16-Stage Progress Bar */}
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
                    <DocumentRow key={doc.id} document={doc} />
                  ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PageContainer>
  );
}

function StageRow({
  number,
  label,
  status,
  stage,
  documents,
  isActive
}: {
  number: number;
  label: string;
  status: string;
  stage?: PipelineStage;
  documents: DocumentRequirement[];
  isActive: boolean;
}) {
  const docsPending = documents.filter((d) => d.status === 'REQUIRED').length;
  const docsVerified = documents.filter((d) => d.status === 'VERIFIED').length;

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
    </div>
  );
}

function DocumentRow({ document }: { document: DocumentRequirement }) {
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
      {document.status === 'REQUIRED' && (
        <Button variant='outline' size='sm'>
          <Upload className='mr-1 h-3 w-3' />
          Upload
        </Button>
      )}
    </div>
  );
}
