'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter, useParams } from 'next/navigation';
import useClientApi from '@/lib/axios/clientSide';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Application } from '@/types/application';
import {
  FileText,
  CheckCircle,
  XCircle,
  Upload,
  Send,
  DollarSign,
  Eye,
  AlertCircle,
  Clock,
  Mail,
  Phone,
  Calendar,
  User
} from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery as useReactQuery } from '@tanstack/react-query';
import { Student as StudentDetailsBase } from '@/types/student-details';

// Extend StudentDetails to include passport and results for this page
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
    enabled: !!applicationId
  });

  // Fetch full student details for results/passport
  const { data: studentDetails, isLoading: isStudentLoading } =
    useReactQuery<StudentDetails>({
      queryKey: ['student-details', application?.student?.id],
      queryFn: async () => {
        if (!api || !application?.student?.id)
          throw new Error('API not initialized');
        const response = await api.get(
          `/admin/students/${application.student.id}/`
        );
        return response.data as StudentDetails;
      },
      enabled: !!application?.student?.id
    });

  if (isLoading) {
    return (
      <div className='container mx-auto py-6'>
        <div className='flex h-96 items-center justify-center'>
          <p>Loading application details...</p>
        </div>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className='container mx-auto py-6'>
        <div className='flex h-96 items-center justify-center'>
          <p className='text-red-500'>Error loading application details</p>
        </div>
      </div>
    );
  }

  return (
    <div className='container mx-auto py-6'>
      <div className='space-y-6'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold'>Application Details</h1>
            <p className='text-muted-foreground'>
              Application ID: {application.app_id}
            </p>
          </div>
          <div className='flex gap-2'>
            <Button
              variant='outline'
              onClick={() =>
                router.push(`/admin/applications/${applicationId}/edit`)
              }
            >
              Edit
            </Button>
            <Button
              variant='default'
              onClick={() => router.push('/admin/applications')}
            >
              Back to List
            </Button>
          </div>
        </div>

        {/* Status Warning for Approval */}
        {application.status === 'PENDING' && (
          <Alert>
            <AlertCircle className='h-4 w-4' />
            <AlertTitle>Important Notice</AlertTitle>
            <AlertDescription>
              When updating this application to &quot;Approved&quot; status, the
              system will automatically create fees and schedule notifications
              based on the &quot;when&quot; field. Fees will be created by the
              system worker automatically including default admission expenses,
              university expenses, course expenses, and country expenses.
            </AlertDescription>
          </Alert>
        )}

        {/* Quick Stats */}
        <div className='grid grid-cols-1 gap-4 md:grid-cols-4'>
          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium'>Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge
                variant={
                  application.status === 'APPROVED'
                    ? 'default'
                    : application.status === 'REJECTED'
                      ? 'destructive'
                      : application.status === 'PENDING'
                        ? 'secondary'
                        : 'outline'
                }
              >
                {application.status}
              </Badge>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium'>
                Application Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              {application.progress ? (
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
              ) : (
                <Badge variant='outline'>No Progress</Badge>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium'>Sent Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant={application.is_sent ? 'default' : 'outline'}>
                {application.is_sent ? 'Sent' : 'Not Sent'}
              </Badge>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium'>Budget</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='font-semibold'>
                {application.budget
                  ? formatCurrency(application.budget)
                  : 'Not set'}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Information Tabs */}
        <Tabs defaultValue='overview' className='space-y-4'>
          <TabsList>
            <TabsTrigger value='overview'>Overview</TabsTrigger>
            <TabsTrigger value='student'>Student</TabsTrigger>
            <TabsTrigger value='courses'>Courses</TabsTrigger>
            <TabsTrigger value='fees'>Fees</TabsTrigger>
            <TabsTrigger value='documents'>Documents</TabsTrigger>
            <TabsTrigger value='credentials'>Credentials</TabsTrigger>
            <TabsTrigger value='information'>Information</TabsTrigger>
          </TabsList>

          <TabsContent value='overview' className='space-y-4'>
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                  <div className='space-y-1'>
                    <p className='text-muted-foreground text-sm font-medium'>
                      Student
                    </p>
                    <p className='font-medium'>{application.student.name}</p>
                  </div>
                  <div className='space-y-1'>
                    <p className='text-muted-foreground text-sm font-medium'>
                      University
                    </p>
                    <p className='font-medium'>{application.university.name}</p>
                  </div>
                  <div className='space-y-1'>
                    <p className='text-muted-foreground text-sm font-medium'>
                      Status
                    </p>
                    <Badge
                      variant={
                        application.status === 'APPROVED'
                          ? 'default'
                          : application.status === 'REJECTED'
                            ? 'destructive'
                            : application.status === 'PENDING'
                              ? 'secondary'
                              : 'outline'
                      }
                    >
                      {application.status}
                    </Badge>
                  </div>
                  <div className='space-y-1'>
                    <p className='text-muted-foreground text-sm font-medium'>
                      Applied Date
                    </p>
                    <p className='font-medium'>
                      {formatDate(application.created_at)}
                    </p>
                  </div>
                  <div className='space-y-1'>
                    <p className='text-muted-foreground text-sm font-medium'>
                      Scheduled Send Time
                    </p>
                    <p className='font-medium'>
                      {application.when
                        ? formatDate(application.when)
                        : 'Not scheduled'}
                    </p>
                  </div>
                  <div className='space-y-1'>
                    <p className='text-muted-foreground text-sm font-medium'>
                      Sent to University
                    </p>
                    <Badge
                      variant={application.is_sent ? 'default' : 'outline'}
                    >
                      {application.is_sent ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                </div>
                {application.info && (
                  <div className='space-y-1'>
                    <p className='text-muted-foreground text-sm font-medium'>
                      Notes
                    </p>
                    <p className='text-sm'>{application.info}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Latest Progress */}
            {application.progress && (
              <Card>
                <CardHeader>
                  <CardTitle>Latest Progress</CardTitle>
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
                    <span className='text-muted-foreground text-sm'>
                      {formatDate(application.progress.created_at)}
                    </span>
                  </div>
                  {application.progress.status === 'SUCCESS' && (
                    <p className='mt-2 text-sm text-green-600'>
                      Application has been accepted by the university
                    </p>
                  )}
                  {application.progress.status === 'REJECTED' && (
                    <p className='mt-2 text-sm text-red-600'>
                      Application has been rejected by the university
                    </p>
                  )}
                  {application.progress.status === 'PENDING' && (
                    <p className='mt-2 text-sm text-yellow-600'>
                      Application is still being processed
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value='student' className='space-y-4'>
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                {isStudentLoading ? (
                  <div className='text-muted-foreground mt-4 text-sm'>
                    Loading student details...
                  </div>
                ) : studentDetails ? (
                  <>
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                      <div className='space-y-1'>
                        <p className='text-muted-foreground text-sm font-medium'>
                          Full Name
                        </p>
                        <p className='font-medium'>
                          {studentDetails.user_name}
                        </p>
                      </div>
                      <div className='space-y-1'>
                        <p className='text-muted-foreground text-sm font-medium'>
                          Email
                        </p>
                        <p className='font-medium'>
                          {studentDetails.user_email}
                        </p>
                      </div>
                      <div className='space-y-1'>
                        <p className='text-muted-foreground text-sm font-medium'>
                          Education Level
                        </p>
                        <p className='font-medium'>
                          {studentDetails.education_level || 'Not Set'}
                        </p>
                      </div>
                      <div className='space-y-1'>
                        <p className='text-muted-foreground text-sm font-medium'>
                          Marital Status
                        </p>
                        <p className='font-medium'>
                          {studentDetails.maritial_status || 'Not Set'}
                        </p>
                      </div>
                      <div className='space-y-1'>
                        <p className='text-muted-foreground text-sm font-medium'>
                          Joined Date
                        </p>
                        <p className='font-medium'>
                          {studentDetails.created_at
                            ? formatDate(studentDetails.created_at)
                            : 'N/A'}
                        </p>
                      </div>
                      <div className='space-y-1'>
                        <p className='text-muted-foreground text-sm font-medium'>
                          Last Login
                        </p>
                        <p className='font-medium'>
                          {studentDetails.user?.last_login
                            ? formatDate(studentDetails.user.last_login)
                            : 'Never'}
                        </p>
                      </div>
                    </div>
                    {studentDetails.about_us && (
                      <div className='space-y-1'>
                        <p className='text-muted-foreground text-sm font-medium'>
                          About
                        </p>
                        <p className='font-medium'>{studentDetails.about_us}</p>
                      </div>
                    )}
                    {/* Passport section */}
                    {studentDetails.passport && (
                      <div className='space-y-1'>
                        <p className='text-muted-foreground text-sm font-medium'>
                          Passport
                        </p>
                        <div>
                          <a
                            href={studentDetails.passport}
                            target='_blank'
                            rel='noopener noreferrer'
                          >
                            <img
                              src={studentDetails.passport}
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
                    {studentDetails.results && (
                      <div className='mt-6 space-y-4'>
                        <h2 className='text-lg font-semibold'>
                          Student Results
                        </h2>
                        {/* O-Level Results */}
                        <div className='space-y-2'>
                          <h3 className='font-semibold'>O-Level Results</h3>
                          {studentDetails.results.o_level_result ? (
                            <>
                              <div>
                                <span className='font-medium'>School:</span>{' '}
                                {studentDetails.results.o_level_result.school ||
                                  'N/A'}
                              </div>
                              <div>
                                <span className='font-medium'>
                                  Registration No:
                                </span>{' '}
                                {studentDetails.results.o_level_result.reg_no ||
                                  'N/A'}
                              </div>
                              <div>
                                <span className='font-medium'>Division:</span>{' '}
                                {studentDetails.results.o_level_result
                                  .division || 'N/A'}
                              </div>
                              <div>
                                <span className='font-medium'>Points:</span>{' '}
                                {studentDetails.results.o_level_result.points ??
                                  'N/A'}
                              </div>
                              {studentDetails.results.o_level_result
                                .transcript && (
                                <div>
                                  <span className='font-medium'>
                                    Transcript:
                                  </span>{' '}
                                  <a
                                    href={
                                      studentDetails.results.o_level_result
                                        .transcript
                                    }
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
                                  {studentDetails.results.o_level_grades?.map(
                                    (grade) => (
                                      <li key={grade.id}>
                                        {grade.subject?.name}:{' '}
                                        {grade.grade?.grade}
                                      </li>
                                    )
                                  )}
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
                          {studentDetails.results.a_level_result ? (
                            <>
                              <div>
                                <span className='font-medium'>School:</span>{' '}
                                {studentDetails.results.a_level_result.school ||
                                  'N/A'}
                              </div>
                              <div>
                                <span className='font-medium'>
                                  Registration No:
                                </span>{' '}
                                {studentDetails.results.a_level_result.reg_no ||
                                  'N/A'}
                              </div>
                              <div>
                                <span className='font-medium'>Division:</span>{' '}
                                {studentDetails.results.a_level_result
                                  .division || 'N/A'}
                              </div>
                              <div>
                                <span className='font-medium'>Points:</span>{' '}
                                {studentDetails.results.a_level_result.points ??
                                  'N/A'}
                              </div>
                              {studentDetails.results.a_level_result
                                .transcript && (
                                <div>
                                  <span className='font-medium'>
                                    Transcript:
                                  </span>{' '}
                                  <a
                                    href={
                                      studentDetails.results.a_level_result
                                        .transcript
                                    }
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
                                  {studentDetails.results.a_level_grades?.map(
                                    (grade) => (
                                      <li key={grade.id}>
                                        {grade.subject?.name}:{' '}
                                        {grade.grade?.grade}
                                      </li>
                                    )
                                  )}
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
                  </>
                ) : null}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='courses' className='space-y-4'>
            <Card>
              <CardHeader>
                <CardTitle>Course Choices</CardTitle>
              </CardHeader>
              <CardContent>
                {application.courses && application.courses.length > 0 ? (
                  <div className='space-y-4'>
                    {application.courses.map((course, index) => (
                      <div
                        key={course.id || index}
                        className='rounded-lg border p-4'
                      >
                        <div className='mb-2 flex items-center justify-between'>
                          <Badge variant='outline'>
                            {index === 0
                              ? 'First Choice'
                              : index === 1
                                ? 'Second Choice'
                                : `Choice ${index + 1}`}
                          </Badge>
                        </div>
                        <p className='font-medium'>{course.name}</p>
                        <p className='text-muted-foreground text-sm'>
                          {application.university.name}
                        </p>
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
          </TabsContent>

          <TabsContent value='fees' className='space-y-4'>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between'>
                <CardTitle>Application Fees</CardTitle>
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
                  <div className='space-y-4'>
                    {application.fees.map((fee) => (
                      <div key={fee.id} className='rounded-lg border p-4'>
                        <div className='mb-2 flex justify-between'>
                          <Badge
                            variant={
                              fee.status === 'success' ? 'default' : 'secondary'
                            }
                          >
                            {fee.status}
                          </Badge>
                        </div>
                        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                          <div className='space-y-1'>
                            <p className='text-muted-foreground text-sm font-medium'>
                              Fee Name
                            </p>
                            <p className='font-medium'>{fee.name}</p>
                          </div>
                          <div className='space-y-1'>
                            <p className='text-muted-foreground text-sm font-medium'>
                              Amount
                            </p>
                            <p className='font-medium'>
                              {formatCurrency(fee.amount)}
                            </p>
                          </div>
                          <div className='space-y-1'>
                            <p className='text-muted-foreground text-sm font-medium'>
                              Created Date
                            </p>
                            <p className='font-medium'>
                              {formatDate(fee.created_at)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className='text-muted-foreground text-sm'>
                    {application.status === 'APPROVED'
                      ? 'Other fees will be created automatically by the system'
                      : 'When the application is approved, Fees will be created automatically by the system'}
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='documents' className='space-y-4'>
            {application.admission_letter && (
              <Card>
                <CardHeader>
                  <CardTitle>Admission Letter</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center space-x-2'>
                      <FileText className='h-4 w-4' />
                      <a
                        href={application.admission_letter.url}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='text-blue-500 hover:underline'
                      >
                        View Admission Letter
                      </a>
                    </div>
                    <span className='text-muted-foreground text-sm'>
                      {formatDate(application.admission_letter.created_at)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Additional Documents</CardTitle>
              </CardHeader>
              <CardContent>
                {application.documents && application.documents.length > 0 ? (
                  <div className='space-y-2'>
                    {application.documents.map((doc) => (
                      <div
                        key={doc.id}
                        className='flex items-center justify-between'
                      >
                        <div className='flex items-center space-x-2'>
                          <FileText className='h-4 w-4' />
                          <a
                            href={doc.url}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='text-blue-500 hover:underline'
                          >
                            View Document
                          </a>
                        </div>
                        <span className='text-muted-foreground text-sm'>
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

          <TabsContent value='credentials' className='space-y-4'>
            <Card>
              <CardHeader>
                <CardTitle>Application Portal Credentials</CardTitle>
              </CardHeader>
              <CardContent>
                {application.credentials_data ? (
                  <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                    <div className='space-y-1'>
                      <p className='text-muted-foreground text-sm font-medium'>
                        Username
                      </p>
                      <p className='font-medium'>
                        {application.credentials_data.username}
                      </p>
                    </div>
                    <div className='space-y-1'>
                      <p className='text-muted-foreground text-sm font-medium'>
                        Password
                      </p>
                      <p className='font-medium'>
                        {application.credentials_data.password}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className='text-muted-foreground text-sm'>
                    No credentials set
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='information' className='space-y-4'>
            <Card>
              <CardHeader>
                <CardTitle>Application Information History</CardTitle>
              </CardHeader>
              <CardContent>
                {application.information &&
                application.information.length > 0 ? (
                  <div className='space-y-4'>
                    {application.information
                      .sort(
                        (a, b) =>
                          new Date(b.created_at).getTime() -
                          new Date(a.created_at).getTime()
                      )
                      .map((info) => (
                        <div key={info.id} className='rounded-lg border p-4'>
                          <div className='mb-2 flex items-center justify-between'>
                            <span className='text-muted-foreground text-sm'>
                              {formatDate(info.created_at)}
                            </span>
                          </div>
                          <p className='text-sm'>{info.info}</p>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className='text-muted-foreground text-sm'>
                    No additional information
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
