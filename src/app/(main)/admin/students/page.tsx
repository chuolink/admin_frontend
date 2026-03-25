'use client';

import { useQuery } from '@tanstack/react-query';
import useClientApi from '@/lib/axios/clientSide';
import PageContainer from '@/components/layout/page-container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserCheck, GraduationCap, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import StudentsTable from './components/StudentTable';
import { StudentsResponse } from '@/types/student-details';

export default function StudentsPage() {
  const { api } = useClientApi();
  const router = useRouter();

  const { data, isLoading } = useQuery<StudentsResponse>({
    queryKey: ['students-stats'],
    queryFn: async () => {
      if (!api) throw new Error('API not initialized');
      const response = await api.get('/admin/students/', {
        params: { page_size: 1 }
      });
      return response.data;
    },
    enabled: !!api
  });

  const { data: pipelineData } = useQuery({
    queryKey: ['students-pipeline-count'],
    queryFn: async () => {
      if (!api) throw new Error('API not initialized');
      const response = await api.get('/admin/pipelines/', {
        params: { page_size: 1 }
      });
      return response.data;
    },
    enabled: !!api
  });

  const handleAddNew = () => {
    router.push('/admin/students/new');
  };

  if (isLoading) {
    return (
      <PageContainer className='w-full'>
        <div className='flex h-96 items-center justify-center'>
          <Loader2 className='text-muted-foreground h-8 w-8 animate-spin' />
        </div>
      </PageContainer>
    );
  }

  const totalCount = data?.count || 0;
  const pipelineCount = pipelineData?.count ?? 0;

  return (
    <PageContainer className='w-full'>
      <div className='w-full space-y-6'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight'>Students</h1>
          <p className='text-muted-foreground'>
            Manage and track all registered students
          </p>
        </div>

        <div className='grid grid-cols-3 gap-4'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Total Students
              </CardTitle>
              <Users className='text-muted-foreground h-4 w-4' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {totalCount.toLocaleString()}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Active</CardTitle>
              <UserCheck className='text-muted-foreground h-4 w-4' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-green-600'>
                {totalCount > 0 ? totalCount : 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>In Pipeline</CardTitle>
              <GraduationCap className='text-muted-foreground h-4 w-4' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-blue-600'>
                {pipelineCount}
              </div>
            </CardContent>
          </Card>
        </div>

        <StudentsTable onAddNew={handleAddNew} />
      </div>
    </PageContainer>
  );
}
