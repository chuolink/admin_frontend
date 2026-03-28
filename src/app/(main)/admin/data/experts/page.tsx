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
import { UserCog } from 'lucide-react';

/* ═══════════════════════════════════════════════
   Tab 1: Experts
   ═══════════════════════════════════════════════ */

const expertColumns: ColumnDef[] = [
  { key: 'user_email', header: 'Email', type: 'text' },
  { key: 'job_title', header: 'Job Title', type: 'text' },
  { key: 'institution', header: 'Institution', type: 'text' },
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
  { key: 'is_active', header: 'Active', type: 'boolean' },
  { key: 'created_at', header: 'Created', type: 'date' }
];

const expertFormFields: FormFieldDef[] = [
  { name: 'user', label: 'User ID', type: 'text', required: true },
  { name: 'bio', label: 'Bio', type: 'textarea' },
  { name: 'profile_photo', label: 'Profile Photo', type: 'image' },
  { name: 'location', label: 'Location', type: 'text' },
  { name: 'phone', label: 'Phone', type: 'text' },
  { name: 'job_title', label: 'Job Title', type: 'text' },
  { name: 'institution', label: 'Institution', type: 'text' },
  { name: 'years_experience', label: 'Years of Experience', type: 'number' },
  {
    name: 'employment_type',
    label: 'Employment Type',
    type: 'select',
    options: [
      { value: 'full_time', label: 'Full Time' },
      { value: 'part_time', label: 'Part Time' },
      { value: 'freelance', label: 'Freelance' },
      { value: 'student', label: 'Student' }
    ]
  },
  { name: 'cv_file', label: 'CV File URL', type: 'url' },
  { name: 'highest_degree', label: 'Highest Degree', type: 'text' },
  { name: 'degree_institution', label: 'Degree Institution', type: 'text' },
  { name: 'linkedin_url', label: 'LinkedIn URL', type: 'url' },
  { name: 'twitter_url', label: 'Twitter URL', type: 'url' },
  { name: 'instagram_url', label: 'Instagram URL', type: 'url' },
  { name: 'github_url', label: 'GitHub URL', type: 'url' },
  { name: 'website_url', label: 'Website URL', type: 'url' },
  { name: 'portfolio_url', label: 'Portfolio URL', type: 'url' },
  { name: 'expertise_source', label: 'Expertise Source', type: 'text' },
  { name: 'notable_work', label: 'Notable Work', type: 'textarea' },
  { name: 'message_rate', label: 'Message Rate', type: 'number' },
  { name: 'call_rate_per_min', label: 'Call Rate (per min)', type: 'number' },
  {
    name: 'group_subscription_price',
    label: 'Group Subscription Price',
    type: 'number'
  },
  {
    name: 'minimum_call_duration',
    label: 'Min Call Duration (min)',
    type: 'number'
  },
  {
    name: 'video_calls_enabled',
    label: 'Video Calls Enabled',
    type: 'boolean'
  },
  {
    name: 'verification_status',
    label: 'Verification Status',
    type: 'select',
    options: [
      { value: 'pending', label: 'Pending' },
      { value: 'verified', label: 'Verified' },
      { value: 'rejected', label: 'Rejected' }
    ]
  },
  { name: 'verification_notes', label: 'Verification Notes', type: 'textarea' },
  {
    name: 'verification_level',
    label: 'Verification Level',
    type: 'select',
    options: [
      { value: 'basic', label: 'Basic' },
      { value: 'premium', label: 'Premium' }
    ]
  },
  { name: 'onboarding_step', label: 'Onboarding Step', type: 'number' },
  {
    name: 'is_onboarding_complete',
    label: 'Onboarding Complete',
    type: 'boolean'
  },
  { name: 'is_active', label: 'Active', type: 'boolean' },
  { name: 'is_online', label: 'Online', type: 'boolean' },
  { name: 'total_earnings', label: 'Total Earnings', type: 'number' },
  { name: 'pending_earnings', label: 'Pending Earnings', type: 'number' },
  { name: 'withdrawn_amount', label: 'Withdrawn Amount', type: 'number' }
];

const expertFilters: FilterDef[] = [
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
  { key: 'is_active', label: 'Active', type: 'boolean' },
  {
    key: 'employment_type',
    label: 'Employment',
    type: 'select',
    options: [
      { value: 'full_time', label: 'Full Time' },
      { value: 'part_time', label: 'Part Time' },
      { value: 'freelance', label: 'Freelance' },
      { value: 'student', label: 'Student' }
    ]
  }
];

/* ═══════════════════════════════════════════════
   Tab 2: Credentials
   ═══════════════════════════════════════════════ */

const credentialColumns: ColumnDef[] = [
  { key: 'expert_name', header: 'Expert', type: 'text' },
  { key: 'credential_type', header: 'Type', type: 'badge' },
  { key: 'title', header: 'Title', type: 'text' },
  { key: 'institution', header: 'Institution', type: 'text' },
  { key: 'year', header: 'Year', type: 'number' },
  { key: 'created_at', header: 'Created', type: 'date' }
];

const credentialFormFields: FormFieldDef[] = [
  {
    name: 'expert',
    label: 'Expert',
    type: 'entity',
    endpoint: '/data-admin/experts/',
    queryKey: 'data-admin-experts-picker',
    mapItem: (item) => ({
      id: item.id as string,
      name: (item.user_email || item.id) as string
    })
  },
  {
    name: 'credential_type',
    label: 'Credential Type',
    type: 'select',
    options: [
      { value: 'degree', label: 'Degree' },
      { value: 'certificate', label: 'Certificate' },
      { value: 'license', label: 'License' },
      { value: 'award', label: 'Award' },
      { value: 'other', label: 'Other' }
    ]
  },
  { name: 'title', label: 'Title', type: 'text', required: true },
  { name: 'institution', label: 'Institution', type: 'text' },
  { name: 'file', label: 'File URL', type: 'url' },
  { name: 'year', label: 'Year', type: 'number' }
];

const credentialFilters: FilterDef[] = [
  {
    key: 'credential_type',
    label: 'Type',
    type: 'select',
    options: [
      { value: 'degree', label: 'Degree' },
      { value: 'certificate', label: 'Certificate' },
      { value: 'license', label: 'License' },
      { value: 'award', label: 'Award' },
      { value: 'other', label: 'Other' }
    ]
  }
];

/* ═══════════════════════════════════════════════
   Tab 3: Expertise
   ═══════════════════════════════════════════════ */

const expertiseColumns: ColumnDef[] = [
  { key: 'expert_name', header: 'Expert', type: 'text' },
  { key: 'discipline_name', header: 'Discipline', type: 'text' },
  { key: 'is_primary', header: 'Primary', type: 'boolean' },
  { key: 'target_level', header: 'Target Level', type: 'text' },
  { key: 'created_at', header: 'Created', type: 'date' }
];

const expertiseFormFields: FormFieldDef[] = [
  {
    name: 'expert',
    label: 'Expert',
    type: 'entity',
    endpoint: '/data-admin/experts/',
    queryKey: 'data-admin-experts-picker',
    mapItem: (item) => ({
      id: item.id as string,
      name: (item.user_email || item.id) as string
    })
  },
  {
    name: 'discipline',
    label: 'Discipline',
    type: 'entity',
    endpoint: '/data-admin/disciplines/',
    queryKey: 'data-admin-disciplines-picker'
  },
  { name: 'is_primary', label: 'Primary Expertise', type: 'boolean' },
  { name: 'target_level', label: 'Target Level', type: 'text' }
];

/* ═══════════════════════════════════════════════
   Tab 4: Availability
   ═══════════════════════════════════════════════ */

const availabilityColumns: ColumnDef[] = [
  { key: 'expert_name', header: 'Expert', type: 'text' },
  { key: 'day', header: 'Day', type: 'text' },
  { key: 'start_time', header: 'Start', type: 'text' },
  { key: 'end_time', header: 'End', type: 'text' },
  { key: 'timezone', header: 'Timezone', type: 'text' }
];

const availabilityFormFields: FormFieldDef[] = [
  {
    name: 'expert',
    label: 'Expert',
    type: 'entity',
    endpoint: '/data-admin/experts/',
    queryKey: 'data-admin-experts-picker',
    mapItem: (item) => ({
      id: item.id as string,
      name: (item.user_email || item.id) as string
    })
  },
  {
    name: 'day',
    label: 'Day',
    type: 'select',
    options: [
      { value: 'monday', label: 'Monday' },
      { value: 'tuesday', label: 'Tuesday' },
      { value: 'wednesday', label: 'Wednesday' },
      { value: 'thursday', label: 'Thursday' },
      { value: 'friday', label: 'Friday' },
      { value: 'saturday', label: 'Saturday' },
      { value: 'sunday', label: 'Sunday' }
    ]
  },
  {
    name: 'start_time',
    label: 'Start Time',
    type: 'text',
    placeholder: '09:00'
  },
  { name: 'end_time', label: 'End Time', type: 'text', placeholder: '17:00' },
  {
    name: 'timezone',
    label: 'Timezone',
    type: 'text',
    defaultValue: 'Africa/Dar_es_Salaam'
  }
];

/* ═══════════════════════════════════════════════
   Tab 5: Bookings
   ═══════════════════════════════════════════════ */

const bookingColumns: ColumnDef[] = [
  { key: 'expert_name', header: 'Expert', type: 'text' },
  { key: 'student_name', header: 'Student', type: 'text' },
  { key: 'booking_type', header: 'Type', type: 'badge' },
  {
    key: 'status',
    header: 'Status',
    type: 'badge',
    badgeColors: {
      pending: 'border-amber-500/30 text-amber-500',
      confirmed: 'border-blue-500/30 text-blue-500',
      completed: 'border-green-500/30 text-green-500',
      cancelled: 'border-red-500/30 text-red-500'
    }
  },
  { key: 'scheduled_date', header: 'Date', type: 'date' },
  { key: 'amount', header: 'Amount', type: 'number' }
];

const bookingFormFields: FormFieldDef[] = [
  {
    name: 'expert',
    label: 'Expert',
    type: 'entity',
    endpoint: '/data-admin/experts/',
    queryKey: 'data-admin-experts-picker',
    mapItem: (item) => ({
      id: item.id as string,
      name: (item.user_email || item.id) as string
    })
  },
  {
    name: 'student',
    label: 'Student',
    type: 'entity',
    endpoint: '/admin/students/',
    queryKey: 'admin-students-picker'
  },
  {
    name: 'booking_type',
    label: 'Booking Type',
    type: 'select',
    options: [
      { value: 'call', label: 'Call' },
      { value: 'chat', label: 'Chat' },
      { value: 'in_person', label: 'In Person' }
    ]
  },
  {
    name: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { value: 'pending', label: 'Pending' },
      { value: 'confirmed', label: 'Confirmed' },
      { value: 'completed', label: 'Completed' },
      { value: 'cancelled', label: 'Cancelled' },
      { value: 'no_show', label: 'No Show' }
    ]
  },
  { name: 'scheduled_date', label: 'Scheduled Date', type: 'date' },
  {
    name: 'scheduled_time',
    label: 'Scheduled Time',
    type: 'text',
    placeholder: '14:00'
  },
  { name: 'duration_minutes', label: 'Duration (minutes)', type: 'number' },
  { name: 'notes', label: 'Notes', type: 'textarea' },
  { name: 'amount', label: 'Amount', type: 'number' },
  { name: 'is_paid', label: 'Paid', type: 'boolean' }
];

const bookingFilters: FilterDef[] = [
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { value: 'pending', label: 'Pending' },
      { value: 'confirmed', label: 'Confirmed' },
      { value: 'completed', label: 'Completed' },
      { value: 'cancelled', label: 'Cancelled' }
    ]
  },
  {
    key: 'booking_type',
    label: 'Type',
    type: 'select',
    options: [
      { value: 'call', label: 'Call' },
      { value: 'chat', label: 'Chat' },
      { value: 'in_person', label: 'In Person' }
    ]
  }
];

/* ═══════════════════════════════════════════════
   Tab 6: Reviews
   ═══════════════════════════════════════════════ */

const reviewColumns: ColumnDef[] = [
  { key: 'expert_name', header: 'Expert', type: 'text' },
  { key: 'reviewer_name', header: 'Reviewer', type: 'text' },
  { key: 'rating', header: 'Rating', type: 'number' },
  { key: 'comment', header: 'Comment', type: 'truncate' },
  { key: 'created_at', header: 'Created', type: 'date' }
];

const reviewFormFields: FormFieldDef[] = [
  {
    name: 'expert',
    label: 'Expert',
    type: 'entity',
    endpoint: '/data-admin/experts/',
    queryKey: 'data-admin-experts-picker',
    mapItem: (item) => ({
      id: item.id as string,
      name: (item.user_email || item.id) as string
    })
  },
  {
    name: 'reviewer',
    label: 'Reviewer',
    type: 'entity',
    endpoint: '/admin/students/',
    queryKey: 'admin-students-picker'
  },
  { name: 'rating', label: 'Rating', type: 'number' },
  { name: 'comment', label: 'Comment', type: 'textarea' }
];

/* ═══════════════════════════════════════════════
   Tab 7: Groups
   ═══════════════════════════════════════════════ */

const groupColumns: ColumnDef[] = [
  { key: 'name', header: 'Name', type: 'text' },
  { key: 'expert_name', header: 'Expert', type: 'text' },
  { key: 'subscription_price', header: 'Price', type: 'number' },
  { key: 'member_count', header: 'Members', type: 'number' },
  { key: 'is_active', header: 'Active', type: 'boolean' },
  { key: 'created_at', header: 'Created', type: 'date' }
];

const groupFormFields: FormFieldDef[] = [
  { name: 'name', label: 'Name', type: 'text', required: true },
  {
    name: 'expert',
    label: 'Expert',
    type: 'entity',
    endpoint: '/data-admin/experts/',
    queryKey: 'data-admin-experts-picker',
    mapItem: (item) => ({
      id: item.id as string,
      name: (item.user_email || item.id) as string
    })
  },
  { name: 'description', label: 'Description', type: 'textarea' },
  { name: 'cover_image', label: 'Cover Image', type: 'image' },
  { name: 'subscription_price', label: 'Subscription Price', type: 'number' },
  { name: 'is_active', label: 'Active', type: 'boolean', defaultValue: true }
];

/* ═══════════════════════════════════════════════
   Tab 8: Group Memberships
   ═══════════════════════════════════════════════ */

const membershipColumns: ColumnDef[] = [
  { key: 'group_name', header: 'Group', type: 'text' },
  { key: 'user_email', header: 'User', type: 'text' },
  { key: 'is_active', header: 'Active', type: 'boolean' },
  { key: 'joined_at', header: 'Joined', type: 'date' },
  { key: 'expires_at', header: 'Expires', type: 'date' }
];

const membershipFormFields: FormFieldDef[] = [
  {
    name: 'group',
    label: 'Group',
    type: 'entity',
    endpoint: '/data-admin/expert-groups/',
    queryKey: 'data-admin-expert-groups-picker',
    mapItem: (item) => ({
      id: item.id as string,
      name: (item.name || item.id) as string
    })
  },
  {
    name: 'user',
    label: 'User',
    type: 'entity',
    endpoint: '/admin/students/',
    queryKey: 'admin-students-picker'
  },
  { name: 'is_active', label: 'Active', type: 'boolean', defaultValue: true },
  { name: 'expires_at', label: 'Expires At', type: 'date' }
];

/* ═══════════════════════════════════════════════
   Tab 9: Group Posts
   ═══════════════════════════════════════════════ */

const postColumns: ColumnDef[] = [
  { key: 'group_name', header: 'Group', type: 'text' },
  { key: 'author_email', header: 'Author', type: 'text' },
  { key: 'content', header: 'Content', type: 'truncate' },
  { key: 'created_at', header: 'Created', type: 'date' }
];

const postFormFields: FormFieldDef[] = [
  {
    name: 'group',
    label: 'Group',
    type: 'entity',
    endpoint: '/data-admin/expert-groups/',
    queryKey: 'data-admin-expert-groups-picker',
    mapItem: (item) => ({
      id: item.id as string,
      name: (item.name || item.id) as string
    })
  },
  {
    name: 'author',
    label: 'Author',
    type: 'entity',
    endpoint: '/admin/students/',
    queryKey: 'admin-students-picker'
  },
  { name: 'content', label: 'Content', type: 'textarea', required: true },
  { name: 'image', label: 'Image', type: 'image' }
];

/* ═══════════════════════════════════════════════
   Page Component
   ═══════════════════════════════════════════════ */

export default function ExpertsPage() {
  return (
    <PageContainer>
      <div className='space-y-6'>
        <div>
          <div className='flex items-center gap-2'>
            <UserCog className='text-muted-foreground h-5 w-5' />
            <h1 className='text-2xl font-semibold tracking-tight'>
              Experts &amp; Mentors
            </h1>
          </div>
          <p className='text-muted-foreground mt-1 text-sm'>
            Manage expert profiles, credentials, expertise, and availability
          </p>
        </div>

        <Tabs defaultValue='experts'>
          <TabsList>
            <TabsTrigger value='experts'>Experts</TabsTrigger>
            <TabsTrigger value='credentials'>Credentials</TabsTrigger>
            <TabsTrigger value='expertise'>Expertise</TabsTrigger>
            <TabsTrigger value='availability'>Availability</TabsTrigger>
            <TabsTrigger value='bookings'>Bookings</TabsTrigger>
            <TabsTrigger value='reviews'>Reviews</TabsTrigger>
            <TabsTrigger value='groups'>Groups</TabsTrigger>
            <TabsTrigger value='memberships'>Memberships</TabsTrigger>
            <TabsTrigger value='posts'>Posts</TabsTrigger>
          </TabsList>

          <TabsContent value='experts' className='mt-4'>
            <GenericDataTable
              endpoint='/data-admin/experts/'
              queryKey='data-admin-experts'
              entityName='Expert'
              columns={expertColumns}
              formFields={expertFormFields}
              filters={expertFilters}
              bulkEnabled
            />
          </TabsContent>

          <TabsContent value='credentials' className='mt-4'>
            <GenericDataTable
              endpoint='/data-admin/expert-credentials/'
              queryKey='data-admin-expert-credentials'
              entityName='Credential'
              columns={credentialColumns}
              formFields={credentialFormFields}
              filters={credentialFilters}
            />
          </TabsContent>

          <TabsContent value='expertise' className='mt-4'>
            <GenericDataTable
              endpoint='/data-admin/expert-expertise/'
              queryKey='data-admin-expert-expertise'
              entityName='Expertise'
              columns={expertiseColumns}
              formFields={expertiseFormFields}
            />
          </TabsContent>

          <TabsContent value='availability' className='mt-4'>
            <GenericDataTable
              endpoint='/data-admin/expert-availability/'
              queryKey='data-admin-expert-availability'
              entityName='Availability Slot'
              columns={availabilityColumns}
              formFields={availabilityFormFields}
            />
          </TabsContent>

          <TabsContent value='bookings' className='mt-4'>
            <GenericDataTable
              endpoint='/data-admin/expert-bookings/'
              queryKey='data-admin-expert-bookings'
              entityName='Booking'
              columns={bookingColumns}
              formFields={bookingFormFields}
              filters={bookingFilters}
            />
          </TabsContent>

          <TabsContent value='reviews' className='mt-4'>
            <GenericDataTable
              endpoint='/data-admin/expert-reviews/'
              queryKey='data-admin-expert-reviews'
              entityName='Review'
              columns={reviewColumns}
              formFields={reviewFormFields}
            />
          </TabsContent>

          <TabsContent value='groups' className='mt-4'>
            <GenericDataTable
              endpoint='/data-admin/expert-groups/'
              queryKey='data-admin-expert-groups'
              entityName='Group'
              columns={groupColumns}
              formFields={groupFormFields}
            />
          </TabsContent>

          <TabsContent value='memberships' className='mt-4'>
            <GenericDataTable
              endpoint='/data-admin/expert-group-memberships/'
              queryKey='data-admin-expert-group-memberships'
              entityName='Membership'
              columns={membershipColumns}
              formFields={membershipFormFields}
            />
          </TabsContent>

          <TabsContent value='posts' className='mt-4'>
            <GenericDataTable
              endpoint='/data-admin/expert-group-posts/'
              queryKey='data-admin-expert-group-posts'
              entityName='Post'
              columns={postColumns}
              formFields={postFormFields}
            />
          </TabsContent>
        </Tabs>
      </div>
    </PageContainer>
  );
}
