'use client';

import { useQuery } from '@tanstack/react-query';
import useClientApi from '@/lib/axios/clientSide';
import PageContainer from '@/components/layout/page-container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import ApplicationTable from './components/ApplicationTable';
import { ApplicationResponse } from '@/types/application';

export default function ApplicationsPage() {
  const { api } = useClientApi();
  const router = useRouter();

  const { data: totalData } = useQuery<ApplicationResponse>({
    queryKey: ['applications-stats-total'],
    queryFn: async () => {
      const response = await api!.get('/admin/applications/', {
        params: { page_size: 1 }
      });
      return response.data;
    },
    enabled: !!api
  });

  const { data: pendingData } = useQuery<ApplicationResponse>({
    queryKey: ['applications-stats-pending'],
    queryFn: async () => {
      const response = await api!.get('/admin/applications/', {
        params: { page_size: 1, status: 'PENDING' }
      });
      return response.data;
    },
    enabled: !!api
  });

  const { data: approvedData } = useQuery<ApplicationResponse>({
    queryKey: ['applications-stats-approved'],
    queryFn: async () => {
      const response = await api!.get('/admin/applications/', {
        params: { page_size: 1, status: 'APPROVED' }
      });
      return response.data;
    },
    enabled: !!api
  });

  const { data: rejectedData } = useQuery<ApplicationResponse>({
    queryKey: ['applications-stats-rejected'],
    queryFn: async () => {
      const response = await api!.get('/admin/applications/', {
        params: { page_size: 1, status: 'REJECTED' }
      });
      return response.data;
    },
    enabled: !!api
  });

  const handleAddNew = () => {
    router.push('/admin/applications/new');
  };

  return (
    <PageContainer className='w-full'>
      <div className='w-full space-y-6'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight'>Applications</h1>
          <p className='text-muted-foreground'>
            Manage university applications and track their status
          </p>
        </div>

        <div className='grid grid-cols-2 gap-4 lg:grid-cols-4'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Total</CardTitle>
              <FileText className='text-muted-foreground h-4 w-4' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {totalData?.count ?? '--'}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Pending</CardTitle>
              <Clock className='h-4 w-4 text-amber-500' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-amber-600'>
                {pendingData?.count ?? '--'}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Approved</CardTitle>
              <CheckCircle className='h-4 w-4 text-green-500' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-green-600'>
                {approvedData?.count ?? '--'}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Rejected</CardTitle>
              <XCircle className='h-4 w-4 text-red-500' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-red-600'>
                {rejectedData?.count ?? '--'}
              </div>
            </CardContent>
          </Card>
        </div>

        <ApplicationTable onAddNew={handleAddNew} />
      </div>
    </PageContainer>
  );
}
