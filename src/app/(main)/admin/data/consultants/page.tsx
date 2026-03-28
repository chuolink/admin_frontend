// @ts-nocheck
'use client';

import PageContainer from '@/components/layout/page-container';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  GenericDataTable,
  type ColumnDef,
  type FormFieldDef
} from '@/features/data-admin/components/GenericDataTable';
import type { FilterDef } from '@/features/data-admin/components/TableFilters';
import { Briefcase } from 'lucide-react';

/* ═══════════════════════════════════════════════
   Tab 1: Consultants
   ═══════════════════════════════════════════════ */

const consultantColumns: ColumnDef[] = [
  { key: 'user_email', header: 'Email', type: 'text' },
  { key: 'is_active', header: 'Active', type: 'boolean' },
  { key: 'payment_type', header: 'Payment Type', type: 'text' },
  { key: 'payment_name', header: 'Payment Name', type: 'text' },
  { key: 'earnings', header: 'Earnings', type: 'number' },
  { key: 'created_at', header: 'Created', type: 'date' }
];

const consultantFormFields: FormFieldDef[] = [
  { name: 'user', label: 'User ID', type: 'text', required: true },
  { name: 'is_active', label: 'Active', type: 'boolean' },
  {
    name: 'payment_type',
    label: 'Payment Type',
    type: 'select',
    options: [
      { value: 'bank', label: 'Bank' },
      { value: 'mobile_money', label: 'Mobile Money' },
      { value: 'cash', label: 'Cash' }
    ]
  },
  { name: 'payment_name', label: 'Payment Name', type: 'text' },
  { name: 'payment_account_name', label: 'Account Name', type: 'text' },
  { name: 'payment_account_number', label: 'Account Number', type: 'text' },
  { name: 'earnings', label: 'Earnings', type: 'number' }
];

const consultantFilters: FilterDef[] = [
  { key: 'is_active', label: 'Active', type: 'boolean' },
  {
    key: 'payment_type',
    label: 'Payment Type',
    type: 'select',
    options: [
      { value: 'bank', label: 'Bank' },
      { value: 'mobile_money', label: 'Mobile Money' },
      { value: 'cash', label: 'Cash' }
    ]
  }
];

/* ═══════════════════════════════════════════════
   Tab 2: Applications (Assignments)
   ═══════════════════════════════════════════════ */

const applicationColumns: ColumnDef[] = [
  { key: 'consultant_name', header: 'Consultant', type: 'text' },
  { key: 'application_id', header: 'Application', type: 'text' },
  { key: 'status', header: 'Status', type: 'badge' },
  { key: 'is_paid', header: 'Paid', type: 'boolean' },
  { key: 'created_at', header: 'Created', type: 'date' }
];

const applicationFormFields: FormFieldDef[] = [
  {
    name: 'consultant',
    label: 'Consultant',
    type: 'entity',
    endpoint: '/data-admin/consultants/',
    queryKey: 'data-admin-consultants-picker',
    mapItem: (item) => ({
      id: item.id as string,
      name: (item.user_email || item.id) as string
    })
  },
  { name: 'application', label: 'Application ID', type: 'text' },
  {
    name: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { value: 'assigned', label: 'Assigned' },
      { value: 'in_progress', label: 'In Progress' },
      { value: 'completed', label: 'Completed' },
      { value: 'cancelled', label: 'Cancelled' }
    ]
  },
  { name: 'is_paid', label: 'Paid', type: 'boolean' }
];

const applicationFilters: FilterDef[] = [
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { value: 'assigned', label: 'Assigned' },
      { value: 'in_progress', label: 'In Progress' },
      { value: 'completed', label: 'Completed' },
      { value: 'cancelled', label: 'Cancelled' }
    ]
  },
  { key: 'is_paid', label: 'Paid', type: 'boolean' }
];

/* ═══════════════════════════════════════════════
   Tab 3: Withdrawals
   ═══════════════════════════════════════════════ */

const withdrawalColumns: ColumnDef[] = [
  { key: 'consultant_name', header: 'Consultant', type: 'text' },
  { key: 'amount', header: 'Amount', type: 'number' },
  { key: 'created_at', header: 'Created', type: 'date' }
];

const withdrawalFormFields: FormFieldDef[] = [
  {
    name: 'consultant',
    label: 'Consultant',
    type: 'entity',
    endpoint: '/data-admin/consultants/',
    queryKey: 'data-admin-consultants-picker',
    mapItem: (item) => ({
      id: item.id as string,
      name: (item.user_email || item.id) as string
    })
  },
  { name: 'amount', label: 'Amount', type: 'number', required: true }
];

/* ═══════════════════════════════════════════════
   Page Component
   ═══════════════════════════════════════════════ */

export default function ConsultantsPage() {
  return (
    <PageContainer>
      <div className='space-y-6'>
        <div>
          <div className='flex items-center gap-2'>
            <Briefcase className='text-muted-foreground h-5 w-5' />
            <h1 className='text-2xl font-semibold tracking-tight'>
              Consultants
            </h1>
          </div>
          <p className='text-muted-foreground mt-1 text-sm'>
            Manage consultant profiles, applications, and withdrawals
          </p>
        </div>

        <Tabs defaultValue='consultants'>
          <TabsList>
            <TabsTrigger value='consultants'>Consultants</TabsTrigger>
            <TabsTrigger value='applications'>Applications</TabsTrigger>
            <TabsTrigger value='withdrawals'>Withdrawals</TabsTrigger>
          </TabsList>

          <TabsContent value='consultants' className='mt-4'>
            <GenericDataTable
              endpoint='/data-admin/consultants/'
              queryKey='data-admin-consultants'
              entityName='Consultant'
              columns={consultantColumns}
              formFields={consultantFormFields}
              filters={consultantFilters}
              bulkEnabled
            />
          </TabsContent>

          <TabsContent value='applications' className='mt-4'>
            <GenericDataTable
              endpoint='/data-admin/consultant-applications/'
              queryKey='data-admin-consultant-applications'
              entityName='Assignment'
              columns={applicationColumns}
              formFields={applicationFormFields}
              filters={applicationFilters}
            />
          </TabsContent>

          <TabsContent value='withdrawals' className='mt-4'>
            <GenericDataTable
              endpoint='/data-admin/consultant-withdrawals/'
              queryKey='data-admin-consultant-withdrawals'
              entityName='Withdrawal'
              columns={withdrawalColumns}
              formFields={withdrawalFormFields}
            />
          </TabsContent>
        </Tabs>
      </div>
    </PageContainer>
  );
}
