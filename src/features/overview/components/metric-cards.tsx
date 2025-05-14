'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  IconCreditCard,
  IconUsers,
  IconBuildingBank,
  IconWallet,
  IconSchool,
  IconBook,
  IconCertificate,
  IconCalendar,
  IconBuilding,
  IconBookmark,
  IconDeviceLaptop
} from '@tabler/icons-react';
import { formatCurrency } from '@/lib/utils';

interface MetricCardsProps {
  data: {
    total_revenue?: number;
    revenue_change?: number;
    pending_payments?: number;
    payment_change?: number;
    total_students?: number;
    student_change?: number;
    active_courses?: number;
    course_change?: number;
    enrolled_students?: number;
    enrollment_change?: number;
    total_lessons?: number;
    lesson_change?: number;
    certificates_issued?: number;
    certificate_change?: number;
    pending_certificates?: number;
    upcoming_events?: number;
    next_event_days?: number;
    system_status?: string;
    active_users?: number;
    total_universities?: number;
    university_change?: number;
    total_departments?: number;
    department_change?: number;
    total_programs?: number;
    program_change?: number;
    total_lecturers?: number;
    lecturer_change?: number;
    total_online_courses?: number;
    online_course_change?: number;
    total_offline_courses?: number;
    offline_course_change?: number;
    total_webinars?: number;
    webinar_change?: number;
    total_workshops?: number;
    workshop_change?: number;
  };
}

export function MetricCards({ data }: MetricCardsProps) {
  const formatChange = (value?: number) => {
    if (!value) return '0%';
    return `${value > 0 ? '+' : ''}${value}%`;
  };

  return (
    <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
      {/* Financial Metrics */}
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='flex items-center gap-2 text-sm font-medium'>
            <IconCreditCard className='h-4 w-4' />
            Total Revenue
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>
            {formatCurrency(data?.total_revenue || 0)}
          </div>
          <p className='text-muted-foreground text-xs'>
            {formatChange(data?.revenue_change)} from last month
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='flex items-center gap-2 text-sm font-medium'>
            <IconWallet className='h-4 w-4' />
            Pending Payments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>
            {formatCurrency(data?.pending_payments || 0)}
          </div>
          <p className='text-muted-foreground text-xs'>
            {formatChange(data?.payment_change)}{' '}
            {data?.pending_payments
              ? 'awaiting approval'
              : 'no pending payments'}
          </p>
        </CardContent>
      </Card>

      {/* Academic Institution Metrics */}
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='flex items-center gap-2 text-sm font-medium'>
            <IconBuilding className='h-4 w-4' />
            Total Universities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>
            {data?.total_universities || 0}
          </div>
          <p className='text-muted-foreground text-xs'>
            {formatChange(data?.university_change)} from last month
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='flex items-center gap-2 text-sm font-medium'>
            <IconBookmark className='h-4 w-4' />
            Total Departments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>
            {data?.total_departments || 0}
          </div>
          <p className='text-muted-foreground text-xs'>
            {formatChange(data?.department_change)} from last month
          </p>
        </CardContent>
      </Card>

      {/* Program and Course Metrics */}
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='flex items-center gap-2 text-sm font-medium'>
            <IconBookmark className='h-4 w-4' />
            Total Programs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{data?.total_programs || 0}</div>
          <p className='text-muted-foreground text-xs'>
            {formatChange(data?.program_change)} from last month
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='flex items-center gap-2 text-sm font-medium'>
            <IconDeviceLaptop className='h-4 w-4' />
            Online Courses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>
            {data?.total_online_courses || 0}
          </div>
          <p className='text-muted-foreground text-xs'>
            {formatChange(data?.online_course_change)} from last month
          </p>
        </CardContent>
      </Card>

      {/* Student and Enrollment Metrics */}
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='flex items-center gap-2 text-sm font-medium'>
            <IconUsers className='h-4 w-4' />
            Total Students
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{data?.total_students || 0}</div>
          <p className='text-muted-foreground text-xs'>
            {formatChange(data?.student_change)} from last month
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='flex items-center gap-2 text-sm font-medium'>
            <IconSchool className='h-4 w-4' />
            Enrolled Students
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>
            {data?.enrolled_students || 0}
          </div>
          <p className='text-muted-foreground text-xs'>
            {formatChange(data?.enrollment_change)} from last month
          </p>
        </CardContent>
      </Card>

      {/* Academic Staff Metrics */}
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='flex items-center gap-2 text-sm font-medium'>
            <IconUsers className='h-4 w-4' />
            Total Lecturers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{data?.total_lecturers || 0}</div>
          <p className='text-muted-foreground text-xs'>
            {formatChange(data?.lecturer_change)} from last month
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='flex items-center gap-2 text-sm font-medium'>
            <IconBook className='h-4 w-4' />
            Total Lessons
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{data?.total_lessons || 0}</div>
          <p className='text-muted-foreground text-xs'>
            {formatChange(data?.lesson_change)} from last month
          </p>
        </CardContent>
      </Card>

      {/* Event and Workshop Metrics */}
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='flex items-center gap-2 text-sm font-medium'>
            <IconCalendar className='h-4 w-4' />
            Total Webinars
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{data?.total_webinars || 0}</div>
          <p className='text-muted-foreground text-xs'>
            {formatChange(data?.webinar_change)} from last month
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='flex items-center gap-2 text-sm font-medium'>
            <IconCalendar className='h-4 w-4' />
            Total Workshops
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{data?.total_workshops || 0}</div>
          <p className='text-muted-foreground text-xs'>
            {formatChange(data?.workshop_change)} from last month
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
