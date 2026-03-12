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
  FileText,
  User
} from 'lucide-react';
import {
  type StudentPipeline,
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

export default function ConsultantPipelineDetailPage() {
  const params = useParams<{ studentId: string }>();
  const { api } = useClientApi();

  const { data: pipeline, isLoading } = useQuery<StudentPipeline>({
    queryKey: ['consultant-pipeline', params.studentId],
    queryFn: async () => {
      if (!api) throw new Error('API not initialized');
      const response = await api.get(
        `/consultant/pipelines/${params.studentId}/`
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
          <Link href='/consultant/pipeline'>
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
        <div className='flex items-center gap-4'>
          <Link href='/consultant/pipeline'>
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
            </div>
          </div>
          <div className='text-right'>
            <p className='text-2xl font-bold'>{progress}%</p>
            <p className='text-muted-foreground text-xs'>Complete</p>
          </div>
        </div>

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

        <Card>
          <CardHeader>
            <CardTitle>Pipeline Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-6'>
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
                      return (
                        <div
                          key={stage.key}
                          className={cn(
                            'flex items-center gap-3 rounded-lg border p-3',
                            activeStage?.stage_type === stage.key &&
                              'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20'
                          )}
                        >
                          {statusIcon[status]}
                          <span className='text-muted-foreground w-5 font-mono text-xs'>
                            {stage.number}.
                          </span>
                          <span
                            className={cn(
                              'flex-1 text-sm font-medium',
                              status === 'NOT_STARTED' &&
                                'text-muted-foreground'
                            )}
                          >
                            {stage.label}
                          </span>
                          <Badge
                            variant='outline'
                            className={cn(
                              'text-xs',
                              STAGE_STATUS_COLOR[
                                status as keyof typeof STAGE_STATUS_COLOR
                              ]
                            )}
                          >
                            {status.replace('_', ' ')}
                          </Badge>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
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
                      return (
                        <div
                          key={stage.key}
                          className={cn(
                            'flex items-center gap-3 rounded-lg border p-3',
                            activeStage?.stage_type === stage.key &&
                              'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20'
                          )}
                        >
                          {statusIcon[status]}
                          <span className='text-muted-foreground w-5 font-mono text-xs'>
                            {stage.number}.
                          </span>
                          <span
                            className={cn(
                              'flex-1 text-sm font-medium',
                              status === 'NOT_STARTED' &&
                                'text-muted-foreground'
                            )}
                          >
                            {stage.label}
                          </span>
                          <Badge
                            variant='outline'
                            className={cn(
                              'text-xs',
                              STAGE_STATUS_COLOR[
                                status as keyof typeof STAGE_STATUS_COLOR
                              ]
                            )}
                          >
                            {status.replace('_', ' ')}
                          </Badge>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
