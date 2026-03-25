'use client';

import PageContainer from '@/components/layout/page-container';
import ApplicationTable from './components/ApplicationTable';

export default function ConsultantApplicationsPage() {
  return (
    <PageContainer className='w-full'>
      <div className='w-full space-y-6'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight'>
            Consultant Applications
          </h1>
          <p className='text-muted-foreground'>
            Manage and monitor consultant student applications
          </p>
        </div>

        <ApplicationTable />
      </div>
    </PageContainer>
  );
}
