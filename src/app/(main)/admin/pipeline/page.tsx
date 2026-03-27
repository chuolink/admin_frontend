'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import useClientApi from '@/lib/axios/clientSide';
import PageContainer from '@/components/layout/page-container';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Kanban,
  Users,
  AlertTriangle,
  Search,
  LayoutList,
  LayoutGrid,
  Check,
  Globe,
  MapPin,
  ArrowRight,
  ChevronRight
} from 'lucide-react';
import {
  type StudentPipeline,
  type PipelinesResponse,
  FLOW_TYPE_COLOR
} from '@/features/pipeline/types';
import { cn } from '@/lib/utils';
import Link from 'next/link';

function getInitials(name?: string | null) {
  if (!name) return '??';
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

const AVATAR_COLORS = [
  'bg-blue-600',
  'bg-emerald-600',
  'bg-violet-600',
  'bg-amber-600',
  'bg-rose-600',
  'bg-cyan-600',
  'bg-indigo-600',
  'bg-teal-600'
];

function hashColor(name?: string | null) {
  if (!name) return AVATAR_COLORS[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++)
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export default function PipelinePage() {
  const { api } = useClientApi();
  const [searchQuery, setSearchQuery] = useState('');
  const [flowFilter, setFlowFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [groupFilter, setGroupFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'list' | 'board'>('list');

  const { data, isLoading } = useQuery<PipelinesResponse>({
    queryKey: ['pipelines'],
    queryFn: async () => {
      if (!api) throw new Error('API not initialized');
      const response = await api.get('/admin/pipelines/');
      return response.data;
    },
    enabled: !!api
  });

  const allPipelines = data?.results ?? [];

  const pipelines = allPipelines.filter((p) => {
    if (flowFilter !== 'all' && p.flow_type !== flowFilter) return false;
    if (groupFilter !== 'all' && (p.departure_group || '') !== groupFilter)
      return false;
    if (statusFilter === 'active') {
      if (p.has_blocked) return false;
      const total = p.total_stages ?? 0;
      const completed = p.completed_stages ?? 0;
      if (total > 0 && completed >= total) return false;
    }
    if (statusFilter === 'blocked' && !p.has_blocked) return false;
    if (statusFilter === 'completed') {
      const total = p.total_stages ?? p.stage_instances?.length ?? 0;
      const completed = p.completed_stages ?? 0;
      if (total === 0 || completed < total) return false;
    }
    if (
      searchQuery &&
      !p.student_name?.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !p.university_name?.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !p.app_id?.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false;
    return true;
  });

  const localCount = allPipelines.filter((p) => p.flow_type === 'LOCAL').length;
  const abroadCount = allPipelines.filter(
    (p) => p.flow_type === 'ABROAD'
  ).length;
  const blocked = allPipelines.filter((p) => p.has_blocked).length;
  // Note: pending review count not available from list API (no stage_instances)
  // Attention count is just blocked pipelines from list data

  return (
    <PageContainer className='w-full'>
      <div className='w-full space-y-5'>
        {/* Header */}
        <div>
          <h1 className='text-2xl font-bold tracking-tight'>Pipeline</h1>
          <p className='text-muted-foreground text-sm'>
            Track every student through their application journey
          </p>
        </div>

        {/* Stats */}
        <div className='grid grid-cols-2 gap-3 lg:grid-cols-4'>
          <StatCard
            label='Total'
            value={allPipelines.length}
            icon={<Users className='h-4 w-4' />}
            color='blue'
          />
          <StatCard
            label='Local'
            value={localCount}
            icon={<MapPin className='h-4 w-4' />}
            color='emerald'
          />
          <StatCard
            label='Abroad'
            value={abroadCount}
            icon={<Globe className='h-4 w-4' />}
            color='violet'
          />
          <StatCard
            label='Attention'
            value={blocked}
            icon={<AlertTriangle className='h-4 w-4' />}
            color='red'
            detail={blocked > 0 ? `${blocked} blocked` : undefined}
          />
        </div>

        {/* Toolbar */}
        <div className='flex flex-wrap items-center gap-2'>
          <div className='relative min-w-[200px] flex-1'>
            <Search className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
            <Input
              placeholder='Search by student, university, or app ID...'
              className='h-9 pl-9 text-sm'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Tabs value={flowFilter} onValueChange={setFlowFilter}>
            <TabsList className='h-9'>
              <TabsTrigger value='all' className='h-7 px-3 text-xs'>
                All
              </TabsTrigger>
              <TabsTrigger value='LOCAL' className='h-7 px-3 text-xs'>
                Local
              </TabsTrigger>
              <TabsTrigger value='ABROAD' className='h-7 px-3 text-xs'>
                Abroad
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className='h-9 w-[140px] text-xs'>
              <SelectValue placeholder='Status' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All statuses</SelectItem>
              <SelectItem value='active'>Active</SelectItem>
              <SelectItem value='blocked'>Blocked</SelectItem>
              <SelectItem value='completed'>Completed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={groupFilter} onValueChange={setGroupFilter}>
            <SelectTrigger className='h-9 w-[140px] text-xs'>
              <SelectValue placeholder='Group' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All groups</SelectItem>
              {[
                ...new Set(
                  allPipelines.map((p) => p.departure_group).filter(Boolean)
                )
              ].map((g) => (
                <SelectItem key={g} value={g}>
                  {g}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className='hidden items-center rounded-md border md:flex'>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size='sm'
              className='h-9 w-9 rounded-r-none p-0'
              onClick={() => setViewMode('list')}
            >
              <LayoutList className='h-3.5 w-3.5' />
            </Button>
            <Button
              variant={viewMode === 'board' ? 'secondary' : 'ghost'}
              size='sm'
              className='h-9 w-9 rounded-l-none p-0'
              onClick={() => setViewMode('board')}
            >
              <LayoutGrid className='h-3.5 w-3.5' />
            </Button>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className='flex items-center justify-center py-20'>
            <div className='text-muted-foreground flex flex-col items-center gap-3'>
              <div className='h-8 w-8 animate-spin rounded-full border-2 border-current border-t-transparent' />
              <p className='text-sm'>Loading pipelines...</p>
            </div>
          </div>
        ) : pipelines.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-20'>
            <div className='bg-muted mb-4 flex h-12 w-12 items-center justify-center rounded-full'>
              <Kanban className='text-muted-foreground h-6 w-6' />
            </div>
            <p className='text-muted-foreground text-sm'>
              {searchQuery ||
              flowFilter !== 'all' ||
              statusFilter !== 'all' ||
              groupFilter !== 'all'
                ? 'No students match your filters.'
                : 'No students in pipeline yet.'}
            </p>
          </div>
        ) : viewMode === 'list' ? (
          <PipelineList pipelines={pipelines} />
        ) : (
          <PipelineBoard pipelines={pipelines} />
        )}
      </div>
    </PageContainer>
  );
}

/* ── Stat Card ── */

const STAT_COLORS = {
  blue: {
    icon: 'bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400',
    value: 'text-blue-700 dark:text-blue-300'
  },
  emerald: {
    icon: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400',
    value: 'text-emerald-700 dark:text-emerald-300'
  },
  violet: {
    icon: 'bg-violet-100 text-violet-600 dark:bg-violet-950 dark:text-violet-400',
    value: 'text-violet-700 dark:text-violet-300'
  },
  red: {
    icon: 'bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400',
    value: 'text-red-700 dark:text-red-300'
  }
};

function StatCard({
  label,
  value,
  icon,
  color,
  detail
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: keyof typeof STAT_COLORS;
  detail?: string;
}) {
  const c = STAT_COLORS[color];
  return (
    <Card className='overflow-hidden'>
      <CardContent className='flex items-center gap-3 p-4'>
        <div
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
            c.icon
          )}
        >
          {icon}
        </div>
        <div className='min-w-0'>
          <p className='text-muted-foreground text-xs font-medium'>{label}</p>
          <p
            className={cn(
              'text-2xl leading-tight font-bold tabular-nums',
              c.value
            )}
          >
            {value}
          </p>
          {detail && (
            <p className='text-muted-foreground text-[10px]'>{detail}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/* ── List View ── */

function PipelineList({ pipelines }: { pipelines: StudentPipeline[] }) {
  return (
    <div className='space-y-1.5'>
      {pipelines.map((pipeline) => (
        <PipelineRow key={pipeline.id} pipeline={pipeline} />
      ))}
    </div>
  );
}

function PipelineRow({ pipeline }: { pipeline: StudentPipeline }) {
  const totalStages =
    pipeline.total_stages ?? pipeline.stage_instances?.length ?? 0;
  const completedCount = pipeline.completed_stages ?? 0;
  const progressPct =
    totalStages > 0 ? Math.round((completedCount / totalStages) * 100) : 0;

  const hasBlocked = pipeline.has_blocked;

  // active_stage comes from list serializer as {stage_name, stage_type, stage_order}
  const activeStageInfo = pipeline.active_stage as unknown as {
    stage_name?: string;
    stage_order?: number;
  } | null;
  const activeStageLabel = activeStageInfo
    ? `${activeStageInfo.stage_order ?? ''}. ${activeStageInfo.stage_name ?? ''}`
    : null;

  // Stage dots from stage_instances (only available in detail view)
  const stages =
    pipeline.stage_instances
      ?.slice()
      .sort((a, b) => a.stage_order - b.stage_order) ?? [];

  return (
    <Link href={`/admin/pipeline/${pipeline.id}`}>
      <div
        className={cn(
          'group hover:bg-accent/50 flex items-center gap-4 rounded-lg border px-4 py-3 transition-all hover:shadow-sm',
          hasBlocked && 'border-red-200 dark:border-red-900/50'
        )}
      >
        {/* Avatar */}
        <div
          className={cn(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white',
            hashColor(pipeline.student_name)
          )}
        >
          {getInitials(pipeline.student_name)}
        </div>

        {/* Student info */}
        <div className='min-w-0 flex-1'>
          <div className='flex items-center gap-2'>
            <span className='truncate text-sm font-semibold'>
              {pipeline.student_name ?? 'Unknown'}
            </span>
            {pipeline.flow_type && (
              <Badge
                className={cn(
                  'px-1.5 py-0 text-[10px] font-medium',
                  FLOW_TYPE_COLOR[pipeline.flow_type]
                )}
              >
                {pipeline.flow_type === 'LOCAL' ? 'Local' : 'Abroad'}
              </Badge>
            )}
            {pipeline.is_committed && (
              <span className='flex h-4 w-4 items-center justify-center rounded-full bg-green-100 dark:bg-green-900'>
                <Check className='h-2.5 w-2.5 text-green-600 dark:text-green-400' />
              </span>
            )}
            {hasBlocked && (
              <span className='flex h-4 w-4 items-center justify-center rounded-full bg-red-100 dark:bg-red-900'>
                <AlertTriangle className='h-2.5 w-2.5 text-red-600 dark:text-red-400' />
              </span>
            )}
          </div>
          <p className='text-muted-foreground truncate text-xs'>
            {pipeline.university_name ?? 'No university'}
            {pipeline.country_name && ` \u00B7 ${pipeline.country_name}`}
          </p>
          {/* Courses */}
          {(pipeline as any).courses?.length > 0 && (
            <div className='flex flex-wrap items-center gap-1'>
              {((pipeline as any).courses as { id: string; name: string }[])
                .slice(0, 2)
                .map((c) => (
                  <span
                    key={c.id}
                    className='bg-muted max-w-[140px] truncate rounded px-1.5 py-0.5 text-[10px]'
                  >
                    {c.name}
                  </span>
                ))}
              {(pipeline as any).courses.length > 2 && (
                <span className='text-muted-foreground text-[10px]'>
                  +{(pipeline as any).courses.length - 2} more
                </span>
              )}
            </div>
          )}
        </div>

        {/* Current stage */}
        <div className='hidden max-w-[220px] min-w-0 md:block'>
          {activeStageLabel ? (
            <div className='flex items-center gap-1.5'>
              <div
                className={cn(
                  'h-2 w-2 shrink-0 rounded-full',
                  hasBlocked ? 'animate-pulse bg-red-500' : 'bg-blue-500'
                )}
              />
              <span className='truncate text-xs'>{activeStageLabel}</span>
            </div>
          ) : (
            <span className='text-muted-foreground text-xs'>
              {completedCount >= totalStages && totalStages > 0
                ? 'Completed'
                : 'No active stage'}
            </span>
          )}
        </div>

        {/* Stage progress dots (only when stage_instances available) */}
        {stages.length > 0 ? (
          <div className='hidden items-center gap-[3px] xl:flex'>
            {stages.slice(0, 16).map((s) => (
              <div
                key={s.id}
                className={cn(
                  'h-2 w-2 rounded-full transition-colors',
                  s.status === 'COMPLETED' && 'bg-green-500',
                  s.status === 'ACTIVE' &&
                    'bg-blue-500 ring-2 ring-blue-500/30',
                  s.status === 'BLOCKED' && 'animate-pulse bg-red-500',
                  s.status === 'SKIPPED' && 'bg-amber-400',
                  s.status === 'PENDING' && 'bg-muted-foreground/20'
                )}
                title={`${s.stage_order}. ${s.stage_name} — ${s.status}`}
              />
            ))}
          </div>
        ) : (
          /* Fallback mini progress bar when dots unavailable */
          <div className='hidden items-center gap-2 xl:flex'>
            <Progress value={progressPct} className='h-1.5 w-20' />
          </div>
        )}

        {/* Progress bar for smaller screens */}
        <div className='flex items-center gap-2 xl:hidden'>
          <Progress value={progressPct} className='h-1.5 w-16' />
        </div>
        <span className='text-muted-foreground w-10 text-right font-mono text-xs tabular-nums'>
          {completedCount}/{totalStages}
        </span>

        {/* Quick link to application detail */}
        {(pipeline as any).application_id && (
          <a
            href={`/admin/applications/${(pipeline as any).application_id}`}
            onClick={(e) => e.stopPropagation()}
            className='text-primary hidden shrink-0 text-[10px] font-medium hover:underline lg:block'
            title='View Application'
          >
            App →
          </a>
        )}

        <ChevronRight className='text-muted-foreground h-4 w-4 shrink-0 opacity-0 transition-opacity group-hover:opacity-100' />
      </div>
    </Link>
  );
}

/* ── Board View ── */

function PipelineBoard({ pipelines }: { pipelines: StudentPipeline[] }) {
  const isCompleted = (p: StudentPipeline) => {
    const t = p.total_stages ?? 0;
    const c = p.completed_stages ?? 0;
    return t > 0 && c >= t;
  };

  const columns = [
    {
      key: 'active',
      label: 'In Progress',
      color: 'bg-blue-500',
      students: pipelines.filter((p) => !p.has_blocked && !isCompleted(p))
    },
    {
      key: 'blocked',
      label: 'Blocked',
      color: 'bg-red-500',
      students: pipelines.filter((p) => p.has_blocked)
    },
    {
      key: 'completed',
      label: 'Completed',
      color: 'bg-green-500',
      students: pipelines.filter(isCompleted)
    }
  ];

  return (
    <div className='-mx-2 overflow-x-auto px-2 pb-4'>
      <div className='flex gap-3' style={{ minWidth: columns.length * 280 }}>
        {columns.map((col) => (
          <div key={col.key} className='min-w-[260px] flex-1'>
            {/* Column header */}
            <div className='mb-2 flex items-center gap-2 px-1'>
              <div className={cn('h-2 w-2 rounded-full', col.color)} />
              <span className='text-sm font-semibold'>{col.label}</span>
              <span className='text-muted-foreground ml-auto text-xs tabular-nums'>
                {col.students.length}
              </span>
            </div>
            {/* Column body */}
            <div className='bg-muted/30 min-h-[300px] space-y-2 rounded-xl border border-dashed p-2'>
              {col.students.length === 0 ? (
                <div className='flex items-center justify-center py-12'>
                  <p className='text-muted-foreground text-xs'>No students</p>
                </div>
              ) : (
                col.students.map((pipeline) => (
                  <BoardCard key={pipeline.id} pipeline={pipeline} />
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BoardCard({ pipeline }: { pipeline: StudentPipeline }) {
  const totalStages =
    pipeline.total_stages ?? pipeline.stage_instances?.length ?? 0;
  const completedCount = pipeline.completed_stages ?? 0;
  const progressPct =
    totalStages > 0 ? Math.round((completedCount / totalStages) * 100) : 0;
  const activeStageInfo = pipeline.active_stage as unknown as {
    stage_name?: string;
    stage_order?: number;
  } | null;

  return (
    <Link href={`/admin/pipeline/${pipeline.id}`}>
      <Card className='group bg-background hover:border-border cursor-pointer border-transparent p-0 shadow-sm transition-all hover:shadow-md'>
        <CardContent className='p-3'>
          <div className='flex items-start gap-2.5'>
            <div
              className={cn(
                'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white',
                hashColor(pipeline.student_name)
              )}
            >
              {getInitials(pipeline.student_name)}
            </div>
            <div className='min-w-0 flex-1'>
              <div className='flex items-center justify-between'>
                <p className='truncate text-sm font-semibold'>
                  {pipeline.student_name ?? 'Unknown'}
                </p>
                {pipeline.flow_type && (
                  <Badge
                    className={cn(
                      'ml-1 shrink-0 px-1 py-0 text-[9px]',
                      FLOW_TYPE_COLOR[pipeline.flow_type]
                    )}
                  >
                    {pipeline.flow_type === 'LOCAL' ? 'L' : 'A'}
                  </Badge>
                )}
              </div>
              <p className='text-muted-foreground truncate text-[11px]'>
                {pipeline.university_name ?? 'No university'}
              </p>
              {/* Course count badge */}
              {(pipeline as any).courses?.length > 0 && (
                <p className='text-muted-foreground text-[10px]'>
                  {(pipeline as any).courses.length} course
                  {(pipeline as any).courses.length !== 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>

          {/* Current stage */}
          {activeStageInfo && (
            <div className='mt-2.5 flex items-center gap-1.5 rounded-md bg-blue-50 px-2 py-1 dark:bg-blue-950/30'>
              <ArrowRight className='h-3 w-3 text-blue-500' />
              <span className='truncate text-[11px] text-blue-700 dark:text-blue-300'>
                {activeStageInfo.stage_order}. {activeStageInfo.stage_name}
              </span>
            </div>
          )}

          {/* Progress bar */}
          <div className='mt-2.5 flex items-center gap-2'>
            <Progress value={progressPct} className='h-1.5 flex-1' />
            <span className='text-muted-foreground text-[10px] font-medium tabular-nums'>
              {completedCount}/{totalStages}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
