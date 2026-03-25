'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import useClientApi from '@/lib/axios/clientSide';
import PageContainer from '@/components/layout/page-container';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency, cn } from '@/lib/utils';
import {
  ArrowLeft,
  Kanban,
  CheckCircle,
  Circle,
  AlertTriangle,
  Clock,
  SkipForward,
  ExternalLink,
  FileText,
  GraduationCap,
  CreditCard,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Heart,
  Briefcase,
  Bell,
  Share2,
  Shield,
  Activity,
  Wallet,
  TrendingUp,
  Banknote,
  Globe,
  Pencil,
  Play,
  Filter
} from 'lucide-react';
import { format, parseISO, formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  type StudentPipeline,
  type PipelinesResponse,
  type FlowType,
  type JourneyEvent,
  type JourneyEventsResponse,
  STAGE_STATUS_COLOR,
  FLOW_TYPE_COLOR
} from '@/features/pipeline/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { toast } from 'sonner';
import Link from 'next/link';
import ParentInfoCard from './ParentInfoCard';
import SendNotificationDialog from '../../applications/[id]/SendNotificationDialog';

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
  bank_transactions?: {
    total_amount: number;
    total_count: number;
    recent_transactions: any[];
  };
  mobile_transactions?: {
    total_amount: number;
    total_count: number;
    recent_transactions: any[];
  };
  profile_complete: number;
  no_favs: number;
  no_abroad_apps: number;
  no_notifs: number;
  no_payments?: number;
  total_referrals: number;
  referral_code: string;
  total_earnings?: number;
  results?: StudentResults;
  passport?: string;
}

const statusIcon: Record<string, React.ReactNode> = {
  NOT_STARTED: <Circle className='text-muted-foreground h-3.5 w-3.5' />,
  IN_PROGRESS: <Clock className='h-3.5 w-3.5 text-blue-500' />,
  COMPLETED: <CheckCircle className='h-3.5 w-3.5 text-green-500' />,
  BLOCKED: <AlertTriangle className='h-3.5 w-3.5 text-red-500' />,
  SKIPPED: <SkipForward className='h-3.5 w-3.5 text-yellow-500' />
};

const EVENT_ICONS: Record<string, React.ElementType> = {
  CALL: Phone,
  CONSULTATION: User,
  STAGE_STARTED: Clock,
  STAGE_COMPLETED: CheckCircle,
  STAGE_BLOCKED: AlertTriangle,
  PHASE_CHANGED: Activity,
  DOCUMENT_UPLOADED: FileText,
  DOCUMENT_VERIFIED: CheckCircle,
  DOCUMENT_REJECTED: AlertTriangle,
  APPLICATION_CREATED: Briefcase,
  APPLICATION_SUBMITTED: Briefcase,
  APPLICATION_APPROVED: CheckCircle,
  APPLICATION_REJECTED: AlertTriangle,
  PAYMENT_CREATED: CreditCard,
  PAYMENT_COMPLETED: CreditCard,
  NOTE: FileText
};

const APP_STATUSES = [
  { value: 'ALL', label: 'All Statuses' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'ADMITTED', label: 'Admitted' },
  { value: 'SUBMITTED', label: 'Submitted' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'REVOKED', label: 'Revoked' },
  { value: 'EXPIRED', label: 'Expired' }
];

export default function StudentDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { api } = useClientApi();
  const queryClient = useQueryClient();
  const studentId = params.id as string;
  const [statusFilter, setStatusFilter] = useState('ALL');

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

  const { data: pipelineData } = useQuery<PipelinesResponse>({
    queryKey: ['student-pipeline', studentId],
    queryFn: async () => {
      if (!api) throw new Error('API not initialized');
      const response = await api.get(
        `/admin/pipelines/?student=${studentId}&page_size=20`
      );
      return response.data;
    },
    enabled: !!api && !!studentId
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: applicationsData } = useQuery<{ results: any[] }>({
    queryKey: ['student-applications', studentId],
    queryFn: async () => {
      if (!api) throw new Error('API not initialized');
      const response = await api.get(`/admin/applications/`, {
        params: { student: studentId, page_size: 20 }
      });
      return response.data;
    },
    enabled: !!api && !!studentId
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: vaultDocsData } = useQuery<{ results: any[] }>({
    queryKey: ['student-vault-docs', studentId],
    queryFn: async () => {
      if (!api) throw new Error('API not initialized');
      const response = await api.get(`/admin/vault-documents/`, {
        params: { student: studentId, page_size: 50 }
      });
      return response.data;
    },
    enabled: !!api && !!studentId
  });

  const { data: eventsData } = useQuery<JourneyEventsResponse>({
    queryKey: ['student-events', studentId],
    queryFn: async () => {
      if (!api) throw new Error('API not initialized');
      const response = await api.get(
        `/admin/journey-events/?student=${studentId}&page_size=50`
      );
      return response.data;
    },
    enabled: !!api && !!studentId
  });

  const pipelines = pipelineData?.results ?? [];
  const pipeline = pipelines[0] ?? null;
  const allApplications = applicationsData?.results ?? [];
  const applications =
    statusFilter === 'ALL'
      ? allApplications
      : allApplications.filter((a: any) => a.status === statusFilter);
  const vaultDocs = vaultDocsData?.results ?? [];
  const events = eventsData?.results ?? [];

  const startPipelineMutation = useMutation({
    mutationFn: async (applicationId: string) => {
      if (!api) throw new Error('API not initialized');
      const response = await api.post(
        `/admin/applications/${applicationId}/start-pipeline/`
      );
      return response.data;
    },
    onSuccess: (data) => {
      toast.success('Pipeline created successfully');
      queryClient.invalidateQueries({
        queryKey: ['student-pipeline', studentId]
      });
      queryClient.invalidateQueries({
        queryKey: ['student-applications', studentId]
      });
      router.push(`/admin/pipeline/${data.pipeline_id}`);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.error || 'Failed to start pipeline';
      if (err?.response?.data?.pipeline_id) {
        toast.info('Pipeline already exists — redirecting...');
        router.push(`/admin/pipeline/${err.response.data.pipeline_id}`);
      } else {
        toast.error(msg);
      }
    }
  });

  if (isLoading) {
    return (
      <PageContainer className='w-full'>
        <div className='space-y-6'>
          <div className='flex items-center gap-4'>
            <Skeleton className='h-10 w-10 rounded-full' />
            <div className='space-y-2'>
              <Skeleton className='h-6 w-[200px]' />
              <Skeleton className='h-4 w-[150px]' />
            </div>
          </div>
          <div className='grid grid-cols-2 gap-4 lg:grid-cols-4'>
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className='h-24 rounded-lg' />
            ))}
          </div>
          <Skeleton className='h-[400px] rounded-lg' />
        </div>
      </PageContainer>
    );
  }

  if (error || !student) {
    return (
      <PageContainer className='w-full'>
        <div className='flex h-96 flex-col items-center justify-center gap-4'>
          <p className='text-destructive text-lg'>
            Error loading student details
          </p>
          <Button
            variant='outline'
            onClick={() => router.push('/admin/students')}
          >
            Back to Students
          </Button>
        </div>
      </PageContainer>
    );
  }

  const completedStages =
    pipeline?.stages?.filter((s) => s.status === 'COMPLETED').length ?? 0;
  const pipelineProgress = pipeline
    ? Math.round((completedStages / 16) * 100)
    : 0;

  const initials = student.user_name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

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
        <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <div className='flex items-center gap-4'>
            <Button
              variant='ghost'
              size='icon'
              onClick={() => router.push('/admin/students')}
              className='shrink-0'
            >
              <ArrowLeft className='h-4 w-4' />
            </Button>
            <div className='bg-primary/10 text-primary flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-lg font-semibold'>
              {student.user.profile_image ? (
                <img
                  src={student.user.profile_image}
                  alt={student.user_name}
                  className='h-12 w-12 rounded-full object-cover'
                />
              ) : (
                initials
              )}
            </div>
            <div className='min-w-0'>
              <div className='flex items-center gap-2'>
                <h1 className='truncate text-2xl font-bold'>
                  {student.user_name}
                </h1>
                <Badge
                  variant={student.user.is_active ? 'default' : 'secondary'}
                  className='shrink-0'
                >
                  {student.user.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <div className='text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1 text-sm'>
                <span className='flex items-center gap-1'>
                  <Mail className='h-3 w-3' />
                  {student.user.email}
                </span>
                {student.user.phone_number && (
                  <span className='flex items-center gap-1'>
                    <Phone className='h-3 w-3' />
                    {student.user.phone_number}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className='flex flex-wrap gap-2 sm:shrink-0'>
            {pipeline && (
              <Link href={`/admin/pipeline/${pipeline.id}`}>
                <Button variant='outline' size='sm'>
                  <Kanban className='mr-1.5 h-4 w-4' />
                  Pipeline
                </Button>
              </Link>
            )}
            <SendNotificationDialog
              studentId={studentId}
              studentName={student.user_name}
            />
            <Button
              variant='outline'
              size='sm'
              onClick={() => router.push(`/admin/students/${studentId}/edit`)}
            >
              <Pencil className='mr-1.5 h-4 w-4' />
              Edit
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className='grid grid-cols-2 gap-3 lg:grid-cols-4'>
          <Card>
            <CardContent className='flex items-center gap-3 pt-4'>
              <div className='bg-primary/10 rounded-lg p-2.5'>
                <Wallet className='text-primary h-5 w-5' />
              </div>
              <div>
                <p className='text-muted-foreground text-xs font-medium'>
                  Balance
                </p>
                <p className='text-lg font-bold tabular-nums'>
                  {formatCurrency(student.balance || 0)}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className='flex items-center gap-3 pt-4'>
              <div className='rounded-lg bg-green-500/10 p-2.5'>
                <CreditCard className='h-5 w-5 text-green-600' />
              </div>
              <div>
                <p className='text-muted-foreground text-xs font-medium'>
                  Total Paid
                </p>
                <p className='text-lg font-bold tabular-nums'>
                  {formatCurrency(student.payments?.total_amount || 0)}
                </p>
                <p className='text-muted-foreground text-[10px]'>
                  {student.payments?.total_count || 0} payments
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className='flex items-center gap-3 pt-4'>
              <div className='rounded-lg bg-blue-500/10 p-2.5'>
                <Briefcase className='h-5 w-5 text-blue-600' />
              </div>
              <div>
                <p className='text-muted-foreground text-xs font-medium'>
                  Applications
                </p>
                <p className='text-lg font-bold'>{student.no_abroad_apps}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className='flex items-center gap-3 pt-4'>
              <div className='rounded-lg bg-purple-500/10 p-2.5'>
                <Share2 className='h-5 w-5 text-purple-600' />
              </div>
              <div>
                <p className='text-muted-foreground text-xs font-medium'>
                  Referrals
                </p>
                <p className='text-lg font-bold'>{student.total_referrals}</p>
                {student.referral_code && (
                  <p className='text-muted-foreground font-mono text-[10px]'>
                    {student.referral_code}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue='overview' className='space-y-4'>
          <TabsList className='flex-wrap'>
            <TabsTrigger value='overview'>Overview</TabsTrigger>
            <TabsTrigger value='applications'>
              Applications
              {allApplications.length > 0 && (
                <Badge
                  variant='secondary'
                  className='ml-1.5 h-5 px-1.5 text-[10px]'
                >
                  {allApplications.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value='academic'>Academic</TabsTrigger>
            <TabsTrigger value='financial'>Financial</TabsTrigger>
            <TabsTrigger value='activity'>Activity</TabsTrigger>
          </TabsList>

          {/* ==================== OVERVIEW TAB ==================== */}
          <TabsContent value='overview' className='space-y-4'>
            <div className='grid gap-4 lg:grid-cols-3'>
              {/* Personal Info Card */}
              <Card className='lg:col-span-2'>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2 text-base'>
                    <User className='h-4 w-4' /> Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2'>
                    <InfoField label='Full Name' value={student.user_name} />
                    <InfoField label='Email' value={student.user.email} />
                    <InfoField
                      label='Phone'
                      value={student.user.phone_number || 'Not provided'}
                    />
                    <InfoField
                      label='Education Level'
                      value={
                        student.education_level
                          ? student.education_level
                              .replace(/_/g, ' ')
                              .replace(/\b\w/g, (l) => l.toUpperCase())
                          : 'Not Set'
                      }
                    />
                    <InfoField
                      label='Marital Status'
                      value={student.maritial_status || 'Not Set'}
                    />
                    <InfoField
                      label='Profile Completion'
                      value={
                        <div className='flex items-center gap-2'>
                          <Progress
                            value={student.profile_complete}
                            className='h-2 w-20'
                          />
                          <span className='text-xs'>
                            {student.profile_complete}%
                          </span>
                        </div>
                      }
                    />
                    <InfoField
                      label='Joined Date'
                      value={
                        student.created_at
                          ? format(parseISO(student.created_at), 'PPP')
                          : 'N/A'
                      }
                    />
                    <InfoField
                      label='Last Login'
                      value={
                        student.user.last_login
                          ? `${formatDistanceToNow(parseISO(student.user.last_login), { addSuffix: true })}`
                          : 'Never'
                      }
                    />
                  </div>
                  {student.about_us && (
                    <>
                      <Separator className='my-4' />
                      <div>
                        <p className='text-muted-foreground mb-1 text-xs font-medium'>
                          How they found us
                        </p>
                        <p className='text-sm'>{student.about_us}</p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Right Column - Documents, Subscription, Stats */}
              <div className='space-y-4'>
                {/* Documents Overview */}
                <Card>
                  <CardHeader className='pb-3'>
                    <CardTitle className='flex items-center gap-2 text-base'>
                      <FileText className='h-4 w-4' /> Documents
                    </CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-2.5'>
                    {(() => {
                      const verified = vaultDocs.filter(
                        (d) =>
                          d.verification_status === 'VERIFIED' ||
                          d.verification_status === 'verified'
                      ).length;
                      const pending = vaultDocs.filter(
                        (d) =>
                          d.verification_status === 'PENDING' ||
                          d.verification_status === 'pending'
                      ).length;
                      const rejected = vaultDocs.filter(
                        (d) =>
                          d.verification_status === 'REJECTED' ||
                          d.verification_status === 'rejected'
                      ).length;
                      const total = vaultDocs.length;

                      if (total === 0) {
                        return (
                          <p className='text-muted-foreground text-sm'>
                            No documents uploaded yet
                          </p>
                        );
                      }

                      return (
                        <>
                          <StatRow
                            icon={
                              <CheckCircle className='h-4 w-4 text-green-500' />
                            }
                            label='Verified'
                            value={verified}
                          />
                          <StatRow
                            icon={<Clock className='h-4 w-4 text-amber-500' />}
                            label='Pending Review'
                            value={pending}
                          />
                          {rejected > 0 && (
                            <StatRow
                              icon={
                                <AlertTriangle className='h-4 w-4 text-red-500' />
                              }
                              label='Rejected'
                              value={rejected}
                            />
                          )}
                          <Separator />
                          <div className='space-y-1.5'>
                            {vaultDocs.slice(0, 5).map((doc) => (
                              <div
                                key={doc.id}
                                className='flex items-center justify-between text-xs'
                              >
                                <span className='truncate'>
                                  {(doc.document_type || '')
                                    .replace(/_/g, ' ')
                                    .replace(/\b\w/g, (c: string) =>
                                      c.toUpperCase()
                                    )}
                                </span>
                                <Badge
                                  variant={
                                    doc.verification_status === 'VERIFIED' ||
                                    doc.verification_status === 'verified'
                                      ? 'default'
                                      : doc.verification_status ===
                                            'REJECTED' ||
                                          doc.verification_status === 'rejected'
                                        ? 'destructive'
                                        : 'secondary'
                                  }
                                  className='text-[9px]'
                                >
                                  {doc.verification_status}
                                </Badge>
                              </div>
                            ))}
                            {vaultDocs.length > 5 && (
                              <p className='text-muted-foreground text-[10px]'>
                                +{vaultDocs.length - 5} more documents
                              </p>
                            )}
                          </div>
                        </>
                      );
                    })()}
                  </CardContent>
                </Card>

                {/* Subscription */}
                <Card>
                  <CardHeader className='pb-3'>
                    <CardTitle className='flex items-center gap-2 text-base'>
                      <Shield className='h-4 w-4' /> Subscription
                    </CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-3'>
                    <div className='flex items-center justify-between'>
                      <span className='text-muted-foreground text-sm'>
                        Plan
                      </span>
                      <Badge
                        variant={
                          student.subscription.type === 'premium'
                            ? 'default'
                            : student.subscription.type === 'standard'
                              ? 'secondary'
                              : 'outline'
                        }
                        className='capitalize'
                      >
                        {student.subscription.type}
                      </Badge>
                    </div>
                    <div className='flex items-center justify-between'>
                      <span className='text-muted-foreground text-sm'>
                        Status
                      </span>
                      <Badge
                        variant={
                          student.subscription.status === 'active'
                            ? 'default'
                            : 'secondary'
                        }
                        className='capitalize'
                      >
                        {student.subscription.status}
                      </Badge>
                    </div>
                    {student.subscription.expires_at && (
                      <div className='flex items-center justify-between'>
                        <span className='text-muted-foreground text-sm'>
                          Expires
                        </span>
                        <span className='text-sm'>
                          {format(
                            parseISO(student.subscription.expires_at),
                            'PP'
                          )}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Quick Stats */}
                <Card>
                  <CardHeader className='pb-3'>
                    <CardTitle className='flex items-center gap-2 text-base'>
                      <Activity className='h-4 w-4' /> Quick Stats
                    </CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-2.5'>
                    <StatRow
                      icon={<Heart className='h-4 w-4 text-pink-500' />}
                      label='Favorites'
                      value={student.no_favs}
                    />
                    <StatRow
                      icon={<Bell className='h-4 w-4 text-amber-500' />}
                      label='Unread Notifications'
                      value={student.no_notifs}
                    />
                    <StatRow
                      icon={<Share2 className='h-4 w-4 text-purple-500' />}
                      label='Referrals'
                      value={student.total_referrals}
                    />
                    <StatRow
                      icon={<TrendingUp className='h-4 w-4 text-green-500' />}
                      label='Earnings'
                      value={formatCurrency(
                        student.total_earnings || student.earnings || 0
                      )}
                    />
                  </CardContent>
                </Card>

                {student.passport && (
                  <Card>
                    <CardHeader className='pb-3'>
                      <CardTitle className='text-base'>Passport</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <a
                        href={student.passport}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='block'
                      >
                        <img
                          src={student.passport}
                          alt='Passport'
                          className='w-full max-w-[200px] rounded-lg border transition-opacity hover:opacity-80'
                        />
                      </a>
                    </CardContent>
                  </Card>
                )}

                <ParentInfoCard studentId={studentId} />
              </div>
            </div>

            {/* Recent Activity */}
            {events.length > 0 && (
              <Card>
                <CardHeader className='flex flex-row items-center justify-between'>
                  <CardTitle className='flex items-center gap-2 text-base'>
                    <Activity className='h-4 w-4' /> Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='relative space-y-0'>
                    {events.slice(0, 5).map((event, index) => {
                      const Icon = EVENT_ICONS[event.event_type] || Activity;
                      const isLast = index === Math.min(events.length, 5) - 1;
                      return (
                        <div key={event.id} className='flex gap-3'>
                          <div className='relative flex flex-col items-center'>
                            <div className='bg-muted z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full'>
                              <Icon className='text-muted-foreground h-3.5 w-3.5' />
                            </div>
                            {!isLast && (
                              <div className='bg-border w-px flex-1' />
                            )}
                          </div>
                          <div className={cn('pb-4', isLast && 'pb-0')}>
                            <p className='text-sm leading-tight font-medium'>
                              {event.title}
                            </p>
                            {event.description && (
                              <p className='text-muted-foreground mt-0.5 text-xs'>
                                {event.description}
                              </p>
                            )}
                            <p className='text-muted-foreground mt-0.5 text-[10px]'>
                              {formatDistanceToNow(parseISO(event.created_at), {
                                addSuffix: true
                              })}
                              {event.performed_by_name &&
                                ` · by ${event.performed_by_name}`}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {events.length > 5 && (
                    <p className='text-muted-foreground mt-3 text-center text-xs'>
                      +{events.length - 5} more events — see Activity tab
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* ==================== APPLICATIONS TAB ==================== */}
          <TabsContent value='applications' className='space-y-4'>
            {/* Filter Bar */}
            {allApplications.length > 0 && (
              <div className='flex items-center justify-between'>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className='w-[180px]'>
                    <Filter className='mr-2 h-3.5 w-3.5' />
                    <SelectValue placeholder='Filter by status' />
                  </SelectTrigger>
                  <SelectContent>
                    {APP_STATUSES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {statusFilter !== 'ALL' && (
                  <p className='text-muted-foreground text-sm'>
                    {applications.length} of {allApplications.length}{' '}
                    applications
                  </p>
                )}
              </div>
            )}

            {allApplications.length === 0 && pipelines.length === 0 ? (
              <Card>
                <CardContent className='flex flex-col items-center justify-center py-16'>
                  <Briefcase className='text-muted-foreground mb-3 h-10 w-10' />
                  <p className='text-muted-foreground text-sm font-medium'>
                    No applications yet
                  </p>
                  <p className='text-muted-foreground mt-1 max-w-sm text-center text-xs'>
                    Applications created from leads or submitted by the student
                    will appear here with their pipeline progress.
                  </p>
                </CardContent>
              </Card>
            ) : applications.length === 0 && statusFilter !== 'ALL' ? (
              <Card>
                <CardContent className='flex flex-col items-center justify-center py-10'>
                  <Filter className='text-muted-foreground mb-3 h-8 w-8' />
                  <p className='text-muted-foreground text-sm'>
                    No applications with status &quot;{statusFilter}&quot;
                  </p>
                  <Button
                    variant='ghost'
                    size='sm'
                    className='mt-2'
                    onClick={() => setStatusFilter('ALL')}
                  >
                    Clear filter
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className='space-y-4'>
                {applications.map((app) => {
                  const appPipeline = pipelines.find(
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (p: any) => p.application === app.id
                  );
                  // Use stage_instances (new) or fall back to stages (legacy)
                  const stageInstances = appPipeline?.stage_instances ?? [];
                  const hasNewPipeline = stageInstances.length > 0;
                  const pTotalStages =
                    appPipeline?.total_stages ??
                    (hasNewPipeline
                      ? stageInstances.length
                      : (appPipeline?.stages?.length ?? 0));
                  const pCompletedStages =
                    appPipeline?.completed_stages ??
                    (hasNewPipeline
                      ? stageInstances.filter(
                          (s: { status?: string }) => s.status === 'COMPLETED'
                        ).length
                      : (appPipeline?.stages?.filter(
                          (s: { status: string }) => s.status === 'COMPLETED'
                        ).length ?? 0));
                  const pProgress =
                    pTotalStages > 0
                      ? Math.round((pCompletedStages / pTotalStages) * 100)
                      : 0;
                  const blockedStages = hasNewPipeline
                    ? stageInstances.filter(
                        (s: { status?: string }) => s.status === 'BLOCKED'
                      )
                    : (appPipeline?.stages ?? []).filter(
                        (s: { status: string }) => s.status === 'BLOCKED'
                      );
                  const activeStage = hasNewPipeline
                    ? stageInstances.find(
                        (s: { status?: string }) => s.status === 'ACTIVE'
                      )
                    : (appPipeline?.stages ?? []).find(
                        (s: { status: string }) => s.status === 'IN_PROGRESS'
                      );

                  return (
                    <Card key={app.id}>
                      <CardHeader className='pb-3'>
                        <div className='flex items-start justify-between gap-3'>
                          <div className='min-w-0 flex-1'>
                            <div className='flex items-center gap-2.5'>
                              <div className='bg-primary/10 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg'>
                                <GraduationCap className='text-primary h-5 w-5' />
                              </div>
                              <div className='min-w-0'>
                                <CardTitle className='truncate text-base'>
                                  {app.university?.name ??
                                    app.university_name ??
                                    'University'}
                                </CardTitle>
                                <div className='mt-0.5 flex items-center gap-2'>
                                  {app.university?.country?.name && (
                                    <span className='text-muted-foreground flex items-center gap-1 text-xs'>
                                      <Globe className='h-3 w-3' />
                                      {app.university.country.name}
                                    </span>
                                  )}
                                  {app.app_id && (
                                    <span className='text-muted-foreground font-mono text-[10px]'>
                                      {app.app_id}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className='flex shrink-0 items-center gap-2'>
                            <Badge
                              variant={
                                app.status === 'APPROVED' ||
                                app.status === 'ADMITTED'
                                  ? 'default'
                                  : app.status === 'REJECTED' ||
                                      app.status === 'CANCELLED'
                                    ? 'destructive'
                                    : 'secondary'
                              }
                            >
                              {app.status}
                            </Badge>
                            {appPipeline?.is_committed && (
                              <Badge className='bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'>
                                <CheckCircle className='mr-1 h-3 w-3' />
                                Committed
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className='space-y-4'>
                        {/* Courses */}
                        {app.courses && app.courses.length > 0 && (
                          <div>
                            <p className='text-muted-foreground mb-1.5 text-xs font-medium'>
                              Courses Applied
                            </p>
                            <div className='flex flex-wrap gap-1.5'>
                              {app.courses.map((course: any) => (
                                <Badge
                                  key={course.id || course}
                                  variant='outline'
                                  className='text-xs'
                                >
                                  {course.name || course.course_name || course}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Pipeline Progress */}
                        {appPipeline ? (
                          <>
                            <div>
                              <div className='mb-2 flex items-center justify-between'>
                                <p className='text-muted-foreground text-xs font-medium'>
                                  Pipeline Progress
                                </p>
                                <span className='text-muted-foreground text-xs'>
                                  {phaseLabel[appPipeline.current_phase] ??
                                    appPipeline.current_phase}{' '}
                                  &middot; {pCompletedStages}/{pTotalStages}{' '}
                                  stages
                                </span>
                              </div>
                              <Progress value={pProgress} className='h-2' />
                            </div>

                            {/* Stage Grid - dynamic visual overview */}
                            <div>
                              <div className='mb-2 flex items-center justify-between'>
                                <p className='text-muted-foreground text-xs font-medium'>
                                  Stages
                                </p>
                                {appPipeline.flow_type && (
                                  <Badge
                                    className={cn(
                                      'text-[10px]',
                                      FLOW_TYPE_COLOR[
                                        appPipeline.flow_type as FlowType
                                      ]
                                    )}
                                  >
                                    {appPipeline.flow_type === 'LOCAL'
                                      ? 'Local'
                                      : 'Abroad'}
                                  </Badge>
                                )}
                              </div>
                              {hasNewPipeline ? (
                                <>
                                  <div className='grid grid-cols-4 gap-1.5 sm:grid-cols-8'>
                                    {[...stageInstances]
                                      .sort(
                                        (a: any, b: any) =>
                                          a.stage_order - b.stage_order
                                      )
                                      .map((inst: any) => {
                                        const stageStatus =
                                          inst.status ?? 'PENDING';
                                        const bgColor =
                                          stageStatus === 'COMPLETED'
                                            ? 'bg-green-500'
                                            : stageStatus === 'ACTIVE'
                                              ? 'bg-blue-500'
                                              : stageStatus === 'BLOCKED'
                                                ? 'bg-red-500'
                                                : stageStatus === 'SKIPPED'
                                                  ? 'bg-yellow-500'
                                                  : 'bg-muted';
                                        return (
                                          <div
                                            key={inst.id}
                                            className='group relative flex flex-col items-center'
                                            title={`${inst.stage_order}. ${inst.stage_name} — ${stageStatus}`}
                                          >
                                            <div
                                              className={cn(
                                                'h-2 w-full rounded-full transition-all',
                                                bgColor
                                              )}
                                            />
                                            <span className='text-muted-foreground mt-1 w-full truncate text-center text-[9px] leading-tight'>
                                              {inst.stage_order}
                                            </span>
                                          </div>
                                        );
                                      })}
                                  </div>
                                  <div className='mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px]'>
                                    <span className='flex items-center gap-1'>
                                      <span className='inline-block h-2 w-2 rounded-full bg-green-500' />{' '}
                                      Completed
                                    </span>
                                    <span className='flex items-center gap-1'>
                                      <span className='inline-block h-2 w-2 rounded-full bg-blue-500' />{' '}
                                      Active
                                    </span>
                                    <span className='flex items-center gap-1'>
                                      <span className='inline-block h-2 w-2 rounded-full bg-red-500' />{' '}
                                      Blocked
                                    </span>
                                    <span className='flex items-center gap-1'>
                                      <span className='bg-muted inline-block h-2 w-2 rounded-full' />{' '}
                                      Pending
                                    </span>
                                  </div>
                                </>
                              ) : (
                                <p className='text-muted-foreground text-xs'>
                                  Legacy pipeline — open pipeline for details.
                                </p>
                              )}
                            </div>

                            {/* Active & Blocked Stages - quick info */}
                            {(activeStage || blockedStages.length > 0) && (
                              <div className='grid gap-3 sm:grid-cols-2'>
                                {activeStage && (
                                  <div className='rounded-lg border border-blue-200 bg-blue-50/50 p-3 dark:border-blue-800 dark:bg-blue-950/30'>
                                    <div className='flex items-center gap-2 text-xs font-medium text-blue-700 dark:text-blue-300'>
                                      <Clock className='h-3.5 w-3.5' />
                                      Current Stage
                                    </div>
                                    <p className='mt-1 text-sm font-medium'>
                                      {(activeStage as any).stage_order
                                        ? `${(activeStage as any).stage_order}. `
                                        : ''}
                                      {(activeStage as any).stage_name ??
                                        (
                                          activeStage as any
                                        ).stage_type?.replace(/_/g, ' ')}
                                    </p>
                                  </div>
                                )}
                                {blockedStages.length > 0 && (
                                  <div className='rounded-lg border border-red-200 bg-red-50/50 p-3 dark:border-red-800 dark:bg-red-950/30'>
                                    <div className='flex items-center gap-2 text-xs font-medium text-red-700 dark:text-red-300'>
                                      <AlertTriangle className='h-3.5 w-3.5' />
                                      {blockedStages.length} Blocked Stage
                                      {blockedStages.length !== 1 ? 's' : ''}
                                    </div>
                                    <p className='mt-1 text-sm'>
                                      {blockedStages
                                        .map(
                                          (s: any) =>
                                            s.stage_name ??
                                            s.stage_type?.replace(/_/g, ' ')
                                        )
                                        .join(', ')}
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Action buttons */}
                            <div className='flex gap-2 pt-1'>
                              <Link href={`/admin/pipeline/${appPipeline.id}`}>
                                <Button variant='outline' size='sm'>
                                  <Kanban className='mr-1.5 h-4 w-4' />
                                  View Pipeline
                                </Button>
                              </Link>
                              <Link href={`/admin/applications/${app.id}`}>
                                <Button variant='ghost' size='sm'>
                                  <FileText className='mr-1.5 h-4 w-4' />
                                  View Application
                                </Button>
                              </Link>
                            </div>
                          </>
                        ) : (
                          <div className='rounded-lg border border-dashed bg-amber-50/50 p-4 dark:bg-amber-950/20'>
                            <div className='flex items-center justify-between'>
                              <div>
                                <p className='text-sm font-medium'>
                                  No pipeline started
                                </p>
                                <p className='text-muted-foreground mt-0.5 text-xs'>
                                  Pipelines are auto-created when applications
                                  are submitted. You can also start one
                                  manually.
                                </p>
                              </div>
                              <div className='flex gap-2'>
                                <Button
                                  size='sm'
                                  onClick={() =>
                                    startPipelineMutation.mutate(app.id)
                                  }
                                  disabled={startPipelineMutation.isPending}
                                >
                                  <Play className='mr-1.5 h-4 w-4' />
                                  {startPipelineMutation.isPending
                                    ? 'Starting...'
                                    : 'Start Pipeline'}
                                </Button>
                                <Link href={`/admin/applications/${app.id}`}>
                                  <Button variant='outline' size='sm'>
                                    <FileText className='mr-1.5 h-4 w-4' />
                                    View App
                                  </Button>
                                </Link>
                              </div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}

                {/* Orphan Pipelines (no application) */}
                {pipelines
                  .filter((p) => !p.application)
                  .map((p) => {
                    const pTotalOrphan =
                      p.total_stages ??
                      p.stage_instances?.length ??
                      p.stages?.length ??
                      0;
                    const pCompletedStages =
                      p.completed_stages ??
                      p.stage_instances?.filter((s) => s.status === 'COMPLETED')
                        .length ??
                      p.stages?.filter((s) => s.status === 'COMPLETED')
                        .length ??
                      0;
                    const pProgress =
                      pTotalOrphan > 0
                        ? Math.round((pCompletedStages / pTotalOrphan) * 100)
                        : 0;

                    return (
                      <Card key={p.id} className='border-dashed'>
                        <CardHeader className='pb-3'>
                          <div className='flex items-start justify-between'>
                            <div className='flex items-center gap-2.5'>
                              <div className='bg-muted flex h-9 w-9 shrink-0 items-center justify-center rounded-lg'>
                                <Kanban className='text-muted-foreground h-5 w-5' />
                              </div>
                              <div>
                                <CardTitle className='text-base'>
                                  Pipeline (No Application)
                                </CardTitle>
                                <p className='text-muted-foreground text-xs'>
                                  {phaseLabel[p.current_phase] ??
                                    p.current_phase}
                                </p>
                              </div>
                            </div>
                            <Link href={`/admin/pipeline/${p.id}`}>
                              <Button variant='outline' size='sm'>
                                View
                                <ExternalLink className='ml-1.5 h-3.5 w-3.5' />
                              </Button>
                            </Link>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className='mb-1.5 flex items-center justify-between text-xs'>
                            <span className='text-muted-foreground'>
                              Progress
                            </span>
                            <span className='text-muted-foreground'>
                              {pCompletedStages}/{pTotalOrphan} stages (
                              {pProgress}%)
                            </span>
                          </div>
                          <Progress value={pProgress} className='h-2' />
                        </CardContent>
                      </Card>
                    );
                  })}
              </div>
            )}
          </TabsContent>

          {/* ==================== ACADEMIC TAB ==================== */}
          <TabsContent value='academic' className='space-y-4'>
            {student.results ? (
              <div className='grid gap-4 lg:grid-cols-2'>
                <ResultsCard
                  title='O-Level Results'
                  result={student.results.o_level_result}
                  grades={student.results.o_level_grades}
                />
                <ResultsCard
                  title='A-Level Results'
                  result={student.results.a_level_result}
                  grades={student.results.a_level_grades}
                />
              </div>
            ) : (
              <Card>
                <CardContent className='flex flex-col items-center justify-center py-12'>
                  <GraduationCap className='text-muted-foreground mb-3 h-10 w-10' />
                  <p className='text-muted-foreground text-sm'>
                    No academic results submitted yet
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* ==================== FINANCIAL TAB ==================== */}
          <TabsContent value='financial' className='space-y-4'>
            {/* Financial Summary Cards */}
            <div className='grid grid-cols-2 gap-3 lg:grid-cols-4'>
              <Card>
                <CardContent className='pt-4'>
                  <p className='text-muted-foreground text-xs font-medium'>
                    Total Payments
                  </p>
                  <p className='text-xl font-bold tabular-nums'>
                    {formatCurrency(student.payments?.total_amount || 0)}
                  </p>
                  <p className='text-muted-foreground text-[10px]'>
                    {student.payments?.total_count || 0} transactions
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className='pt-4'>
                  <p className='text-muted-foreground text-xs font-medium'>
                    Current Balance
                  </p>
                  <p className='text-xl font-bold tabular-nums'>
                    {formatCurrency(student.balance || 0)}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className='pt-4'>
                  <p className='text-muted-foreground text-xs font-medium'>
                    Total Earnings
                  </p>
                  <p className='text-xl font-bold tabular-nums'>
                    {formatCurrency(
                      student.total_earnings || student.earnings || 0
                    )}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className='pt-4'>
                  <p className='text-muted-foreground text-xs font-medium'>
                    Bank Transactions
                  </p>
                  <p className='text-xl font-bold tabular-nums'>
                    {formatCurrency(
                      student.bank_transactions?.total_amount || 0
                    )}
                  </p>
                  <p className='text-muted-foreground text-[10px]'>
                    {student.bank_transactions?.total_count || 0} transactions
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Payments */}
            {student.payments?.recent_payments &&
              student.payments.recent_payments.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className='text-base'>Recent Payments</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className='space-y-3'>
                      {student.payments.recent_payments.map((payment: any) => (
                        <div
                          key={payment.id}
                          className='flex items-center justify-between rounded-lg border p-3'
                        >
                          <div className='flex items-center gap-3'>
                            <div className='bg-muted rounded-lg p-2'>
                              <CreditCard className='text-muted-foreground h-4 w-4' />
                            </div>
                            <div>
                              <p className='text-sm font-medium'>
                                {formatCurrency(payment.amount)}
                              </p>
                              <p className='text-muted-foreground text-xs'>
                                {payment.name || 'Payment'} &middot;{' '}
                                {payment.mode || 'N/A'}
                              </p>
                            </div>
                          </div>
                          <div className='text-right'>
                            <Badge
                              variant={
                                payment.status === 'success'
                                  ? 'default'
                                  : payment.status === 'failed'
                                    ? 'destructive'
                                    : 'secondary'
                              }
                              className='text-[10px]'
                            >
                              {payment.status}
                            </Badge>
                            <p className='text-muted-foreground mt-0.5 text-[10px]'>
                              {format(parseISO(payment.created_at), 'PP')}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

            {/* Mobile Transactions */}
            {student.mobile_transactions &&
              student.mobile_transactions.recent_transactions?.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className='text-base'>
                      Recent Mobile Transactions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className='space-y-3'>
                      {student.mobile_transactions.recent_transactions.map(
                        (tx: any) => (
                          <div
                            key={tx.id}
                            className='flex items-center justify-between rounded-lg border p-3'
                          >
                            <div className='flex items-center gap-3'>
                              <div className='bg-muted rounded-lg p-2'>
                                <Phone className='text-muted-foreground h-4 w-4' />
                              </div>
                              <div>
                                <p className='text-sm font-medium'>
                                  {formatCurrency(tx.amount)}
                                </p>
                                <p className='text-muted-foreground text-xs'>
                                  Mobile Money
                                </p>
                              </div>
                            </div>
                            <div className='text-right'>
                              <Badge
                                variant={
                                  tx.status === 'completed'
                                    ? 'default'
                                    : 'secondary'
                                }
                                className='text-[10px]'
                              >
                                {tx.status}
                              </Badge>
                              <p className='text-muted-foreground mt-0.5 text-[10px]'>
                                {format(parseISO(tx.created_at), 'PP')}
                              </p>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
          </TabsContent>

          {/* ==================== ACTIVITY TAB ==================== */}
          <TabsContent value='activity' className='space-y-4'>
            {events.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle className='text-base'>Activity Timeline</CardTitle>
                  <CardDescription>
                    Recent events and actions for this student
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='relative space-y-0'>
                    {events.map((event, index) => {
                      const Icon = EVENT_ICONS[event.event_type] || Activity;
                      const isLast = index === events.length - 1;
                      return (
                        <div key={event.id} className='flex gap-3'>
                          <div className='relative flex flex-col items-center'>
                            <div className='bg-muted z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full'>
                              <Icon className='text-muted-foreground h-4 w-4' />
                            </div>
                            {!isLast && (
                              <div className='bg-border w-px flex-1' />
                            )}
                          </div>
                          <div className={cn('pb-6', isLast && 'pb-0')}>
                            <p className='text-sm leading-tight font-medium'>
                              {event.title}
                            </p>
                            {event.description && (
                              <p className='text-muted-foreground mt-0.5 text-xs'>
                                {event.description}
                              </p>
                            )}
                            <div className='text-muted-foreground mt-1 flex items-center gap-2 text-[10px]'>
                              <span>
                                {formatDistanceToNow(
                                  parseISO(event.created_at),
                                  { addSuffix: true }
                                )}
                              </span>
                              {event.performed_by_name && (
                                <>
                                  <span>&middot;</span>
                                  <span>by {event.performed_by_name}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className='flex flex-col items-center justify-center py-12'>
                  <Activity className='text-muted-foreground mb-3 h-10 w-10' />
                  <p className='text-muted-foreground text-sm'>
                    No activity recorded yet
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </PageContainer>
  );
}

/* ==================== SUB-COMPONENTS ==================== */

function InfoField({
  label,
  value
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className='space-y-0.5'>
      <p className='text-muted-foreground text-xs font-medium'>{label}</p>
      <div className='text-sm font-medium'>{value}</div>
    </div>
  );
}

function StatRow({
  icon,
  label,
  value
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className='flex items-center justify-between'>
      <div className='flex items-center gap-2'>
        {icon}
        <span className='text-muted-foreground text-sm'>{label}</span>
      </div>
      <span className='text-sm font-semibold'>{value}</span>
    </div>
  );
}

function StageRow({
  number,
  label,
  status
}: {
  number: number;
  label: string;
  status: string;
}) {
  return (
    <div className='flex items-center gap-2.5 rounded-md px-1 py-1.5'>
      {statusIcon[status]}
      <span className='text-muted-foreground w-5 font-mono text-xs'>
        {number}.
      </span>
      <span
        className={cn(
          'flex-1 text-sm',
          status === 'NOT_STARTED' && 'text-muted-foreground'
        )}
      >
        {label}
      </span>
      <Badge
        variant='outline'
        className={cn(
          'text-[10px]',
          STAGE_STATUS_COLOR[status as keyof typeof STAGE_STATUS_COLOR]
        )}
      >
        {status.replace(/_/g, ' ')}
      </Badge>
    </div>
  );
}

function ResultsCard({
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
      <Card>
        <CardHeader>
          <CardTitle className='text-base'>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className='text-muted-foreground text-sm'>
            No {title.toLowerCase()} available.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2 text-base'>
          <GraduationCap className='h-4 w-4' />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='grid grid-cols-2 gap-3'>
          <InfoField label='School' value={result.school || 'N/A'} />
          <InfoField label='Reg No' value={result.reg_no || 'N/A'} />
          <InfoField label='Division' value={result.division || 'N/A'} />
          <InfoField
            label='Points'
            value={result.points != null ? result.points : 'N/A'}
          />
        </div>

        {result.transcript && (
          <a
            href={result.transcript}
            target='_blank'
            rel='noopener noreferrer'
            className='text-primary inline-flex items-center gap-1 text-sm hover:underline'
          >
            <FileText className='h-3.5 w-3.5' />
            View Transcript
          </a>
        )}

        {grades && grades.length > 0 && (
          <>
            <Separator />
            <div>
              <p className='mb-2 text-xs font-medium'>Subjects & Grades</p>
              <div className='grid grid-cols-2 gap-1.5'>
                {grades.map((g) => (
                  <div
                    key={g.id}
                    className='bg-muted/50 flex items-center justify-between rounded px-2.5 py-1.5 text-sm'
                  >
                    <span className='truncate'>{g.subject?.name}</span>
                    <Badge variant='outline' className='ml-2 shrink-0 text-xs'>
                      {g.grade?.grade}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
