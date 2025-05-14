'use client';

import { Suspense, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTransactions } from '@/hooks/use-transactions';
import { useTransactionsStore } from '@/stores/use-transactions-store';
import { Pagination } from '@/components/ui/pagination';
import { TransactionFilters as TransactionFiltersType } from '@/types';
import { TransactionStats } from './components/transaction-stats';
import { TransactionFilters } from './components/transaction-filters';
import { TransactionTable } from './components/transaction-table';
import { TransactionsLoading } from './components/loading';

export default function TransactionsPage() {
  const [filters, setFilters] = useState<TransactionFiltersType>({
    page: 1,
    limit: 10,
    status: 'all',
    payment_method: 'all',
    search: '',
    start_date: '',
    end_date: ''
  });

  const { transactions, stats, isLoading, pagination } =
    useTransactions(filters);
  const filterByMethod = useTransactionsStore((state) => state.filterByMethod);

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handleFilterChange = (
    key: keyof TransactionFiltersType,
    value: string
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  if (isLoading) {
    return <TransactionsLoading />;
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-3xl font-bold'>Transactions</h1>
        <TransactionFilters
          filters={filters}
          onFilterChange={handleFilterChange}
        />
      </div>

      <Suspense fallback={<TransactionsLoading />}>
        <TransactionStats stats={stats} />
      </Suspense>

      <Tabs defaultValue='all' className='space-y-4'>
        <TabsList>
          <TabsTrigger value='all'>All Transactions</TabsTrigger>
          <TabsTrigger value='bank'>Bank Transfers</TabsTrigger>
          <TabsTrigger value='mobile'>Mobile Money</TabsTrigger>
        </TabsList>
        <TabsContent value='all'>
          <Suspense fallback={<TransactionsLoading />}>
            <TransactionTable data={transactions} />
          </Suspense>
        </TabsContent>
        <TabsContent value='bank'>
          <Suspense fallback={<TransactionsLoading />}>
            <TransactionTable data={filterByMethod('bank')} />
          </Suspense>
        </TabsContent>
        <TabsContent value='mobile'>
          <Suspense fallback={<TransactionsLoading />}>
            <TransactionTable data={filterByMethod('mobile')} />
          </Suspense>
        </TabsContent>
      </Tabs>

      <div className='flex justify-center'>
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
}
