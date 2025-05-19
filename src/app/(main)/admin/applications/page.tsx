'use client';

import { useQuery } from '@tanstack/react-query';
import useClientApi from '@/lib/axios/clientSide';
import PageContainer from '@/components/layout/page-container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import ApplicationTable from './components/ApplicationTable';
import { ApplicationResponse, Application } from '@/types/application';
export default function ApplicationsPage() {
  const { api } = useClientApi();
  const router = useRouter();

  // Fetch initial data for stats
  const { data, isLoading, error } = useQuery({
    queryKey: ['applications-stats'],
    queryFn: async () => {
      if (!api) throw new Error('API not initialized');
      const response = await api.get('/admin/applications/');
      return response.data as ApplicationResponse;
    }
  });

  const handleExport = () => {
    // Export functionality
    if (api) {
      window.open('/applications/export', '_blank');
    }
  };

  const handleAddNew = () => {
    router.push('/applications/new');
  };

  if (isLoading) {
    return (
      <PageContainer className='w-full'>
        <div className='flex h-96 items-center justify-center'>
          <p>Loading applications...</p>
        </div>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer className='w-full'>
        <div className='flex h-96 items-center justify-center'>
          <p className='text-red-500'>
            Error loading applications. Please try again later.
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
            <h1 className='text-3xl font-bold'>Applications</h1>
            <p className='text-muted-foreground'>
              Manage and monitor university applications
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className='grid grid-cols-1 gap-4 md:grid-cols-4'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Total Applications
              </CardTitle>
              <FileText className='text-muted-foreground h-4 w-4' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{data?.count || 0}</div>
              <p className='text-muted-foreground text-xs'>All applications</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Pending Applications
              </CardTitle>
              <Clock className='text-muted-foreground h-4 w-4' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {data?.results?.filter((a) => a.status === 'PENDING').length ||
                  0}
              </div>
              <p className='text-muted-foreground text-xs'>Awaiting review</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Approved Applications
              </CardTitle>
              <CheckCircle className='text-muted-foreground h-4 w-4' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {data?.results?.filter((a) => a.status === 'APPROVED').length ||
                  0}
              </div>
              <p className='text-muted-foreground text-xs'>
                Successfully approved
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Rejected Applications
              </CardTitle>
              <XCircle className='text-muted-foreground h-4 w-4' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {data?.results?.filter((a) => a.status === 'REJECTED').length ||
                  0}
              </div>
              <p className='text-muted-foreground text-xs'>
                Rejected applications
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Applications Table - Fixed overflow issue */}
        <Card className='w-full overflow-hidden'>
          <CardContent className='p-0'>
            <div className='w-full overflow-x-auto'>
              <ApplicationTable
                onExport={handleExport}
                onAddNew={handleAddNew}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
