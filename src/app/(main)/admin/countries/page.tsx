'use client';

import { useQuery } from '@tanstack/react-query';
import useClientApi from '@/lib/axios/clientSide';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import PageContainer from '@/components/layout/page-container';
import CountryTable from './components/CountryTable';

export default function CountriesPage() {
  const { api } = useClientApi();
  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: ['countries'],
    queryFn: async () => {
      if (!api) throw new Error('API not initialized');
      const response = await api.get('/country/');
      return response.data;
    },
    enabled: !!api
  });

  return (
    <PageContainer className='w-full'>
      <div className='w-full space-y-6'>
        <div className='flex w-full items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>Countries</h1>
            <p className='text-muted-foreground'>
              Manage countries and their details
            </p>
          </div>
          <Button onClick={() => router.push('/admin/countries/new')}>
            <Plus className='mr-2 h-4 w-4' />
            Add Country
          </Button>
        </div>

        <CountryTable
          data={data?.results ?? data ?? []}
          isLoading={isLoading}
        />
      </div>
    </PageContainer>
  );
}
