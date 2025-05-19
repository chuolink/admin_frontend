'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import PageContainer from '@/components/layout/page-container';
import CountryTable from './components/CountryTable';

export default function CountriesPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['countries'],
    queryFn: async () => {
      const response = await axios.get('/api/countries');
      return response.data;
    }
  });

  const handleAddNew = () => {
    router.push('/admin/countries/new');
  };

  const handleExport = () => {
    // Implement export functionality
  };

  if (error) {
    return (
      <PageContainer className='w-full'>
        <div className='flex h-96 items-center justify-center'>
          <p className='text-red-500'>Error loading countries</p>
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
            <h1 className='text-3xl font-bold'>Countries</h1>
            <p className='text-muted-foreground'>
              Manage countries and their details
            </p>
          </div>
          <div className='flex items-center gap-2'>
            <Button variant='outline' onClick={handleExport}>
              Export
            </Button>
            <Button onClick={handleAddNew}>
              <Plus className='mr-2 h-4 w-4' />
              Add Country
            </Button>
          </div>
        </div>

        {/* Table */}
        <CountryTable
          data={data || []}
          isLoading={isLoading}
          onAddNew={handleAddNew}
          onExport={handleExport}
        />
      </div>
    </PageContainer>
  );
}
