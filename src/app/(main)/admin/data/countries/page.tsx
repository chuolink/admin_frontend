'use client';

import { useQueryState } from 'nuqs';

import { useState } from 'react';
import PageContainer from '@/components/layout/page-container';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { SectionAnalytics } from '@/features/data-admin/components/SectionAnalytics';
import { useDataStats } from '@/features/data-admin/hooks/use-data-stats';
import { CountryDataTable } from './components/CountryDataTable';
import { CountryFormDialog } from './components/CountryFormDialog';
import { CountryExpenseTable } from './components/CountryExpenseTable';
import { CountryFAQTable } from './components/CountryFAQTable';
import { CountrySubTable } from './components/CountrySubTable';
import type { CountryDetail } from '@/features/data-admin/hooks/use-countries';
import {
  Globe,
  Shield,
  GraduationCap,
  HelpCircle,
  Receipt,
  Plus
} from 'lucide-react';

export default function CountriesDataPage() {
  const { data: stats, isLoading: statsLoading } = useDataStats();
  const [activeTab, setActiveTab] = useQueryState('tab', {
    defaultValue: 'countries'
  });

  // Country form dialog state
  const [countryDialogOpen, setCountryDialogOpen] = useState(false);
  const [editingCountry, setEditingCountry] = useState<CountryDetail | null>(
    null
  );

  // Expense form dialog state
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);

  // FAQ form dialog state
  const [faqDialogOpen, setFaqDialogOpen] = useState(false);

  const handleEditCountry = (country: CountryDetail) => {
    setEditingCountry(country);
    setCountryDialogOpen(true);
  };

  const handleCloseCountryDialog = () => {
    setCountryDialogOpen(false);
    setEditingCountry(null);
  };

  const analyticsStats = stats
    ? [
        {
          label: 'Total Countries',
          value: stats.countries?.total ?? 0,
          icon: Globe,
          color:
            'bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400'
        },
        {
          label: 'Scholarship Only',
          value: stats.countries?.scholarship_only ?? 0,
          icon: Shield,
          color:
            'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
        },
        {
          label: 'With Universities',
          value: stats.countries?.with_universities ?? 0,
          icon: GraduationCap,
          color:
            'bg-violet-100 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400'
        },
        {
          label: 'Total FAQs',
          value: stats.countries?.total_faqs ?? 0,
          icon: HelpCircle,
          color:
            'bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400'
        },
        {
          label: 'Total Expenses',
          value: stats.countries?.total_expenses ?? 0,
          icon: Receipt,
          color:
            'bg-rose-100 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400'
        }
      ]
    : [];

  return (
    <PageContainer className='w-full'>
      <div className='w-full min-w-0 space-y-6'>
        {/* Header */}
        <div>
          <div className='flex items-center gap-2'>
            <Globe className='text-muted-foreground h-5 w-5' />
            <h1 className='text-2xl font-semibold tracking-tight'>Countries</h1>
          </div>
          <p className='text-muted-foreground mt-1 text-sm'>
            Manage countries, benefits, reasons, expenses, FAQs, and
            testimonials
          </p>
        </div>

        {/* Section Analytics */}
        {statsLoading ? (
          <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-5'>
            {Array.from({ length: 5 }).map((_, i) => (
              <Card key={i}>
                <CardContent className='px-6 py-4'>
                  <Skeleton className='h-4 w-24' />
                  <Skeleton className='mt-2 h-8 w-16' />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <SectionAnalytics stats={analyticsStats} />
        )}

        {/* Tabs */}
        <Tabs
          value={activeTab ?? ''}
          onValueChange={setActiveTab}
          className='w-full'
        >
          <div className='flex items-center justify-between'>
            <TabsList className='flex-wrap'>
              <TabsTrigger value='countries'>Countries</TabsTrigger>
              <TabsTrigger value='benefits'>Benefits</TabsTrigger>
              <TabsTrigger value='reasons'>Reasons</TabsTrigger>
              <TabsTrigger value='expenses'>Expenses</TabsTrigger>
              <TabsTrigger value='faqs'>FAQs</TabsTrigger>
              <TabsTrigger value='pictures'>Pictures</TabsTrigger>
              <TabsTrigger value='testimonials'>Testimonials</TabsTrigger>
            </TabsList>

            <div>
              {activeTab === 'countries' && (
                <Button
                  size='sm'
                  onClick={() => {
                    setEditingCountry(null);
                    setCountryDialogOpen(true);
                  }}
                >
                  <Plus className='mr-2 h-4 w-4' />
                  Add Country
                </Button>
              )}
              {activeTab === 'expenses' && (
                <Button size='sm' onClick={() => setExpenseDialogOpen(true)}>
                  <Plus className='mr-2 h-4 w-4' />
                  Add Expense
                </Button>
              )}
              {activeTab === 'faqs' && (
                <Button size='sm' onClick={() => setFaqDialogOpen(true)}>
                  <Plus className='mr-2 h-4 w-4' />
                  Add FAQ
                </Button>
              )}
            </div>
          </div>

          <TabsContent value='countries' className='mt-4'>
            <CountryDataTable onEdit={handleEditCountry} />
          </TabsContent>

          <TabsContent value='benefits' className='mt-4'>
            <CountrySubTable
              endpoint='/data-admin/country-benefits/'
              queryKey='data-admin-country-benefits'
              columns={[
                { key: 'title', label: 'Title' },
                { key: 'description', label: 'Description', truncate: true },
                { key: 'image', label: 'Image URL', truncate: true },
                { key: 'order', label: 'Order' }
              ]}
              formFields={[
                { name: 'title', label: 'Title', type: 'text', required: true },
                {
                  name: 'description',
                  label: 'Description',
                  type: 'textarea',
                  required: true
                },
                { name: 'image', label: 'Image URL', type: 'text' },
                { name: 'order', label: 'Order', type: 'number' }
              ]}
              entityName='Benefit'
            />
          </TabsContent>

          <TabsContent value='reasons' className='mt-4'>
            <CountrySubTable
              endpoint='/data-admin/country-reasons/'
              queryKey='data-admin-country-reasons'
              columns={[
                { key: 'text', label: 'Reason Text' },
                { key: 'order', label: 'Order' }
              ]}
              formFields={[
                {
                  name: 'text',
                  label: 'Reason Text',
                  type: 'text',
                  required: true
                },
                { name: 'order', label: 'Order', type: 'number' }
              ]}
              entityName='Reason'
            />
          </TabsContent>

          <TabsContent value='expenses' className='mt-4'>
            <CountryExpenseTable
              dialogOpen={expenseDialogOpen}
              onDialogOpenChange={setExpenseDialogOpen}
            />
          </TabsContent>

          <TabsContent value='faqs' className='mt-4'>
            <CountryFAQTable
              dialogOpen={faqDialogOpen}
              onDialogOpenChange={setFaqDialogOpen}
            />
          </TabsContent>

          <TabsContent value='pictures' className='mt-4'>
            <CountrySubTable
              endpoint='/data-admin/country-pictures/'
              queryKey='data-admin-country-pictures'
              columns={[
                { key: 'name', label: 'Name' },
                { key: 'image', label: 'Image URL', truncate: true }
              ]}
              formFields={[
                { name: 'name', label: 'Name', type: 'text', required: true },
                {
                  name: 'image',
                  label: 'Image URL',
                  type: 'text',
                  required: true
                }
              ]}
              entityName='Picture'
            />
          </TabsContent>

          <TabsContent value='testimonials' className='mt-4'>
            <CountrySubTable
              endpoint='/data-admin/country-testimonials/'
              queryKey='data-admin-country-testimonials'
              columns={[
                { key: 'name', label: 'Name' },
                { key: 'subtitle', label: 'Subtitle' },
                { key: 'content', label: 'Content', truncate: true },
                { key: 'image', label: 'Image URL', truncate: true }
              ]}
              formFields={[
                { name: 'name', label: 'Name', type: 'text', required: true },
                { name: 'subtitle', label: 'Subtitle', type: 'text' },
                {
                  name: 'content',
                  label: 'Content',
                  type: 'textarea',
                  required: true
                },
                { name: 'image', label: 'Image URL', type: 'text' }
              ]}
              entityName='Testimonial'
            />
          </TabsContent>
        </Tabs>

        {/* Country Form Dialog */}
        <CountryFormDialog
          open={countryDialogOpen}
          onOpenChange={handleCloseCountryDialog}
          country={editingCountry}
        />
      </div>
    </PageContainer>
  );
}
