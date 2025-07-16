'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import useClientApi from '@/lib/axios/clientSide';
import PageContainer from '@/components/layout/page-container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Briefcase,
  GraduationCap,
  CircleDollarSign,
  Activity,
  Heart,
  Bell,
  Share2
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';

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
    enabled: !!studentId
  });

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
                  : student.subscription.type}{' '}
                - {'subscription'}
              </Badge>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium'>
                Profile Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={student.profile_complete} className='mb-1' />
              <p className='text-muted-foreground text-sm'>
                {student.profile_complete}%
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
                Total Earnings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-lg font-semibold'>
                {formatCurrency(student?.earnings || 0)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Information Tabs */}
        <Tabs defaultValue='profile' className='space-y-4'>
          <TabsList>
            <TabsTrigger value='profile'>Profile</TabsTrigger>
            <TabsTrigger value='activity'>Activity</TabsTrigger>
            <TabsTrigger value='financial'>Financial</TabsTrigger>
            <TabsTrigger value='referrals'>Referrals</TabsTrigger>
          </TabsList>

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
                {/* Passport section */}
                {student.passport && (
                  <div className='space-y-1'>
                    <p className='text-muted-foreground text-sm font-medium'>
                      Passport
                    </p>
                    <div>
                      <a
                        href={student.passport}
                        target='_blank'
                        rel='noopener noreferrer'
                      >
                        <img
                          src={student.passport}
                          alt='Passport'
                          style={{
                            maxWidth: '180px',
                            borderRadius: '8px',
                            border: '1px solid #eee'
                          }}
                        />
                      </a>
                    </div>
                  </div>
                )}
                {/* Results section */}
                {student.results && (
                  <div className='mt-6 space-y-4'>
                    <h2 className='text-lg font-semibold'>Student Results</h2>
                    {/* O-Level Results */}
                    <div className='space-y-2'>
                      <h3 className='font-semibold'>O-Level Results</h3>
                      {student.results.o_level_result ? (
                        <>
                          <div>
                            <span className='font-medium'>School:</span>{' '}
                            {student.results.o_level_result.school || 'N/A'}
                          </div>
                          <div>
                            <span className='font-medium'>
                              Registration No:
                            </span>{' '}
                            {student.results.o_level_result.reg_no || 'N/A'}
                          </div>
                          <div>
                            <span className='font-medium'>Division:</span>{' '}
                            {student.results.o_level_result.division || 'N/A'}
                          </div>
                          <div>
                            <span className='font-medium'>Points:</span>{' '}
                            {student.results.o_level_result.points ?? 'N/A'}
                          </div>
                          {student.results.o_level_result.transcript && (
                            <div>
                              <span className='font-medium'>Transcript:</span>{' '}
                              <a
                                href={student.results.o_level_result.transcript}
                                target='_blank'
                                rel='noopener noreferrer'
                                className='text-blue-600 underline'
                              >
                                View O-Level Transcript
                              </a>
                            </div>
                          )}
                          <div>
                            <span className='font-medium'>
                              Subjects & Grades:
                            </span>
                            <ul className='ml-6 list-disc'>
                              {student.results.o_level_grades?.map((grade) => (
                                <li key={grade.id}>
                                  {grade.subject?.name}: {grade.grade?.grade}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </>
                      ) : (
                        <p className='text-muted-foreground text-sm'>
                          No O-Level results available.
                        </p>
                      )}
                    </div>
                    {/* A-Level Results */}
                    <div className='space-y-2'>
                      <h3 className='font-semibold'>A-Level Results</h3>
                      {student.results.a_level_result ? (
                        <>
                          <div>
                            <span className='font-medium'>School:</span>{' '}
                            {student.results.a_level_result.school || 'N/A'}
                          </div>
                          <div>
                            <span className='font-medium'>
                              Registration No:
                            </span>{' '}
                            {student.results.a_level_result.reg_no || 'N/A'}
                          </div>
                          <div>
                            <span className='font-medium'>Division:</span>{' '}
                            {student.results.a_level_result.division || 'N/A'}
                          </div>
                          <div>
                            <span className='font-medium'>Points:</span>{' '}
                            {student.results.a_level_result.points ?? 'N/A'}
                          </div>
                          {student.results.a_level_result.transcript && (
                            <div>
                              <span className='font-medium'>Transcript:</span>{' '}
                              <a
                                href={student.results.a_level_result.transcript}
                                target='_blank'
                                rel='noopener noreferrer'
                                className='text-blue-600 underline'
                              >
                                View A-Level Transcript
                              </a>
                            </div>
                          )}
                          <div>
                            <span className='font-medium'>
                              Subjects & Grades:
                            </span>
                            <ul className='ml-6 list-disc'>
                              {student.results.a_level_grades?.map((grade) => (
                                <li key={grade.id}>
                                  {grade.subject?.name}: {grade.grade?.grade}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </>
                      ) : (
                        <p className='text-muted-foreground text-sm'>
                          No A-Level results available.
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

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
