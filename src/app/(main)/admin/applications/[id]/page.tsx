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
                <CardTitle>Student Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  <div className='flex items-center gap-2'>
                    <User className='text-muted-foreground h-5 w-5' />
                    <div>
                      <p className='text-sm font-medium'>Name</p>
                      <p>{application.student.name}</p>
                    </div>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Mail className='text-muted-foreground h-5 w-5' />
                    <div>
                      <p className='text-sm font-medium'>Email</p>
                      <p>{application.student.email}</p>
                    </div>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Phone className='text-muted-foreground h-5 w-5' />
                    <div>
                      <p className='text-sm font-medium'>Phone</p>
                      <p>{application.student.phone || 'Not provided'}</p>
                    </div>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Calendar className='text-muted-foreground h-5 w-5' />
                    <div>
                      <p className='text-sm font-medium'>Student Since</p>
                      <p>{formatDate(application.student.created_at)}</p>
                    </div>
                  </div>
                </div>
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
