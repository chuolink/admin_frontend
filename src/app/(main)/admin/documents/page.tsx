'use client';

import { useQuery } from '@tanstack/react-query';
import useClientApi from '@/lib/axios/clientSide';
import PageContainer from '@/components/layout/page-container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, FileClock, FileCheck, FileX } from 'lucide-react';
import DocumentTable from './components/DocumentTable';

interface StatsResponse {
  count: number;
}

export default function DocumentsPage() {
  const { api } = useClientApi();

  const { data: totalData } = useQuery<StatsResponse>({
    queryKey: ['documents-stats-total'],
    queryFn: async () => {
      const response = await api!.get('/admin/documents/', {
        params: { page_size: 1 }
      });
      return response.data;
    },
    enabled: !!api
  });

  const { data: pendingData } = useQuery<StatsResponse>({
    queryKey: ['documents-stats-uploaded'],
    queryFn: async () => {
      const response = await api!.get('/admin/documents/', {
        params: { page_size: 1, status: 'UPLOADED' }
      });
      return response.data;
    },
    enabled: !!api
  });

  const { data: verifiedData } = useQuery<StatsResponse>({
    queryKey: ['documents-stats-verified'],
    queryFn: async () => {
      const response = await api!.get('/admin/documents/', {
        params: { page_size: 1, status: 'VERIFIED' }
      });
      return response.data;
    },
    enabled: !!api
  });

  const { data: rejectedData } = useQuery<StatsResponse>({
    queryKey: ['documents-stats-rejected'],
    queryFn: async () => {
      const response = await api!.get('/admin/documents/', {
        params: { page_size: 1, status: 'REJECTED' }
      });
      return response.data;
    },
    enabled: !!api
  });

  return (
    <PageContainer className='w-full'>
      <div className='w-full space-y-6'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight'>Documents</h1>
          <p className='text-muted-foreground'>
            Review and verify uploaded student documents
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
              <CardTitle className='text-sm font-medium'>
                Pending Review
              </CardTitle>
              <FileClock className='h-4 w-4 text-amber-500' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-amber-600'>
                {pendingData?.count ?? '--'}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Verified</CardTitle>
              <FileCheck className='h-4 w-4 text-green-500' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-green-600'>
                {verifiedData?.count ?? '--'}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Rejected</CardTitle>
              <FileX className='h-4 w-4 text-red-500' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-red-600'>
                {rejectedData?.count ?? '--'}
              </div>
            </CardContent>
          </Card>
        </div>

        <DocumentTable />
      </div>
    </PageContainer>
  );
}
