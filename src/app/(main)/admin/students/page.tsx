'use client';

import { useQuery } from '@tanstack/react-query';
import useClientApi from '@/lib/axios/clientSide';
import PageContainer from '@/components/layout/page-container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserCheck, Users, UserPlus, BarChart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import StudentsTable from './components/StudentTable';
import { StudentsResponse } from '@/types/student-details';

export default function StudentsPage() {
  const { api } = useClientApi();
  const router = useRouter();

  // Fetch initial data for stats
  const { data, isLoading, error } = useQuery<StudentsResponse>({
    queryKey: ['students-stats'],
    queryFn: async () => {
      if (!api) throw new Error('API not initialized');
      const response = await api.get('/admin/students/');
      return response.data;
    }
  });

  const handleExport = () => {
    // TODO: Implement export functionality
    if (api) {
      // Example: download CSV from your backend
      window.open('/api/admin/students/export', '_blank');
    }
  };

  const handleAddNew = () => {
    router.push('/admin/students/new');
  };

  if (isLoading) {
    return (
      <PageContainer className='w-full'>
        <div className='flex h-96 items-center justify-center'>
          <p>Loading students...</p>
        </div>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer className='w-full'>
        <div className='flex h-96 items-center justify-center'>
          <p className='text-red-500'>
            Error loading students. Please try again later.
          </p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer className='w-full'>
      <div className='w-full space-y-6'>
        {/* Header */}
        <div className='flex w-full items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold'>Students</h1>
            <p className='text-muted-foreground'>
              Manage and monitor student accounts
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className='grid grid-cols-1 gap-4 md:grid-cols-4'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Total Students
              </CardTitle>
              <Users className='text-muted-foreground h-4 w-4' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{data?.count || 0}</div>
              <p className='text-muted-foreground text-xs'>
                All registered students
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Active Students
              </CardTitle>
              <UserCheck className='text-muted-foreground h-4 w-4' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {data?.results?.filter((s) => s.user.is_active).length || 0}
              </div>
              <p className='text-muted-foreground text-xs'>
                Currently active accounts
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                New This Month
              </CardTitle>
              <UserPlus className='text-muted-foreground h-4 w-4' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {data?.results?.filter((s) => {
                  const joined = new Date(s.user.date_joined);
                  const now = new Date();
                  return (
                    joined.getMonth() === now.getMonth() &&
                    joined.getFullYear() === now.getFullYear()
                  );
                }).length || 0}
              </div>
              <p className='text-muted-foreground text-xs'>
                New registrations this month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Avg. Progress
              </CardTitle>
              <BarChart className='text-muted-foreground h-4 w-4' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {data?.results && data.results.length > 0
                  ? Math.round(
                      data.results.reduce((acc, s) => acc + s.reg_prog, 0) /
                        data.results.length
                    )
                  : 0}
                %
              </div>
              <p className='text-muted-foreground text-xs'>
                Average registration progress
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Students Table */}
        <Card className='w-full'>
          <CardContent className='p-0'>
            <StudentsTable onExport={handleExport} onAddNew={handleAddNew} />
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
