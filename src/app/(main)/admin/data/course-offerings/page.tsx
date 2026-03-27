'use client';

import { useQueryState } from 'nuqs';

import { useState } from 'react';
import {
  Library,
  CheckCircle2,
  XCircle,
  ClipboardList,
  AlertTriangle,
  Receipt,
  DollarSign
} from 'lucide-react';
import PageContainer from '@/components/layout/page-container';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { SectionAnalytics } from '@/features/data-admin/components/SectionAnalytics';
import { useDataStats } from '@/features/data-admin/hooks/use-data-stats';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/utils';
import OfferingDataTable from './components/OfferingDataTable';
import RequirementsTable from './components/RequirementsTable';
import ExpensesTable from './components/ExpensesTable';
import { OfferingFormDialog } from './components/OfferingFormDialog';

export default function CourseOfferingsPage() {
  const { data: stats, isLoading: statsLoading } = useDataStats();
  const [offeringDialogOpen, setOfferingDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useQueryState('tab', {
    defaultValue: 'offerings'
  });

  const offeringStats = stats?.course_offerings;

  const analyticsItems = [
    {
      label: 'Total Offerings',
      value: offeringStats?.total ?? 0,
      icon: Library,
      color: 'bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400'
    },
    {
      label: 'Active',
      value: offeringStats?.active ?? 0,
      icon: CheckCircle2,
      color:
        'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
    },
    {
      label: 'Inactive',
      value: offeringStats?.inactive ?? 0,
      icon: XCircle,
      color: 'bg-gray-100 text-gray-600 dark:bg-gray-500/10 dark:text-gray-400'
    },
    {
      label: 'With Requirements',
      value: offeringStats?.with_requirements ?? 0,
      icon: ClipboardList,
      color:
        'bg-violet-100 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400'
    },
    {
      label: 'Without Requirements',
      value: offeringStats?.without_requirements ?? 0,
      icon: AlertTriangle,
      color:
        'bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400'
    },
    {
      label: 'With Expenses',
      value: offeringStats?.with_expenses ?? 0,
      icon: Receipt,
      color: 'bg-rose-100 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400'
    },
    {
      label: 'Avg Fee',
      value: offeringStats?.avg_fee
        ? formatCurrency(offeringStats.avg_fee)
        : 'N/A',
      icon: DollarSign,
      color: 'bg-teal-100 text-teal-600 dark:bg-teal-500/10 dark:text-teal-400'
    }
  ];

  return (
    <PageContainer className='w-full'>
      <div className='w-full min-w-0 space-y-6'>
        {/* Header */}
        <div>
          <div className='flex items-center gap-2'>
            <Library className='text-muted-foreground h-5 w-5' />
            <h1 className='text-2xl font-semibold tracking-tight'>
              Course Offerings
            </h1>
          </div>
          <p className='text-muted-foreground mt-1 text-sm'>
            Manage course offerings, requirements, and expenses
          </p>
        </div>

        {/* Stats */}
        {statsLoading ? (
          <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={i} className='h-[88px]' />
            ))}
          </div>
        ) : (
          <SectionAnalytics stats={analyticsItems} />
        )}

        {/* Tabs */}
        <Tabs value={activeTab ?? ''} onValueChange={setActiveTab}>
          <div className='flex items-center justify-between'>
            <TabsList>
              <TabsTrigger value='offerings'>Offerings</TabsTrigger>
              <TabsTrigger value='requirements'>Requirements</TabsTrigger>
              <TabsTrigger value='expenses'>Expenses</TabsTrigger>
            </TabsList>
            <div>
              {activeTab === 'offerings' && (
                <Button size='sm' onClick={() => setOfferingDialogOpen(true)}>
                  Add Offering
                </Button>
              )}
            </div>
          </div>

          <TabsContent value='offerings' className='mt-4'>
            <OfferingDataTable />
          </TabsContent>

          <TabsContent value='requirements' className='mt-4'>
            <RequirementsTable />
          </TabsContent>

          <TabsContent value='expenses' className='mt-4'>
            <ExpensesTable />
          </TabsContent>
        </Tabs>
      </div>

      {/* Create Dialog */}
      <OfferingFormDialog
        open={offeringDialogOpen}
        onOpenChange={setOfferingDialogOpen}
        mode='create'
      />
    </PageContainer>
  );
}
