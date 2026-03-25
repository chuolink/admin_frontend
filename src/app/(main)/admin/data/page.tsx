'use client';

import { useQuery } from '@tanstack/react-query';
import useClientApi from '@/lib/axios/clientSide';
import PageContainer from '@/components/layout/page-container';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import {
  Globe,
  GraduationCap,
  BookOpen,
  Library,
  School,
  Briefcase,
  Receipt,
  Settings2,
  ArrowRight,
  AlertCircle,
  Database
} from 'lucide-react';
import { cn } from '@/lib/utils';

/* ===== Color tokens ===== */

const METRIC_COLORS = {
  blue: {
    iconBg: 'bg-blue-100 dark:bg-blue-500/10',
    iconText: 'text-blue-600 dark:text-blue-400'
  },
  emerald: {
    iconBg: 'bg-emerald-100 dark:bg-emerald-500/10',
    iconText: 'text-emerald-600 dark:text-emerald-400'
  },
  violet: {
    iconBg: 'bg-violet-100 dark:bg-violet-500/10',
    iconText: 'text-violet-600 dark:text-violet-400'
  },
  amber: {
    iconBg: 'bg-amber-100 dark:bg-amber-500/10',
    iconText: 'text-amber-600 dark:text-amber-400'
  }
} as const;

type MetricColor = keyof typeof METRIC_COLORS;

/* ===== Types ===== */

interface DataStats {
  countries_count: number;
  universities_count: number;
  courses_count: number;
  course_offerings_count: number;
  countries_expenses_count: number;
  countries_faqs_count: number;
  universities_public_count: number;
  universities_private_count: number;
  courses_active_count: number;
  courses_disciplines_count: number;
  offerings_active_count: number;
  offerings_with_requirements_count: number;
  a_level_subjects_count: number;
  o_level_subjects_count: number;
  careers_count: number;
  scholarships_count: number;
}

/* ===== Category config ===== */

interface CategoryConfig {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  getCount: (s: DataStats) => number | string;
  getDescription: (s: DataStats) => string;
  color: MetricColor;
}

const CATEGORIES: CategoryConfig[] = [
  {
    title: 'Countries',
    icon: Globe,
    href: '/admin/data/countries',
    getCount: (s) => s.countries_count,
    getDescription: (s) =>
      `${s.countries_expenses_count} expenses \u00b7 ${s.countries_faqs_count} FAQs`,
    color: 'blue'
  },
  {
    title: 'Universities',
    icon: GraduationCap,
    href: '/admin/data/universities',
    getCount: (s) => s.universities_count,
    getDescription: (s) =>
      `${s.universities_public_count} public \u00b7 ${s.universities_private_count} private`,
    color: 'emerald'
  },
  {
    title: 'Courses',
    icon: BookOpen,
    href: '/admin/data/courses',
    getCount: (s) => s.courses_count,
    getDescription: (s) =>
      `${s.courses_active_count} active \u00b7 ${s.courses_disciplines_count} disciplines`,
    color: 'violet'
  },
  {
    title: 'Course Offerings',
    icon: Library,
    href: '/admin/data/course-offerings',
    getCount: (s) => s.course_offerings_count,
    getDescription: (s) =>
      `${s.offerings_active_count} active \u00b7 ${s.offerings_with_requirements_count} with requirements`,
    color: 'amber'
  },
  {
    title: 'Academics',
    icon: School,
    href: '/admin/data/academics',
    getCount: (s) => s.a_level_subjects_count + s.o_level_subjects_count,
    getDescription: (s) =>
      `${s.a_level_subjects_count} A-Level \u00b7 ${s.o_level_subjects_count} O-Level subjects`,
    color: 'blue'
  },
  {
    title: 'Careers',
    icon: Briefcase,
    href: '/admin/data/careers',
    getCount: (s) => s.careers_count,
    getDescription: (s) => `${s.scholarships_count} scholarships`,
    color: 'emerald'
  },
  {
    title: 'Expenses',
    icon: Receipt,
    href: '/admin/data/expenses',
    getCount: () => '\u2014',
    getDescription: () => 'General expenses',
    color: 'violet'
  },
  {
    title: 'System',
    icon: Settings2,
    href: '/admin/data/system',
    getCount: () => '\u2014',
    getDescription: () => 'Constants & config',
    color: 'amber'
  }
];

/* ===== Page Component ===== */

export default function DataManagerPage() {
  const { api } = useClientApi();

  const { data, isLoading, isError } = useQuery<DataStats>({
    queryKey: ['data-manager-stats'],
    queryFn: async () => {
      const response = await api?.get('/data-admin/stats/');
      return response?.data;
    },
    enabled: !!api
  });

  if (isLoading) return <DataManagerSkeleton />;

  if (isError) {
    return (
      <PageContainer className='w-full'>
        <div className='flex w-full flex-col items-center justify-center gap-3 py-20'>
          <AlertCircle className='text-muted-foreground h-10 w-10' />
          <p className='text-muted-foreground text-sm'>
            Failed to load data manager stats. Please try again later.
          </p>
        </div>
      </PageContainer>
    );
  }

  const stats: DataStats = {
    countries_count: 0,
    universities_count: 0,
    courses_count: 0,
    course_offerings_count: 0,
    countries_expenses_count: 0,
    countries_faqs_count: 0,
    universities_public_count: 0,
    universities_private_count: 0,
    courses_active_count: 0,
    courses_disciplines_count: 0,
    offerings_active_count: 0,
    offerings_with_requirements_count: 0,
    a_level_subjects_count: 0,
    o_level_subjects_count: 0,
    careers_count: 0,
    scholarships_count: 0,
    ...data
  };

  const topMetrics: {
    title: string;
    value: number;
    icon: React.ComponentType<{ className?: string }>;
    color: MetricColor;
    href: string;
  }[] = [
    {
      title: 'Countries',
      value: stats.countries_count,
      icon: Globe,
      color: 'blue',
      href: '/admin/data/countries'
    },
    {
      title: 'Universities',
      value: stats.universities_count,
      icon: GraduationCap,
      color: 'emerald',
      href: '/admin/data/universities'
    },
    {
      title: 'Courses',
      value: stats.courses_count,
      icon: BookOpen,
      color: 'violet',
      href: '/admin/data/courses'
    },
    {
      title: 'Course Offerings',
      value: stats.course_offerings_count,
      icon: Library,
      color: 'amber',
      href: '/admin/data/course-offerings'
    }
  ];

  return (
    <PageContainer className='w-full'>
      <div className='w-full min-w-0 space-y-6'>
        {/* Header */}
        <div>
          <div className='flex items-center gap-2'>
            <Database className='text-muted-foreground h-5 w-5' />
            <h1 className='text-2xl font-semibold tracking-tight'>
              Data Manager
            </h1>
          </div>
          <p className='text-muted-foreground mt-1 text-sm'>
            Manage all system reference data
          </p>
        </div>

        {/* Top Metric Cards */}
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          {topMetrics.map((metric) => {
            const { iconBg, iconText } = METRIC_COLORS[metric.color];
            return (
              <Link key={metric.title} href={metric.href}>
                <Card className='hover:bg-muted/40 cursor-pointer transition-all hover:shadow-sm'>
                  <CardContent className='p-5'>
                    <div className='flex items-center justify-between'>
                      <div className={cn('rounded-lg p-2', iconBg)}>
                        <metric.icon className={cn('h-4 w-4', iconText)} />
                      </div>
                    </div>
                    <p className='mt-3 text-2xl font-semibold tabular-nums'>
                      {metric.value.toLocaleString()}
                    </p>
                    <p className='text-muted-foreground/70 mt-2 text-[11px] font-medium tracking-wider uppercase'>
                      {metric.title}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Category Grid */}
        <div>
          <h2 className='text-muted-foreground mb-3 text-xs font-medium tracking-wider uppercase'>
            Browse by category
          </h2>
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
            {CATEGORIES.map((cat) => {
              const { iconBg, iconText } = METRIC_COLORS[cat.color];
              const count = cat.getCount(stats);
              const description = cat.getDescription(stats);

              return (
                <Link key={cat.title} href={cat.href}>
                  <Card className='group hover:bg-muted/40 h-full cursor-pointer transition-all hover:shadow-sm'>
                    <CardContent className='flex h-full flex-col justify-between p-5'>
                      <div>
                        <div className='flex items-center justify-between'>
                          <div className={cn('rounded-lg p-2', iconBg)}>
                            <cat.icon className={cn('h-4 w-4', iconText)} />
                          </div>
                          <ArrowRight className='text-muted-foreground/0 group-hover:text-muted-foreground/60 h-4 w-4 transition-all group-hover:translate-x-0.5' />
                        </div>
                        <p className='mt-3 text-sm font-medium'>{cat.title}</p>
                        {typeof count === 'number' ? (
                          <p className='mt-0.5 text-xl font-semibold tabular-nums'>
                            {count.toLocaleString()}
                          </p>
                        ) : (
                          <p className='text-muted-foreground mt-0.5 text-xl font-semibold'>
                            {count}
                          </p>
                        )}
                      </div>
                      <p className='text-muted-foreground mt-2 text-xs'>
                        {description}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

/* ===== Skeleton ===== */

function DataManagerSkeleton() {
  return (
    <PageContainer className='w-full'>
      <div className='w-full min-w-0 space-y-6'>
        {/* Header skeleton */}
        <div>
          <Skeleton className='h-7 w-40' />
          <Skeleton className='mt-2 h-4 w-56' />
        </div>

        {/* Top metric skeletons */}
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className='p-5'>
                <Skeleton className='h-8 w-8 rounded-lg' />
                <Skeleton className='mt-3 h-7 w-16' />
                <Skeleton className='mt-2 h-3 w-24' />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Category grid skeletons */}
        <div>
          <Skeleton className='mb-3 h-3 w-28' />
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i}>
                <CardContent className='p-5'>
                  <Skeleton className='h-8 w-8 rounded-lg' />
                  <Skeleton className='mt-3 h-4 w-24' />
                  <Skeleton className='mt-1 h-6 w-12' />
                  <Skeleton className='mt-2 h-3 w-32' />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
