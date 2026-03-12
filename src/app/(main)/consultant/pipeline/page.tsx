'use client';

import { useQuery } from '@tanstack/react-query';
import useClientApi from '@/lib/axios/clientSide';
import PageContainer from '@/components/layout/page-container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  FileCheck,
  AlertTriangle,
  ArrowRight,
  Kanban
} from 'lucide-react';
import {
  type StudentPipeline,
  type PipelinesResponse,
  type StageStatus,
  PIPELINE_STAGES
} from '@/features/pipeline/types';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function ConsultantPipelinePage() {
  const { api } = useClientApi();

  const { data, isLoading } = useQuery<PipelinesResponse>({
    queryKey: ['consultant-pipelines'],
    queryFn: async () => {
      if (!api) throw new Error('API not initialized');
      const response = await api.get('/consultant/pipelines/');
      return response.data;
    },
    enabled: !!api
  });

  const pipelines = data?.results ?? [];
  const total = data?.count ?? 0;
  const preApp = pipelines.filter(
    (p) => p.current_phase === 'PRE_APPLICATION'
  ).length;
  const postApp = pipelines.filter(
    (p) => p.current_phase === 'POST_APPLICATION'
  ).length;
  const blocked = pipelines.filter((p) =>
    p.stages?.some((s) => s.status === 'BLOCKED')
  ).length;

  return (
    <PageContainer className='w-full'>
      <div className='w-full space-y-6'>
        <div>
          <h1 className='text-3xl font-bold'>My Pipeline</h1>
          <p className='text-muted-foreground'>
            Your assigned students&apos; processing status
          </p>
        </div>

        <div className='grid grid-cols-1 gap-4 md:grid-cols-4'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>My Students</CardTitle>
              <Users className='text-muted-foreground h-4 w-4' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{total}</div>
              <p className='text-muted-foreground text-xs'>In pipeline</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Pre-Application
              </CardTitle>
              <FileCheck className='text-muted-foreground h-4 w-4' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{preApp}</div>
              <p className='text-muted-foreground text-xs'>Stages 1-7</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Post-Application
              </CardTitle>
              <Kanban className='text-muted-foreground h-4 w-4' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{postApp}</div>
              <p className='text-muted-foreground text-xs'>Stages 8-16</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Blocked</CardTitle>
              <AlertTriangle className='text-muted-foreground h-4 w-4' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{blocked}</div>
              <p className='text-muted-foreground text-xs'>Need attention</p>
            </CardContent>
          </Card>
        </div>

        {/* Pipeline List */}
        <Card>
          <CardHeader>
            <CardTitle>My Pipeline Students</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className='text-muted-foreground py-8 text-center'>
                Loading...
              </p>
            ) : pipelines.length === 0 ? (
              <p className='text-muted-foreground py-8 text-center'>
                No students assigned to your pipeline yet.
              </p>
            ) : (
              <div className='space-y-3'>
                {pipelines.map((pipeline) => {
                  const completedCount =
                    pipeline.stages?.filter((s) => s.status === 'COMPLETED')
                      .length ?? 0;
                  const activeStage = pipeline.stages?.find(
                    (s) => s.status === 'IN_PROGRESS'
                  );
                  const activeLabel = PIPELINE_STAGES.find(
                    (s) => s.key === activeStage?.stage_type
                  )?.label;
                  const phaseLabel: Record<string, string> = {
                    CONSULTATION: 'Consultation',
                    PRE_APPLICATION: 'Pre-Application',
                    POST_APPLICATION: 'Post-Application',
                    ORIENTATION: 'Orientation',
                    DEPARTED: 'Departed',
                    MONITORING: 'Monitoring'
                  };

                  return (
                    <Link
                      key={pipeline.id}
                      href={`/consultant/pipeline/${pipeline.student}`}
                    >
                      <div className='hover:bg-muted/50 flex cursor-pointer items-center gap-4 rounded-lg border p-3 transition-colors'>
                        <div className='min-w-0 flex-1'>
                          <p className='truncate font-medium'>
                            {pipeline.student_name ?? 'Unknown'}
                          </p>
                          <p className='text-muted-foreground truncate text-sm'>
                            {pipeline.university_name}
                            {pipeline.country_name &&
                              ` — ${pipeline.country_name}`}
                          </p>
                        </div>
                        <Badge variant='outline'>
                          {phaseLabel[pipeline.current_phase] ??
                            pipeline.current_phase}
                        </Badge>
                        <div className='text-muted-foreground hidden items-center gap-2 text-sm lg:flex'>
                          <ArrowRight className='h-3.5 w-3.5' />
                          <span className='max-w-[180px] truncate'>
                            {activeLabel ?? 'None'}
                          </span>
                        </div>
                        <div className='text-right'>
                          <span className='text-sm font-medium'>
                            {completedCount}/16
                          </span>
                          <div className='mt-1 flex w-[96px] gap-0.5'>
                            {PIPELINE_STAGES.map((stage) => {
                              const s = pipeline.stages?.find(
                                (ps) => ps.stage_type === stage.key
                              );
                              const status: StageStatus =
                                s?.status ?? 'NOT_STARTED';
                              return (
                                <div
                                  key={stage.key}
                                  className={cn(
                                    'h-1 flex-1 rounded-full',
                                    status === 'COMPLETED' && 'bg-green-500',
                                    status === 'IN_PROGRESS' && 'bg-blue-500',
                                    status === 'BLOCKED' && 'bg-red-500',
                                    status === 'SKIPPED' && 'bg-yellow-500',
                                    status === 'NOT_STARTED' && 'bg-muted'
                                  )}
                                />
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </Link>
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
