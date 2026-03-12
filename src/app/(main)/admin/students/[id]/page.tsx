'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter, useParams } from 'next/navigation';
import useClientApi from '@/lib/axios/clientSide';
import PageContainer from '@/components/layout/page-container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import {
  Briefcase,
  Heart,
  Bell,
  Kanban,
  CheckCircle,
  Circle,
  AlertTriangle,
  Clock,
  SkipForward,
  ArrowRight,
  FileText,
  CreditCard,
  ExternalLink
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  type StudentPipeline,
  type PipelinesResponse,
  PIPELINE_STAGES,
  STAGE_STATUS_COLOR
} from '@/features/pipeline/types';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface StudentResults {
  o_level_result?: {
    school?: string;
    division?: string;
    points?: number | null;
    reg_no?: string;
    transcript?: string;
  };
  o_level_grades?: {
    id: string;
    subject: { id: string; name: string };
    grade: { id: string; grade: string };
  }[];
  a_level_result?: {
    school?: string;
    division?: string;
    points?: number | null;
    reg_no?: string;
    transcript?: string;
  };
  a_level_grades?: {
    id: string;
    subject: { id: string; name: string };
    grade: { id: string; grade: string };
  }[];
}

interface StudentDetails {
  id: string;
  user: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    phone_number: string;
    profile_image: string;
    created_at: string;
    updated_at: string;
    last_login: string;
    is_active: boolean;
  };
  user_name: string;
  user_email: string;
  email: string;
  education_level: string;
  reg_prog: number;
  maritial_status: string;
  about_us: string;
  balance: number;
  earnings: number;
  created_at: string;
  updated_at: string;
  referral_count: number;
  subscription: {
    status: string;
    type: string;
    expires_at: string | null;
    subscription_details: {
      name: string;
      description: string;
      duration: string;
      amount: number;
    } | null;
  };
  payments: {
    total_amount: number;
    total_count: number;
    recent_payments: any[];
  };
  profile_complete: number;
  no_favs: number;
  no_abroad_apps: number;
  no_notifs: number;
  total_referrals: number;
  referral_code: string;
  results?: StudentResults;
  passport?: string;
}

const statusIcon: Record<string, React.ReactNode> = {
  NOT_STARTED: <Circle className='text-muted-foreground h-3 w-3' />,
  IN_PROGRESS: <Clock className='h-3 w-3 text-blue-500' />,
  COMPLETED: <CheckCircle className='h-3 w-3 text-green-500' />,
  BLOCKED: <AlertTriangle className='h-3 w-3 text-red-500' />,
  SKIPPED: <SkipForward className='h-3 w-3 text-yellow-500' />
};

export default function StudentDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { api } = useClientApi();
  const studentId = params.id as string;

  const {
    data: student,
    isLoading,
    error
  } = useQuery<StudentDetails>({
    queryKey: ['student', studentId],
    queryFn: async () => {
      if (!api) throw new Error('API not initialized');
      const response = await api.get(`/admin/students/${studentId}/`);
      return response.data;
    },
    enabled: !!studentId && !!api
  });

  // Fetch pipeline for this student
  const { data: pipelineData } = useQuery<PipelinesResponse>({
    queryKey: ['student-pipeline', studentId],
    queryFn: async () => {
      if (!api) throw new Error('API not initialized');
      const response = await api.get(`/admin/pipelines/?student=${studentId}`);
      return response.data;
    },
    enabled: !!api && !!studentId
  });

  const pipeline = pipelineData?.results?.[0] ?? null;

  if (isLoading) {
    return (
      <PageContainer>
        <div className='flex h-96 items-center justify-center'>
          <p>Loading student details...</p>
        </div>
      </PageContainer>
    );
  }

  if (error || !student) {
    return (
      <PageContainer>
        <div className='flex h-96 items-center justify-center'>
          <p className='text-red-500'>Error loading student details</p>
        </div>
      </PageContainer>
    );
  }

  const completedStages =
    pipeline?.stages?.filter((s) => s.status === 'COMPLETED').length ?? 0;
  const pipelineProgress = pipeline
    ? Math.round((completedStages / 16) * 100)
    : 0;

  const phaseLabel: Record<string, string> = {
    CONSULTATION: 'Consultation',
    PRE_APPLICATION: 'Pre-Application',
    POST_APPLICATION: 'Post-Application',
    ORIENTATION: 'Orientation',
    DEPARTED: 'Departed',
    MONITORING: 'Monitoring'
  };

  return (
    <PageContainer>
      <div className='space-y-6'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold'>{student.user_name}</h1>
            <p className='text-muted-foreground'>
              {student?.email || student.user.email}
            </p>
          </div>
          <div className='flex gap-2'>
            {pipeline && (
              <Link href={`/admin/pipeline/${pipeline.id}`}>
                <Button variant='outline'>
                  <Kanban className='mr-2 h-4 w-4' />
                  View Pipeline
                </Button>
              </Link>
            )}
            <Button
              variant='outline'
              onClick={() => router.push(`/admin/students/${studentId}/edit`)}
            >
              Edit
            </Button>
            <Button
              variant='default'
              onClick={() => router.push('/admin/students')}
            >
              Back to List
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className='grid grid-cols-1 gap-4 md:grid-cols-5'>
          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium'>Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant={student.user.is_active ? 'default' : 'secondary'}>
                {student.user.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </CardContent>
          </Card>
          {pipeline ? (
            <Card>
              <CardHeader className='pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Pipeline Phase
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant='outline'>
                  {phaseLabel[pipeline.current_phase] ?? pipeline.current_phase}
                </Badge>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader className='pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Subscription
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Badge
                  variant={
                    student.subscription.status === 'active'
                      ? 'default'
                      : 'secondary'
                  }
                >
                  {student.subscription.type === 'inactive'
                    ? 'Inactive'
                    : student.subscription.type}
                </Badge>
              </CardContent>
            </Card>
          )}
          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium'>
                {pipeline ? 'Pipeline Progress' : 'Profile Progress'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Progress
                value={pipeline ? pipelineProgress : student.profile_complete}
                className='mb-1'
              />
              <p className='text-muted-foreground text-sm'>
                {pipeline
                  ? `${completedStages}/16 stages`
                  : `${student.profile_complete}%`}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium'>Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-lg font-semibold'>
                {formatCurrency(student?.balance || 0)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium'>
                Applications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-lg font-semibold'>{student.no_abroad_apps}</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs
          defaultValue={pipeline ? 'pipeline' : 'profile'}
          className='space-y-4'
        >
          <TabsList>
            {pipeline && <TabsTrigger value='pipeline'>Pipeline</TabsTrigger>}
            <TabsTrigger value='profile'>Profile</TabsTrigger>
            <TabsTrigger value='financial'>Financial</TabsTrigger>
            <TabsTrigger value='activity'>Activity</TabsTrigger>
            <TabsTrigger value='referrals'>Referrals</TabsTrigger>
          </TabsList>

          {/* Pipeline Tab */}
          {pipeline && (
            <TabsContent value='pipeline' className='space-y-4'>
              <Card>
                <CardHeader className='flex flex-row items-center justify-between'>
                  <CardTitle>Pipeline Journey</CardTitle>
                  <Link href={`/admin/pipeline/${pipeline.id}`}>
                    <Button variant='outline' size='sm'>
                      Full Details
                      <ExternalLink className='ml-1 h-3 w-3' />
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  <div className='grid grid-cols-1 gap-2 md:grid-cols-2'>
                    <div className='space-y-1'>
                      <p className='text-muted-foreground text-xs font-medium'>
                        Assigned Staff
                      </p>
                      <p className='text-sm font-medium'>
                        {pipeline.assigned_staff_name ?? 'Unassigned'}
                      </p>
                    </div>
                    <div className='space-y-1'>
                      <p className='text-muted-foreground text-xs font-medium'>
                        University
                      </p>
                      <p className='text-sm font-medium'>
                        {pipeline.university_name ?? 'Not selected'}
                        {pipeline.country_name && ` — ${pipeline.country_name}`}
                      </p>
                    </div>
                    <div className='space-y-1'>
                      <p className='text-muted-foreground text-xs font-medium'>
                        Started
                      </p>
                      <p className='text-sm font-medium'>
                        {format(new Date(pipeline.started_at), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <div className='space-y-1'>
                      <p className='text-muted-foreground text-xs font-medium'>
                        Progress
                      </p>
                      <p className='text-sm font-medium'>
                        {completedStages} of 16 stages complete (
                        {pipelineProgress}%)
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Stage Progress */}
              <Card>
                <CardHeader>
                  <CardTitle>Stage Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='space-y-4'>
                    <div>
                      <h4 className='text-muted-foreground mb-2 text-xs font-semibold'>
                        Pre-Application
                      </h4>
                      <div className='space-y-1'>
                        {PIPELINE_STAGES.filter((s) => s.phase === 'pre').map(
                          (stage) => {
                            const ps = pipeline.stages?.find(
                              (p) => p.stage_type === stage.key
                            );
                            const status = ps?.status ?? 'NOT_STARTED';
                            return (
                              <div
                                key={stage.key}
                                className='flex items-center gap-2 py-1'
                              >
                                {statusIcon[status]}
                                <span className='text-muted-foreground w-4 font-mono text-xs'>
                                  {stage.number}.
                                </span>
                                <span
                                  className={cn(
                                    'flex-1 text-sm',
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
                      <h4 className='text-muted-foreground mb-2 text-xs font-semibold'>
                        Post-Application
                      </h4>
                      <div className='space-y-1'>
                        {PIPELINE_STAGES.filter((s) => s.phase === 'post').map(
                          (stage) => {
                            const ps = pipeline.stages?.find(
                              (p) => p.stage_type === stage.key
                            );
                            const status = ps?.status ?? 'NOT_STARTED';
                            return (
                              <div
                                key={stage.key}
                                className='flex items-center gap-2 py-1'
                              >
                                {statusIcon[status]}
                                <span className='text-muted-foreground w-4 font-mono text-xs'>
                                  {stage.number}.
                                </span>
                                <span
                                  className={cn(
                                    'flex-1 text-sm',
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
            </TabsContent>
          )}

          {/* Profile Tab */}
          <TabsContent value='profile' className='space-y-4'>
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                  <div className='space-y-1'>
                    <p className='text-muted-foreground text-sm font-medium'>
                      Full Name
                    </p>
                    <p className='font-medium'>{student.user_name}</p>
                  </div>
                  <div className='space-y-1'>
                    <p className='text-muted-foreground text-sm font-medium'>
                      Email
                    </p>
                    <p className='font-medium'>{student.user_email}</p>
                  </div>
                  <div className='space-y-1'>
                    <p className='text-muted-foreground text-sm font-medium'>
                      Education Level
                    </p>
                    <p className='font-medium'>
                      {student.education_level || 'Not Set'}
                    </p>
                  </div>
                  <div className='space-y-1'>
                    <p className='text-muted-foreground text-sm font-medium'>
                      Marital Status
                    </p>
                    <p className='font-medium'>
                      {student.maritial_status || 'Not Set'}
                    </p>
                  </div>
                  <div className='space-y-1'>
                    <p className='text-muted-foreground text-sm font-medium'>
                      Joined Date
                    </p>
                    <p className='font-medium'>
                      {student.created_at
                        ? format(parseISO(student.created_at), 'PPP')
                        : 'N/A'}
                    </p>
                  </div>
                  <div className='space-y-1'>
                    <p className='text-muted-foreground text-sm font-medium'>
                      Last Login
                    </p>
                    <p className='font-medium'>
                      {student.user.last_login
                        ? format(parseISO(student.user.updated_at), 'PPP')
                        : 'Never'}
                    </p>
                  </div>
                </div>
                {student.about_us && (
                  <div className='space-y-1'>
                    <p className='text-muted-foreground text-sm font-medium'>
                      About
                    </p>
                    <p className='font-medium'>{student.about_us}</p>
                  </div>
                )}
                {student.passport && (
                  <div className='space-y-1'>
                    <p className='text-muted-foreground text-sm font-medium'>
                      Passport
                    </p>
                    <a
                      href={student.passport}
                      target='_blank'
                      rel='noopener noreferrer'
                    >
                      <img
                        src={student.passport}
                        alt='Passport'
                        className='max-w-[180px] rounded-lg border'
                      />
                    </a>
                  </div>
                )}
                {student.results && (
                  <div className='mt-6 space-y-4'>
                    <h2 className='text-lg font-semibold'>Student Results</h2>
                    <ResultsSection
                      title='O-Level Results'
                      result={student.results.o_level_result}
                      grades={student.results.o_level_grades}
                    />
                    <ResultsSection
                      title='A-Level Results'
                      result={student.results.a_level_result}
                      grades={student.results.a_level_grades}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Financial Tab */}
          <TabsContent value='financial' className='space-y-4'>
            <Card>
              <CardHeader>
                <CardTitle>Payment Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                  <div className='space-y-1'>
                    <p className='text-muted-foreground text-sm font-medium'>
                      Total Payments
                    </p>
                    <p className='text-2xl font-bold'>
                      {formatCurrency(student.payments.total_amount)}
                    </p>
                    <p className='text-muted-foreground text-xs'>
                      {student.payments.total_count} transactions
                    </p>
                  </div>
                  <div className='space-y-1'>
                    <p className='text-muted-foreground text-sm font-medium'>
                      Current Balance
                    </p>
                    <p className='text-2xl font-bold'>
                      {formatCurrency(student?.balance || 0)}
                    </p>
                  </div>
                  <div className='space-y-1'>
                    <p className='text-muted-foreground text-sm font-medium'>
                      Total Earnings
                    </p>
                    <p className='text-2xl font-bold'>
                      {formatCurrency(student?.earnings || 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            {student.payments.recent_payments.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Recent Payments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='space-y-4'>
                    {student.payments.recent_payments.map((payment: any) => (
                      <div
                        key={payment.id}
                        className='flex items-center justify-between'
                      >
                        <div>
                          <p className='font-medium'>
                            {formatCurrency(payment.amount)}
                          </p>
                          <p className='text-muted-foreground text-sm'>
                            {format(parseISO(payment.created_at), 'PP')}
                          </p>
                        </div>
                        <Badge
                          variant={
                            payment.status === 'completed'
                              ? 'default'
                              : 'secondary'
                          }
                        >
                          {payment.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value='activity' className='space-y-4'>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
              <Card>
                <CardHeader className='flex flex-row items-center justify-between pb-2'>
                  <CardTitle className='text-sm font-medium'>
                    Favorites
                  </CardTitle>
                  <Heart className='text-muted-foreground h-4 w-4' />
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>{student.no_favs}</div>
                  <p className='text-muted-foreground text-xs'>
                    Courses, universities, careers, countries
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className='flex flex-row items-center justify-between pb-2'>
                  <CardTitle className='text-sm font-medium'>
                    Applications
                  </CardTitle>
                  <Briefcase className='text-muted-foreground h-4 w-4' />
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>
                    {student.no_abroad_apps}
                  </div>
                  <p className='text-muted-foreground text-xs'>
                    Study abroad applications
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className='flex flex-row items-center justify-between pb-2'>
                  <CardTitle className='text-sm font-medium'>
                    Notifications
                  </CardTitle>
                  <Bell className='text-muted-foreground h-4 w-4' />
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>{student.no_notifs}</div>
                  <p className='text-muted-foreground text-xs'>
                    Unread notifications
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Referrals Tab */}
          <TabsContent value='referrals' className='space-y-4'>
            <Card>
              <CardHeader>
                <CardTitle>Referral Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                  <div className='space-y-1'>
                    <p className='text-muted-foreground text-sm font-medium'>
                      Referral Code
                    </p>
                    <p className='font-mono font-medium'>
                      {student.referral_code}
                    </p>
                  </div>
                  <div className='space-y-1'>
                    <p className='text-muted-foreground text-sm font-medium'>
                      Total Referrals
                    </p>
                    <p className='text-2xl font-bold'>
                      {student.total_referrals}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageContainer>
  );
}

function ResultsSection({
  title,
  result,
  grades
}: {
  title: string;
  result?: {
    school?: string;
    division?: string;
    points?: number | null;
    reg_no?: string;
    transcript?: string;
  };
  grades?: {
    id: string;
    subject: { id: string; name: string };
    grade: { id: string; grade: string };
  }[];
}) {
  if (!result) {
    return (
      <div className='space-y-2'>
        <h3 className='font-semibold'>{title}</h3>
        <p className='text-muted-foreground text-sm'>
          No {title.toLowerCase()} available.
        </p>
      </div>
    );
  }

  return (
    <div className='space-y-2'>
      <h3 className='font-semibold'>{title}</h3>
      <div className='grid grid-cols-2 gap-2 text-sm'>
        <div>
          <span className='font-medium'>School:</span> {result.school || 'N/A'}
        </div>
        <div>
          <span className='font-medium'>Reg No:</span> {result.reg_no || 'N/A'}
        </div>
        <div>
          <span className='font-medium'>Division:</span>{' '}
          {result.division || 'N/A'}
        </div>
        <div>
          <span className='font-medium'>Points:</span> {result.points ?? 'N/A'}
        </div>
      </div>
      {result.transcript && (
        <a
          href={result.transcript}
          target='_blank'
          rel='noopener noreferrer'
          className='text-sm text-blue-600 underline'
        >
          View Transcript
        </a>
      )}
      {grades && grades.length > 0 && (
        <div>
          <span className='text-sm font-medium'>Subjects & Grades:</span>
          <ul className='ml-6 list-disc text-sm'>
            {grades.map((g) => (
              <li key={g.id}>
                {g.subject?.name}: {g.grade?.grade}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
