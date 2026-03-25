'use client';

import { useQuery } from '@tanstack/react-query';
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
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Application } from '@/types/application';
import { Student as StudentDetailsBase } from '@/types/student-details';
import { Progress } from '@/components/ui/progress';
import {
  ArrowLeft,
  FileText,
  CheckCircle,
  XCircle,
  DollarSign,
  AlertCircle,
  Clock,
  User,
  GraduationCap,
  Globe,
  Pencil,
  ExternalLink,
  BookOpen,
  Key,
  Send,
  CreditCard,
  MessageSquare,
  Activity,
  Kanban,
  FileUp,
  Calendar,
  Info,
  MapPin,
  Circle,
  SkipForward,
  AlertTriangle
} from 'lucide-react';
import { formatDate, formatCurrency, cn } from '@/lib/utils';
import { format, parseISO, formatDistanceToNow } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import AdminJourneyTab from './AdminJourneyTab';
import ParentInfoCard from '../../students/[id]/ParentInfoCard';
import DocumentVaultChecklist from './DocumentVaultChecklist';
import SendNotificationDialog from './SendNotificationDialog';
import {
  type StudentPipeline,
  type StageInstanceStatus,
  STAGE_INSTANCE_STATUS_COLOR,
  FLOW_TYPE_COLOR
} from '@/features/pipeline/types';

interface StudentDetails extends StudentDetailsBase {
  passport?: string;
  results?: {
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
  };
}

const STATUS_CONFIG: Record<
  string,
  {
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
    icon: React.ElementType;
  }
> = {
  PENDING: { variant: 'outline', icon: Clock },
  APPROVED: { variant: 'default', icon: CheckCircle },
  ADMITTED: { variant: 'default', icon: CheckCircle },
  SUBMITTED: { variant: 'default', icon: Send },
  FULL_PAID: { variant: 'default', icon: DollarSign },
  REJECTED: { variant: 'destructive', icon: XCircle },
  CANCELLED: { variant: 'secondary', icon: XCircle },
  REVOKED: { variant: 'secondary', icon: XCircle },
  EXPIRED: { variant: 'secondary', icon: Clock }
};

export default function ApplicationDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { api } = useClientApi();
  const applicationId = params.id;

  const {
    data: application,
    isLoading,
    error
  } = useQuery({
    queryKey: ['application', applicationId],
    queryFn: async () => {
      if (!api) throw new Error('API not initialized');
      const response = await api.get(`/admin/applications/${applicationId}/`);
      return response.data as Application;
    },
    enabled: !!applicationId && !!api
  });

  const { data: studentDetails } = useQuery<StudentDetails>({
    queryKey: ['student-details', application?.student?.id],
    queryFn: async () => {
      if (!api || !application?.student?.id)
        throw new Error('API not initialized');
      const response = await api.get(
        `/admin/students/${application.student.id}/`
      );
      return response.data as StudentDetails;
    },
    enabled: !!api && !!application?.student?.id
  });

  // Fetch pipeline for this application
  const { data: pipelineData } = useQuery<{ results: StudentPipeline[] }>({
    queryKey: ['application-pipeline', applicationId],
    queryFn: async () => {
      if (!api) throw new Error('API not initialized');
      const response = await api.get('/admin/pipelines/', {
        params: { application: applicationId, page_size: 1 }
      });
      return response.data;
    },
    enabled: !!api && !!applicationId
  });
  const pipeline = pipelineData?.results?.[0];

  if (isLoading) {
    return (
      <PageContainer className='w-full'>
        <div className='space-y-6'>
          <div className='flex items-center gap-4'>
            <Skeleton className='h-8 w-8' />
            <Skeleton className='h-8 w-[200px]' />
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

  if (error || !application) {
    return (
      <PageContainer className='w-full'>
        <div className='flex h-96 flex-col items-center justify-center gap-4'>
          <p className='text-destructive text-lg'>
            Error loading application details
          </p>
          <Button
            variant='outline'
            onClick={() => router.push('/admin/applications')}
          >
            Back to Applications
          </Button>
        </div>
      </PageContainer>
    );
  }

  const statusConfig = STATUS_CONFIG[application.status] ?? {
    variant: 'outline' as const,
    icon: Clock
  };
  const StatusIcon = statusConfig.icon;

  const totalFees =
    application.fees?.reduce((sum, fee) => sum + (fee.amount || 0), 0) ?? 0;
  const paidFees =
    application.fees
      ?.filter((f) => f.status === 'success')
      .reduce((sum, fee) => sum + (fee.amount || 0), 0) ?? 0;

  return (
    <PageContainer className='w-full'>
      <div className='w-full space-y-6'>
        {/* Header */}
        <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <div className='flex items-center gap-3'>
            <Button
              variant='ghost'
              size='icon'
              onClick={() => router.push('/admin/applications')}
              className='shrink-0'
            >
              <ArrowLeft className='h-4 w-4' />
            </Button>
            <div className='min-w-0'>
              <div className='flex items-center gap-2'>
                <h1 className='truncate text-2xl font-bold'>
                  {application.student?.name || 'Application'}
                </h1>
                <Badge
                  variant={statusConfig.variant}
                  className='shrink-0 gap-1'
                >
                  <StatusIcon className='h-3 w-3' />
                  {application.status}
                </Badge>
              </div>
              <div className='text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1 text-sm'>
                <span className='font-mono text-xs'>{application.app_id}</span>
                <span>&middot;</span>
                <span className='flex items-center gap-1'>
                  <Globe className='h-3 w-3' />
                  {application.university?.name}
                </span>
              </div>
            </div>
          </div>
          <div className='flex flex-wrap gap-2 sm:shrink-0'>
            {application.student?.id && (
              <Link href={`/admin/students/${application.student.id}`}>
                <Button variant='outline' size='sm'>
                  <User className='mr-1.5 h-4 w-4' />
                  Student Profile
                </Button>
              </Link>
            )}
            {application.student?.id && (
              <SendNotificationDialog
                studentId={application.student.id}
                studentName={application.student.name || 'Student'}
                applicationId={application.id}
              />
            )}
            <Button
              variant='outline'
              size='sm'
              onClick={() =>
                router.push(`/admin/applications/${applicationId}/edit`)
              }
            >
              <Pencil className='mr-1.5 h-4 w-4' />
              Edit
            </Button>
          </div>
        </div>

        {/* Approval warning */}
        {application.status === 'PENDING' && (
          <Alert>
            <AlertCircle className='h-4 w-4' />
            <AlertTitle>Pending Application</AlertTitle>
            <AlertDescription>
              When updated to &quot;Approved&quot;, the system will
              automatically create fees and schedule notifications based on the
              scheduled send time.
            </AlertDescription>
          </Alert>
        )}

        {/* KPI Cards — bird's-eye view */}
        <div className='grid grid-cols-2 gap-3 lg:grid-cols-5'>
          <Card>
            <CardContent className='pt-4'>
              <p className='text-muted-foreground text-xs font-medium'>
                Status
              </p>
              <Badge variant={statusConfig.variant} className='mt-1.5 gap-1'>
                <StatusIcon className='h-3 w-3' />
                {application.status}
              </Badge>
            </CardContent>
          </Card>
          <Card>
            <CardContent className='pt-4'>
              <p className='text-muted-foreground text-xs font-medium'>
                Progress
              </p>
              {application.progress ? (
                <Badge
                  variant={
                    application.progress.status === 'SUCCESS'
                      ? 'default'
                      : application.progress.status === 'REJECTED'
                        ? 'destructive'
                        : 'secondary'
                  }
                  className='mt-1.5'
                >
                  {application.progress.status}
                </Badge>
              ) : (
                <p className='text-muted-foreground mt-1.5 text-sm'>
                  No progress
                </p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardContent className='pt-4'>
              <p className='text-muted-foreground text-xs font-medium'>
                Sent to University
              </p>
              <Badge
                variant={application.is_sent ? 'default' : 'outline'}
                className='mt-1.5'
              >
                {application.is_sent ? 'Sent' : 'Not Sent'}
              </Badge>
            </CardContent>
          </Card>
          <Card>
            <CardContent className='pt-4'>
              <p className='text-muted-foreground text-xs font-medium'>
                Total Fees
              </p>
              <p className='mt-1 text-lg font-bold tabular-nums'>
                {formatCurrency(totalFees)}
              </p>
              <p className='text-muted-foreground text-[10px]'>
                {formatCurrency(paidFees)} paid
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className='pt-4'>
              <p className='text-muted-foreground text-xs font-medium'>
                Courses
              </p>
              <p className='mt-1 text-lg font-bold'>
                {application.courses?.length || 0}
              </p>
              <p className='text-muted-foreground truncate text-[10px]'>
                {application.courses?.[0]?.name || 'None selected'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue='overview' className='space-y-4'>
          <TabsList className='flex-wrap'>
            <TabsTrigger value='overview'>Overview</TabsTrigger>
            <TabsTrigger value='student'>Student</TabsTrigger>
            <TabsTrigger value='fees'>
              Fees
              {application.fees?.length ? (
                <Badge variant='secondary' className='ml-1.5 text-[10px]'>
                  {application.fees.length}
                </Badge>
              ) : null}
            </TabsTrigger>
            <TabsTrigger value='documents'>
              Documents
              {application.documents?.length ? (
                <Badge variant='secondary' className='ml-1.5 text-[10px]'>
                  {application.documents.length}
                </Badge>
              ) : null}
            </TabsTrigger>
            <TabsTrigger value='pipeline'>
              Pipeline
              {pipeline && (
                <Badge variant='secondary' className='ml-1.5 text-[10px]'>
                  {pipeline.completed_stages ?? 0}/{pipeline.total_stages ?? 0}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value='credentials'>Credentials</TabsTrigger>
            <TabsTrigger value='journey'>Journey</TabsTrigger>
          </TabsList>

          {/* ==================== OVERVIEW TAB ==================== */}
          <TabsContent value='overview' className='space-y-4'>
            <div className='grid gap-4 lg:grid-cols-3'>
              {/* Application Details */}
              <Card className='lg:col-span-2'>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2 text-base'>
                    <FileText className='h-4 w-4' /> Application Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2'>
                    <InfoField
                      label='Student'
                      value={application.student?.name || 'N/A'}
                    />
                    <InfoField
                      label='University'
                      value={application.university?.name || 'N/A'}
                    />
                    <InfoField
                      label='Application ID'
                      value={
                        <span className='font-mono text-xs'>
                          {application.app_id}
                        </span>
                      }
                    />
                    <InfoField
                      label='Applied Date'
                      value={formatDate(application.created_at)}
                    />
                    <InfoField
                      label='Scheduled Send'
                      value={
                        application.when
                          ? formatDate(application.when)
                          : 'Not scheduled'
                      }
                    />
                    <InfoField
                      label='Budget'
                      value={
                        application.budget
                          ? formatCurrency(application.budget)
                          : 'Not set'
                      }
                    />
                  </div>
                  {application.info && (
                    <>
                      <Separator className='my-4' />
                      <InfoField label='Notes' value={application.info} />
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Course Choices + Progress */}
              <div className='space-y-4'>
                <Card>
                  <CardHeader className='pb-3'>
                    <CardTitle className='flex items-center gap-2 text-base'>
                      <BookOpen className='h-4 w-4' /> Course Choices
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {application.courses && application.courses.length > 0 ? (
                      <div className='space-y-2'>
                        {application.courses.map((course, index) => (
                          <div
                            key={course.id || index}
                            className='bg-muted/50 flex items-center gap-2 rounded-lg px-3 py-2'
                          >
                            <Badge
                              variant='outline'
                              className='shrink-0 text-[10px]'
                            >
                              {index + 1}
                            </Badge>
                            <span className='truncate text-sm'>
                              {course.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className='text-muted-foreground text-sm'>
                        No courses selected
                      </p>
                    )}
                  </CardContent>
                </Card>

                {application.progress && (
                  <Card>
                    <CardHeader className='pb-3'>
                      <CardTitle className='flex items-center gap-2 text-base'>
                        <Activity className='h-4 w-4' /> Latest Progress
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className='flex items-center justify-between'>
                        <Badge
                          variant={
                            application.progress.status === 'SUCCESS'
                              ? 'default'
                              : application.progress.status === 'REJECTED'
                                ? 'destructive'
                                : 'secondary'
                          }
                        >
                          {application.progress.status}
                        </Badge>
                        <span className='text-muted-foreground text-xs'>
                          {formatDate(application.progress.created_at)}
                        </span>
                      </div>
                      <p
                        className={cn(
                          'mt-2 text-sm',
                          application.progress.status === 'SUCCESS' &&
                            'text-green-600',
                          application.progress.status === 'REJECTED' &&
                            'text-red-600',
                          application.progress.status === 'PENDING' &&
                            'text-amber-600'
                        )}
                      >
                        {application.progress.status === 'SUCCESS'
                          ? 'Accepted by university'
                          : application.progress.status === 'REJECTED'
                            ? 'Rejected by university'
                            : 'Being processed'}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {application.admission_letter && (
                  <Card>
                    <CardHeader className='pb-3'>
                      <CardTitle className='flex items-center gap-2 text-base'>
                        <FileText className='h-4 w-4' /> Admission Letter
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <a
                        href={application.admission_letter.url}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='text-primary inline-flex items-center gap-1.5 text-sm hover:underline'
                      >
                        <ExternalLink className='h-3.5 w-3.5' />
                        View Admission Letter
                      </a>
                      <p className='text-muted-foreground mt-1 text-xs'>
                        Uploaded{' '}
                        {formatDate(application.admission_letter.created_at)}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {application.student?.id && (
                  <DocumentVaultChecklist studentId={application.student.id} />
                )}
              </div>
            </div>

            {/* Information History */}
            {application.information && application.information.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2 text-base'>
                    <MessageSquare className='h-4 w-4' /> Information History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='space-y-3'>
                    {[...application.information]
                      .sort(
                        (a, b) =>
                          new Date(b.created_at).getTime() -
                          new Date(a.created_at).getTime()
                      )
                      .map((info) => (
                        <div
                          key={info.id}
                          className='bg-muted/30 rounded-lg border p-3'
                        >
                          <p className='text-sm'>{info.info}</p>
                          <p className='text-muted-foreground mt-1 text-xs'>
                            {formatDate(info.created_at)}
                          </p>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* ==================== STUDENT TAB ==================== */}
          <TabsContent value='student' className='space-y-4'>
            {studentDetails ? (
              <div className='grid gap-4 lg:grid-cols-3'>
                <Card className='lg:col-span-2'>
                  <CardHeader>
                    <div className='flex items-center justify-between'>
                      <CardTitle className='flex items-center gap-2 text-base'>
                        <User className='h-4 w-4' /> Personal Information
                      </CardTitle>
                      <Link href={`/admin/students/${application.student?.id}`}>
                        <Button variant='outline' size='sm'>
                          Full Profile
                          <ExternalLink className='ml-1 h-3 w-3' />
                        </Button>
                      </Link>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className='grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2'>
                      <InfoField
                        label='Full Name'
                        value={studentDetails.user_name}
                      />
                      <InfoField
                        label='Email'
                        value={studentDetails.user_email}
                      />
                      <InfoField
                        label='Phone'
                        value={
                          studentDetails.user?.phone_number || 'Not provided'
                        }
                      />
                      <InfoField
                        label='Education Level'
                        value={
                          studentDetails.education_level
                            ? studentDetails.education_level
                                .replace(/_/g, ' ')
                                .replace(/\b\w/g, (l) => l.toUpperCase())
                            : 'Not Set'
                        }
                      />
                      <InfoField
                        label='Joined Date'
                        value={
                          studentDetails.created_at
                            ? formatDate(studentDetails.created_at)
                            : 'N/A'
                        }
                      />
                      <InfoField
                        label='Last Login'
                        value={
                          studentDetails.user?.last_login
                            ? formatDistanceToNow(
                                parseISO(studentDetails.user.last_login),
                                { addSuffix: true }
                              )
                            : 'Never'
                        }
                      />
                    </div>
                    {studentDetails.passport && (
                      <>
                        <Separator className='my-4' />
                        <div>
                          <p className='text-muted-foreground mb-1 text-xs font-medium'>
                            Passport
                          </p>
                          <a
                            href={studentDetails.passport}
                            target='_blank'
                            rel='noopener noreferrer'
                          >
                            <img
                              src={studentDetails.passport}
                              alt='Passport'
                              className='max-w-[160px] rounded-lg border transition-opacity hover:opacity-80'
                            />
                          </a>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>

                {/* Academic Results Summary */}
                <div className='space-y-4'>
                  {studentDetails.results?.o_level_result && (
                    <Card>
                      <CardHeader className='pb-3'>
                        <CardTitle className='flex items-center gap-2 text-base'>
                          <GraduationCap className='h-4 w-4' /> O-Level
                        </CardTitle>
                      </CardHeader>
                      <CardContent className='space-y-2'>
                        <div className='grid grid-cols-2 gap-2'>
                          <InfoField
                            label='Division'
                            value={
                              studentDetails.results.o_level_result.division ||
                              'N/A'
                            }
                          />
                          <InfoField
                            label='Points'
                            value={
                              studentDetails.results.o_level_result.points !=
                              null
                                ? studentDetails.results.o_level_result.points
                                : 'N/A'
                            }
                          />
                        </div>
                        {studentDetails.results.o_level_grades &&
                          studentDetails.results.o_level_grades.length > 0 && (
                            <div className='space-y-1'>
                              {studentDetails.results.o_level_grades.map(
                                (g) => (
                                  <div
                                    key={g.id}
                                    className='bg-muted/50 flex items-center justify-between rounded px-2 py-1 text-xs'
                                  >
                                    <span className='truncate'>
                                      {g.subject?.name}
                                    </span>
                                    <Badge
                                      variant='outline'
                                      className='text-[10px]'
                                    >
                                      {g.grade?.grade}
                                    </Badge>
                                  </div>
                                )
                              )}
                            </div>
                          )}
                      </CardContent>
                    </Card>
                  )}

                  {studentDetails.results?.a_level_result && (
                    <Card>
                      <CardHeader className='pb-3'>
                        <CardTitle className='flex items-center gap-2 text-base'>
                          <GraduationCap className='h-4 w-4' /> A-Level
                        </CardTitle>
                      </CardHeader>
                      <CardContent className='space-y-2'>
                        <div className='grid grid-cols-2 gap-2'>
                          <InfoField
                            label='Division'
                            value={
                              studentDetails.results.a_level_result.division ||
                              'N/A'
                            }
                          />
                          <InfoField
                            label='Points'
                            value={
                              studentDetails.results.a_level_result.points !=
                              null
                                ? studentDetails.results.a_level_result.points
                                : 'N/A'
                            }
                          />
                        </div>
                        {studentDetails.results.a_level_grades &&
                          studentDetails.results.a_level_grades.length > 0 && (
                            <div className='space-y-1'>
                              {studentDetails.results.a_level_grades.map(
                                (g) => (
                                  <div
                                    key={g.id}
                                    className='bg-muted/50 flex items-center justify-between rounded px-2 py-1 text-xs'
                                  >
                                    <span className='truncate'>
                                      {g.subject?.name}
                                    </span>
                                    <Badge
                                      variant='outline'
                                      className='text-[10px]'
                                    >
                                      {g.grade?.grade}
                                    </Badge>
                                  </div>
                                )
                              )}
                            </div>
                          )}
                      </CardContent>
                    </Card>
                  )}

                  {application.student?.id && (
                    <ParentInfoCard studentId={application.student.id} />
                  )}
                </div>
              </div>
            ) : (
              <Card>
                <CardContent className='py-8 text-center'>
                  <p className='text-muted-foreground text-sm'>
                    Loading student details...
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* ==================== FEES TAB ==================== */}
          <TabsContent value='fees' className='space-y-4'>
            {/* Fee summary */}
            <div className='grid grid-cols-2 gap-3 lg:grid-cols-3'>
              <Card>
                <CardContent className='pt-4'>
                  <p className='text-muted-foreground text-xs font-medium'>
                    Total Fees
                  </p>
                  <p className='text-xl font-bold tabular-nums'>
                    {formatCurrency(totalFees)}
                  </p>
                  <p className='text-muted-foreground text-[10px]'>
                    {application.fees?.length || 0} items
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className='pt-4'>
                  <p className='text-muted-foreground text-xs font-medium'>
                    Paid
                  </p>
                  <p className='text-xl font-bold text-green-600 tabular-nums'>
                    {formatCurrency(paidFees)}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className='pt-4'>
                  <p className='text-muted-foreground text-xs font-medium'>
                    Outstanding
                  </p>
                  <p
                    className={cn(
                      'text-xl font-bold tabular-nums',
                      totalFees - paidFees > 0 && 'text-amber-600'
                    )}
                  >
                    {formatCurrency(totalFees - paidFees)}
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className='flex flex-row items-center justify-between'>
                <CardTitle className='text-base'>Fee Breakdown</CardTitle>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() =>
                    router.push(
                      `/admin/applications/${applicationId}/edit?tab=expenses`
                    )
                  }
                >
                  Manage Expenses
                </Button>
              </CardHeader>
              <CardContent>
                {application.fees && application.fees.length > 0 ? (
                  <div className='space-y-2'>
                    {application.fees.map((fee) => (
                      <div
                        key={fee.id}
                        className='flex items-center justify-between rounded-lg border p-3'
                      >
                        <div className='flex items-center gap-3'>
                          <div className='bg-muted rounded-lg p-2'>
                            <CreditCard className='text-muted-foreground h-4 w-4' />
                          </div>
                          <div>
                            <p className='text-sm font-medium'>{fee.name}</p>
                            <p className='text-muted-foreground text-xs'>
                              {formatDate(fee.created_at)}
                            </p>
                          </div>
                        </div>
                        <div className='text-right'>
                          <p className='text-sm font-semibold tabular-nums'>
                            {formatCurrency(fee.amount)}
                          </p>
                          <Badge
                            variant={
                              fee.status === 'success'
                                ? 'default'
                                : fee.status === 'failed'
                                  ? 'destructive'
                                  : 'secondary'
                            }
                            className='text-[10px]'
                          >
                            {fee.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className='text-muted-foreground text-sm'>
                    {application.status === 'APPROVED'
                      ? 'Fees will be created automatically by the system'
                      : 'Fees are created when the application is approved'}
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ==================== DOCUMENTS TAB ==================== */}
          <TabsContent value='documents' className='space-y-4'>
            {application.admission_letter && (
              <Card>
                <CardHeader>
                  <CardTitle className='text-base'>Admission Letter</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='flex items-center justify-between'>
                    <a
                      href={application.admission_letter.url}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='text-primary inline-flex items-center gap-1.5 text-sm hover:underline'
                    >
                      <FileText className='h-4 w-4' />
                      View Admission Letter
                    </a>
                    <span className='text-muted-foreground text-xs'>
                      {formatDate(application.admission_letter.created_at)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className='text-base'>
                  Additional Documents
                </CardTitle>
              </CardHeader>
              <CardContent>
                {application.documents && application.documents.length > 0 ? (
                  <div className='space-y-2'>
                    {application.documents.map((doc) => (
                      <div
                        key={doc.id}
                        className='flex items-center justify-between rounded-lg border p-3'
                      >
                        <a
                          href={doc.url}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='text-primary inline-flex items-center gap-1.5 text-sm hover:underline'
                        >
                          <FileText className='h-4 w-4' />
                          View Document
                        </a>
                        <span className='text-muted-foreground text-xs'>
                          {formatDate(doc.created_at)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className='text-muted-foreground text-sm'>
                    No additional documents uploaded
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ==================== PIPELINE TAB ==================== */}
          <TabsContent value='pipeline' className='space-y-4'>
            {pipeline ? (
              <div className='space-y-4'>
                {/* Pipeline header */}
                <Card>
                  <CardHeader className='flex flex-row items-center justify-between'>
                    <div className='flex items-center gap-3'>
                      <CardTitle className='flex items-center gap-2 text-base'>
                        <Kanban className='h-4 w-4' /> Pipeline Progress
                      </CardTitle>
                      {pipeline.flow_type && (
                        <Badge
                          className={cn(
                            'text-xs',
                            FLOW_TYPE_COLOR[pipeline.flow_type]
                          )}
                        >
                          {pipeline.flow_type === 'LOCAL' ? 'Local' : 'Abroad'}
                        </Badge>
                      )}
                    </div>
                    <Link href={`/admin/pipeline/${pipeline.id}`}>
                      <Button variant='outline' size='sm'>
                        Open Pipeline
                        <ExternalLink className='ml-1 h-3 w-3' />
                      </Button>
                    </Link>
                  </CardHeader>
                  <CardContent>
                    <div className='mb-4 flex items-center gap-4'>
                      <Progress
                        value={
                          (pipeline.total_stages ?? 0) > 0
                            ? Math.round(
                                ((pipeline.completed_stages ?? 0) /
                                  (pipeline.total_stages ?? 1)) *
                                  100
                              )
                            : 0
                        }
                        className='h-3 flex-1'
                      />
                      <span className='text-sm font-medium tabular-nums'>
                        {pipeline.completed_stages ?? 0}/
                        {pipeline.total_stages ?? 0} stages
                      </span>
                    </div>
                    {/* Stage list */}
                    {pipeline.stage_instances &&
                    pipeline.stage_instances.length > 0 ? (
                      <div className='space-y-1.5'>
                        {[...pipeline.stage_instances]
                          .sort((a, b) => a.stage_order - b.stage_order)
                          .map((stage) => {
                            const status = (stage.status ??
                              'PENDING') as StageInstanceStatus;
                            const stageIcon: Record<string, React.ReactNode> = {
                              PENDING: (
                                <Circle className='text-muted-foreground h-3.5 w-3.5' />
                              ),
                              ACTIVE: (
                                <Clock className='h-3.5 w-3.5 text-blue-500' />
                              ),
                              COMPLETED: (
                                <CheckCircle className='h-3.5 w-3.5 text-green-500' />
                              ),
                              BLOCKED: (
                                <AlertTriangle className='h-3.5 w-3.5 text-red-500' />
                              ),
                              SKIPPED: (
                                <SkipForward className='h-3.5 w-3.5 text-yellow-500' />
                              )
                            };
                            const reqSummary =
                              stage.requirements_summary as unknown as {
                                total?: number;
                                approved?: number;
                                submitted?: number;
                              } | null;
                            return (
                              <div
                                key={stage.id}
                                className={cn(
                                  'flex items-center gap-3 rounded-md px-3 py-2',
                                  status === 'ACTIVE' &&
                                    'bg-blue-50 dark:bg-blue-950/20',
                                  status === 'BLOCKED' &&
                                    'bg-red-50 dark:bg-red-950/20'
                                )}
                              >
                                {stageIcon[status] ?? (
                                  <Circle className='text-muted-foreground h-3.5 w-3.5' />
                                )}
                                <span className='text-muted-foreground w-5 font-mono text-xs'>
                                  {stage.stage_order}.
                                </span>
                                <span
                                  className={cn(
                                    'flex-1 text-sm',
                                    status === 'COMPLETED' &&
                                      'text-muted-foreground line-through',
                                    status === 'ACTIVE' && 'font-medium'
                                  )}
                                >
                                  {stage.stage_name}
                                </span>
                                {reqSummary &&
                                  reqSummary.total &&
                                  reqSummary.total > 0 && (
                                    <span className='text-muted-foreground text-xs'>
                                      {reqSummary.approved ?? 0}/
                                      {reqSummary.total}
                                      {(reqSummary.submitted ?? 0) > 0 && (
                                        <span className='ml-1 text-amber-600'>
                                          ({reqSummary.submitted} pending)
                                        </span>
                                      )}
                                    </span>
                                  )}
                                <Badge
                                  variant='outline'
                                  className={cn(
                                    'text-[10px]',
                                    STAGE_INSTANCE_STATUS_COLOR[status]
                                  )}
                                >
                                  {status}
                                </Badge>
                              </div>
                            );
                          })}
                      </div>
                    ) : (
                      <p className='text-muted-foreground text-center text-sm'>
                        No stages loaded.{' '}
                        <Link
                          href={`/admin/pipeline/${pipeline.id}`}
                          className='text-primary hover:underline'
                        >
                          Open pipeline
                        </Link>{' '}
                        for full details.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className='flex flex-col items-center py-12'>
                  <Kanban className='text-muted-foreground mb-3 h-10 w-10' />
                  <p className='text-muted-foreground text-sm'>
                    No pipeline found for this application.
                  </p>
                  <p className='text-muted-foreground mt-1 text-xs'>
                    Pipelines are automatically created when applications are
                    submitted.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* ==================== CREDENTIALS TAB ==================== */}
          <TabsContent value='credentials' className='space-y-4'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2 text-base'>
                  <Key className='h-4 w-4' /> Application Portal Credentials
                </CardTitle>
              </CardHeader>
              <CardContent>
                {application.credentials_data ? (
                  <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                    <InfoField
                      label='Username'
                      value={
                        <span className='font-mono text-sm'>
                          {application.credentials_data.username}
                        </span>
                      }
                    />
                    <InfoField
                      label='Password'
                      value={
                        <span className='font-mono text-sm'>
                          {application.credentials_data.password}
                        </span>
                      }
                    />
                  </div>
                ) : (
                  <div className='flex flex-col items-center py-8'>
                    <Key className='text-muted-foreground mb-2 h-8 w-8' />
                    <p className='text-muted-foreground text-sm'>
                      No credentials set
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ==================== JOURNEY TAB ==================== */}
          <TabsContent value='journey' className='space-y-4'>
            <AdminJourneyTab applicationId={application.id} />
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
