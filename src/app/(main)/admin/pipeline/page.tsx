'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useClientApi from '@/lib/axios/clientSide';
import PageContainer from '@/components/layout/page-container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  Kanban,
  Users,
  FileCheck,
  AlertTriangle,
  ArrowRight,
  Plus,
  Search
} from 'lucide-react';
import {
  type StudentPipeline,
  type PipelinesResponse,
  type StageStatus,
  PIPELINE_STAGES,
  STAGE_STATUS_COLOR
} from '@/features/pipeline/types';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { toast } from 'sonner';

export default function PipelinePage() {
  const { api } = useClientApi();
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [studentId, setStudentId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [phaseFilter, setPhaseFilter] = useState<string>('all');

  const { data, isLoading } = useQuery<PipelinesResponse>({
    queryKey: ['pipelines'],
    queryFn: async () => {
      if (!api) throw new Error('API not initialized');
      const response = await api.get('/admin/pipelines/');
      return response.data;
    },
    enabled: !!api
  });

  const createPipeline = useMutation({
    mutationFn: async (studentId: string) => {
      if (!api) throw new Error('API not initialized');
      const response = await api.post('/admin/pipelines/', {
        student: studentId
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pipelines'] });
      setCreateOpen(false);
      setStudentId('');
      toast.success('Pipeline created');
    },
    onError: () => toast.error('Failed to create pipeline')
  });

  const allPipelines = data?.results ?? [];
  const total = data?.count ?? 0;

  // Apply filters
  const pipelines = allPipelines.filter((p) => {
    if (phaseFilter !== 'all' && p.current_phase !== phaseFilter) return false;
    if (
      searchQuery &&
      !p.student_name?.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !p.university_name?.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false;
    return true;
  });

  const preApp = allPipelines.filter(
    (p) => p.current_phase === 'PRE_APPLICATION'
  ).length;
  const postApp = allPipelines.filter(
    (p) => p.current_phase === 'POST_APPLICATION'
  ).length;
  const blocked = allPipelines.filter((p) =>
    p.stages?.some((s) => s.status === 'BLOCKED')
  ).length;

  // Group students by their current active stage
  const stageGroups = PIPELINE_STAGES.map((stage) => {
    const students = pipelines.filter((p) => {
      const activeStage = p.stages?.find((s) => s.status === 'IN_PROGRESS');
      return activeStage?.stage_type === stage.key;
    });
    return { ...stage, students };
  });

  return (
    <PageContainer className='w-full'>
      <div className='w-full space-y-6'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold'>Pipeline</h1>
            <p className='text-muted-foreground'>
              Student processing pipeline — track every step from consultation
              to departure
            </p>
          </div>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className='mr-2 h-4 w-4' />
            New Pipeline
          </Button>
        </div>

        <div className='grid grid-cols-1 gap-4 md:grid-cols-4'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Active Students
              </CardTitle>
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

        {/* Filters */}
        <div className='flex gap-3'>
          <div className='relative flex-1'>
            <Search className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
            <Input
              placeholder='Search students or universities...'
              className='pl-9'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={phaseFilter} onValueChange={setPhaseFilter}>
            <SelectTrigger className='w-[200px]'>
              <SelectValue placeholder='Filter by phase' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Phases</SelectItem>
              <SelectItem value='CONSULTATION'>Consultation</SelectItem>
              <SelectItem value='PRE_APPLICATION'>Pre-Application</SelectItem>
              <SelectItem value='POST_APPLICATION'>Post-Application</SelectItem>
              <SelectItem value='ORIENTATION'>Orientation</SelectItem>
              <SelectItem value='DEPARTED'>Departed</SelectItem>
              <SelectItem value='MONITORING'>Monitoring</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Kanban Board */}
        <div className='overflow-x-auto pb-4'>
          <div
            className='flex gap-4'
            style={{ minWidth: `${PIPELINE_STAGES.length * 280}px` }}
          >
            {stageGroups.map((stage) => (
              <div key={stage.key} className='w-[260px] shrink-0'>
                <div className='mb-2 flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <span className='text-muted-foreground text-xs font-medium'>
                      {stage.number}.
                    </span>
                    <h3 className='truncate text-sm font-semibold'>
                      {stage.label}
                    </h3>
                  </div>
                  <Badge variant='outline' className='text-xs'>
                    {stage.students.length}
                  </Badge>
                </div>
                <div className='bg-muted/30 min-h-[120px] space-y-2 rounded-lg border p-2'>
                  {isLoading ? (
                    <div className='text-muted-foreground py-4 text-center text-xs'>
                      Loading...
                    </div>
                  ) : stage.students.length === 0 ? (
                    <div className='text-muted-foreground py-4 text-center text-xs'>
                      No students
                    </div>
                  ) : (
                    stage.students.map((pipeline) => (
                      <PipelineCard key={pipeline.id} pipeline={pipeline} />
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Full Pipeline List */}
        <Card>
          <CardHeader>
            <CardTitle>All Pipeline Students</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className='text-muted-foreground py-8 text-center'>
                Loading...
              </p>
            ) : pipelines.length === 0 ? (
              <p className='text-muted-foreground py-8 text-center'>
                No students in pipeline yet.
              </p>
            ) : (
              <div className='space-y-3'>
                {pipelines.map((pipeline) => (
                  <PipelineRow key={pipeline.id} pipeline={pipeline} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create Pipeline Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Pipeline</DialogTitle>
          </DialogHeader>
          <div className='space-y-4'>
            <div>
              <label className='text-sm font-medium'>Student ID</label>
              <Input
                placeholder='Enter student ID...'
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
              />
              <p className='text-muted-foreground mt-1 text-xs'>
                The student must already exist in the system.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => createPipeline.mutate(studentId)}
              disabled={!studentId.trim() || createPipeline.isPending}
            >
              {createPipeline.isPending ? 'Creating...' : 'Create Pipeline'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}

function PipelineCard({ pipeline }: { pipeline: StudentPipeline }) {
  const completedCount =
    pipeline.stages?.filter((s) => s.status === 'COMPLETED').length ?? 0;
  const hasBlocked = pipeline.stages?.some((s) => s.status === 'BLOCKED');

  return (
    <Link href={`/admin/pipeline/${pipeline.student}`}>
      <Card className='cursor-pointer p-3 transition-shadow hover:shadow-md'>
        <div className='space-y-2'>
          <div className='flex items-start justify-between'>
            <p className='text-sm leading-tight font-medium'>
              {pipeline.student_name ?? 'Unknown'}
            </p>
            {hasBlocked && (
              <AlertTriangle className='text-destructive h-3.5 w-3.5 shrink-0' />
            )}
          </div>
          {pipeline.university_name && (
            <p className='text-muted-foreground truncate text-xs'>
              {pipeline.university_name}
            </p>
          )}
          <div className='flex items-center justify-between'>
            <p className='text-muted-foreground text-xs'>
              {pipeline.consultant_name ?? 'Unassigned'}
            </p>
            <span className='text-muted-foreground text-xs'>
              {completedCount}/16
            </span>
          </div>
          {/* Mini progress bar */}
          <div className='flex gap-0.5'>
            {PIPELINE_STAGES.map((stage) => {
              const s = pipeline.stages?.find(
                (ps) => ps.stage_type === stage.key
              );
              const status: StageStatus = s?.status ?? 'NOT_STARTED';
              return (
                <div
                  key={stage.key}
                  className={cn(
                    'h-1.5 flex-1 rounded-full',
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
      </Card>
    </Link>
  );
}

function PipelineRow({ pipeline }: { pipeline: StudentPipeline }) {
  const completedCount =
    pipeline.stages?.filter((s) => s.status === 'COMPLETED').length ?? 0;
  const activeStage = pipeline.stages?.find((s) => s.status === 'IN_PROGRESS');
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
    <Link href={`/admin/pipeline/${pipeline.student}`}>
      <div className='hover:bg-muted/50 flex cursor-pointer items-center gap-4 rounded-lg border p-3 transition-colors'>
        <div className='min-w-0 flex-1'>
          <p className='truncate font-medium'>
            {pipeline.student_name ?? 'Unknown'}
          </p>
          <p className='text-muted-foreground truncate text-sm'>
            {pipeline.university_name}{' '}
            {pipeline.country_name && `— ${pipeline.country_name}`}
          </p>
        </div>
        <div className='hidden text-right md:block'>
          <Badge variant='outline'>
            {phaseLabel[pipeline.current_phase] ?? pipeline.current_phase}
          </Badge>
        </div>
        <div className='text-muted-foreground hidden items-center gap-2 text-sm lg:flex'>
          <ArrowRight className='h-3.5 w-3.5' />
          <span className='max-w-[180px] truncate'>
            {activeLabel ?? 'None'}
          </span>
        </div>
        <div className='text-right'>
          <span className='text-sm font-medium'>{completedCount}/16</span>
          <div className='mt-1 flex w-[96px] gap-0.5'>
            {PIPELINE_STAGES.map((stage) => {
              const s = pipeline.stages?.find(
                (ps) => ps.stage_type === stage.key
              );
              const status: StageStatus = s?.status ?? 'NOT_STARTED';
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
}
