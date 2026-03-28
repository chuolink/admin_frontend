// @ts-nocheck
'use client';

import PageContainer from '@/components/layout/page-container';
import {
  GenericDataTable,
  type ColumnDef,
  type FormFieldDef
} from '@/features/data-admin/components/GenericDataTable';
import type { FilterDef } from '@/features/data-admin/components/TableFilters';
import { Quote } from 'lucide-react';

/* ═══════════════════════════════════════════════
   Testimonials Table
   ═══════════════════════════════════════════════ */

const testimonialColumns: ColumnDef[] = [
  { key: 'person_name', header: 'Person', type: 'text' },
  { key: 'relationship', header: 'Relationship', type: 'text' },
  { key: 'testimonial_type', header: 'Type', type: 'badge' },
  { key: 'university_name', header: 'University', type: 'text' },
  { key: 'country_name', header: 'Country', type: 'text' },
  { key: 'is_featured', header: 'Featured', type: 'boolean' },
  { key: 'is_active', header: 'Active', type: 'boolean' },
  { key: 'display_order', header: 'Order', type: 'number' },
  { key: 'created_at', header: 'Created', type: 'date' }
];

const testimonialFormFields: FormFieldDef[] = [
  { name: 'person_name', label: 'Person Name', type: 'text', required: true },
  { name: 'relationship', label: 'Relationship', type: 'text' },
  {
    name: 'testimonial_type',
    label: 'Type',
    type: 'select',
    options: [
      { value: 'student', label: 'Student' },
      { value: 'parent', label: 'Parent' },
      { value: 'alumni', label: 'Alumni' },
      { value: 'staff', label: 'Staff' }
    ]
  },
  { name: 'video_url', label: 'Video URL', type: 'url' },
  { name: 'thumbnail', label: 'Thumbnail', type: 'image' },
  { name: 'quote', label: 'Quote', type: 'textarea', required: true },
  {
    name: 'university',
    label: 'University',
    type: 'entity',
    endpoint: '/data-admin/universities/',
    queryKey: 'data-admin-universities-picker'
  },
  {
    name: 'country',
    label: 'Country',
    type: 'entity',
    endpoint: '/data-admin/countries/',
    queryKey: 'data-admin-countries-picker'
  },
  { name: 'is_featured', label: 'Featured', type: 'boolean' },
  { name: 'is_active', label: 'Active', type: 'boolean', defaultValue: true },
  {
    name: 'display_order',
    label: 'Display Order',
    type: 'number',
    defaultValue: 0
  }
];

const testimonialFilters: FilterDef[] = [
  {
    key: 'testimonial_type',
    label: 'Type',
    type: 'select',
    options: [
      { value: 'student', label: 'Student' },
      { value: 'parent', label: 'Parent' },
      { value: 'alumni', label: 'Alumni' },
      { value: 'staff', label: 'Staff' }
    ]
  },
  { key: 'is_featured', label: 'Featured', type: 'boolean' },
  { key: 'is_active', label: 'Active', type: 'boolean' }
];

/* ═══════════════════════════════════════════════
   Page Component
   ═══════════════════════════════════════════════ */

export default function TestimonialsPage() {
  return (
    <PageContainer>
      <div className='space-y-6'>
        <div>
          <div className='flex items-center gap-2'>
            <Quote className='text-muted-foreground h-5 w-5' />
            <h1 className='text-2xl font-semibold tracking-tight'>
              Testimonials
            </h1>
          </div>
          <p className='text-muted-foreground mt-1 text-sm'>
            Manage testimonials displayed across the platform
          </p>
        </div>

        <GenericDataTable
          endpoint='/data-admin/testimonials/'
          queryKey='data-admin-testimonials'
          entityName='Testimonial'
          columns={testimonialColumns}
          formFields={testimonialFormFields}
          filters={testimonialFilters}
        />
      </div>
    </PageContainer>
  );
}
