// @ts-nocheck
'use client';

import PageContainer from '@/components/layout/page-container';
import {
  GenericDataTable,
  type ColumnDef,
  type FormFieldDef
} from '@/features/data-admin/components/GenericDataTable';
import type { FilterDef } from '@/features/data-admin/components/TableFilters';
import { Users } from 'lucide-react';

/* ═══════════════════════════════════════════════
   Parents Table
   ═══════════════════════════════════════════════ */

const parentColumns: ColumnDef[] = [
  { key: 'name', header: 'Name', type: 'text' },
  { key: 'phone_number', header: 'Phone', type: 'text' },
  { key: 'email', header: 'Email', type: 'text' },
  { key: 'student_name', header: 'Student', type: 'text' },
  {
    key: 'verification_status',
    header: 'Verification',
    type: 'badge',
    badgeColors: {
      pending: 'border-amber-500/30 text-amber-500',
      verified: 'border-green-500/30 text-green-500',
      rejected: 'border-red-500/30 text-red-500'
    }
  },
  { key: 'is_primary_contact', header: 'Primary Contact', type: 'boolean' },
  { key: 'created_at', header: 'Created', type: 'date' }
];

const parentFormFields: FormFieldDef[] = [
  { name: 'name', label: 'Name', type: 'text', required: true },
  { name: 'phone_number', label: 'Phone Number', type: 'text' },
  { name: 'email', label: 'Email', type: 'email' },
  {
    name: 'student',
    label: 'Student',
    type: 'entity',
    endpoint: '/admin/students/',
    queryKey: 'admin-students-picker'
  },
  { name: 'user', label: 'User ID (optional)', type: 'text' },
  {
    name: 'verification_status',
    label: 'Verification Status',
    type: 'select',
    options: [
      { value: 'UNVERIFIED', label: 'Unverified' },
      { value: 'VERIFIED', label: 'Verified' }
    ]
  },
  { name: 'is_primary_contact', label: 'Primary Contact', type: 'boolean' }
];

const parentFilters: FilterDef[] = [
  {
    key: 'verification_status',
    label: 'Verification',
    type: 'select',
    options: [
      { value: 'pending', label: 'Pending' },
      { value: 'verified', label: 'Verified' },
      { value: 'rejected', label: 'Rejected' }
    ]
  },
  { key: 'is_primary_contact', label: 'Primary Contact', type: 'boolean' }
];

/* ═══════════════════════════════════════════════
   Page Component
   ═══════════════════════════════════════════════ */

export default function ParentsPage() {
  return (
    <PageContainer>
      <div className='space-y-6'>
        <div>
          <div className='flex items-center gap-2'>
            <Users className='text-muted-foreground h-5 w-5' />
            <h1 className='text-2xl font-semibold tracking-tight'>Parents</h1>
          </div>
          <p className='text-muted-foreground mt-1 text-sm'>
            Manage parent profiles and student links
          </p>
        </div>

        <GenericDataTable
          endpoint='/data-admin/parents/'
          queryKey='data-admin-parents'
          entityName='Parent'
          columns={parentColumns}
          formFields={parentFormFields}
          filters={parentFilters}
        />
      </div>
    </PageContainer>
  );
}
