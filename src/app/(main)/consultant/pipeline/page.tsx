'use client';

import { useQuery } from '@tanstack/react-query';
import useClientApi from '@/lib/axios/clientSide';
import PageContainer from '@/components/layout/page-container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Users,
  AlertTriangle,
  ArrowRight,
  Kanban,
  Globe,
  MapPin
} from 'lucide-react';
import {
  type StudentPipeline,
  type PipelinesResponse,
  FLOW_TYPE_COLOR
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
  const localCount = pipelines.filter((p) => p.flow_type === 'LOCAL').length;
  const abroadCount = pipelines.filter((p) => p.flow_type === 'ABROAD').length;
  const blocked = pipelines.filter((p) => p.has_blocked).length;

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
              <CardTitle className='text-sm font-medium'>Local</CardTitle>
              <MapPin className='text-muted-foreground h-4 w-4' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{localCount}</div>
              <p className='text-muted-foreground text-xs'>
                Tanzania universities
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Abroad</CardTitle>
              <Globe className='text-muted-foreground h-4 w-4' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{abroadCount}</div>
              <p className='text-muted-foreground text-xs'>
                International universities
              </p>
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
                  const totalStages = pipeline.total_stages ?? 0;
                  const completedCount = pipeline.completed_stages ?? 0;
                  const progressPct =
                    totalStages > 0
                      ? Math.round((completedCount / totalStages) * 100)
                      : 0;

                  // active_stage comes from list serializer as {stage_name, stage_type, stage_order}
                  const activeStageInfo = pipeline.active_stage as unknown as {
                    stage_name?: string;
                    stage_order?: number;
                  } | null;
                  const activeLabel = activeStageInfo
                    ? `${activeStageInfo.stage_order ?? ''}. ${activeStageInfo.stage_name ?? ''}`
                    : null;

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
                          <div className='flex items-center gap-2'>
                            <p className='truncate font-medium'>
                              {pipeline.student_name ?? 'Unknown'}
                            </p>
                            {pipeline.flow_type && (
                              <Badge
                                className={cn(
                                  'px-1.5 py-0 text-[10px]',
                                  FLOW_TYPE_COLOR[pipeline.flow_type]
                                )}
                              >
                                {pipeline.flow_type === 'LOCAL'
                                  ? 'Local'
                                  : 'Abroad'}
                              </Badge>
                            )}
                          </div>
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
                            {completedCount}/{totalStages}
                          </span>
                          <Progress
                            value={progressPct}
                            className='mt-1 h-1.5 w-[96px]'
                          />
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
