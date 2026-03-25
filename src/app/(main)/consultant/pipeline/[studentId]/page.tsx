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
  User
} from 'lucide-react';
import {
  type StudentPipeline,
  type StageInstanceStatus,
  STAGE_INSTANCE_STATUS_COLOR,
  FLOW_TYPE_COLOR
} from '@/features/pipeline/types';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { format } from 'date-fns';

const statusIcon: Record<string, React.ReactNode> = {
  PENDING: <Circle className='text-muted-foreground h-4 w-4' />,
  ACTIVE: <Clock className='h-4 w-4 text-blue-500' />,
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

  const stageInstances = pipeline.stage_instances ?? [];
  const totalStages = stageInstances.length;
  const completedCount = stageInstances.filter(
    (s) => s.status === 'COMPLETED'
  ).length;
  const activeStage = stageInstances.find((s) => s.status === 'ACTIVE');
  const progress =
    totalStages > 0 ? Math.round((completedCount / totalStages) * 100) : 0;

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
              {pipeline.flow_type && (
                <Badge
                  variant='outline'
                  className={cn('text-xs', FLOW_TYPE_COLOR[pipeline.flow_type])}
                >
                  {pipeline.flow_type === 'LOCAL' ? 'Local' : 'Abroad'}
                </Badge>
              )}
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
                {completedCount} of {totalStages} stages complete
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Pipeline Stages</CardTitle>
          </CardHeader>
          <CardContent>
            {stageInstances.length === 0 ? (
              <p className='text-muted-foreground py-6 text-center text-sm'>
                No stages configured for this pipeline yet.
              </p>
            ) : (
              <div className='space-y-2'>
                {stageInstances
                  .sort((a, b) => a.stage_order - b.stage_order)
                  .map((stage) => {
                    const status = stage.status ?? 'PENDING';
                    return (
                      <div
                        key={stage.id}
                        className={cn(
                          'flex items-center gap-3 rounded-lg border p-3',
                          status === 'ACTIVE' &&
                            'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20'
                        )}
                      >
                        {statusIcon[status]}
                        <span className='text-muted-foreground w-5 font-mono text-xs'>
                          {stage.stage_order}.
                        </span>
                        <div className='flex-1'>
                          <span
                            className={cn(
                              'text-sm font-medium',
                              status === 'PENDING' && 'text-muted-foreground'
                            )}
                          >
                            {stage.stage_name}
                          </span>
                          {stage.description && (
                            <p className='text-muted-foreground text-xs'>
                              {stage.description}
                            </p>
                          )}
                        </div>
                        {stage.requirements_summary &&
                          stage.requirements_summary.total > 0 && (
                            <span className='text-muted-foreground text-xs'>
                              {stage.requirements_summary.approved}/
                              {stage.requirements_summary.total} done
                            </span>
                          )}
                        <Badge
                          variant='outline'
                          className={cn(
                            'text-xs',
                            STAGE_INSTANCE_STATUS_COLOR[
                              status as StageInstanceStatus
                            ]
                          )}
                        >
                          {status.replace('_', ' ')}
                        </Badge>
                      </div>
                    );
                  })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
