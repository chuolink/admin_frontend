'use client';

import { useState } from 'react';
import PageContainer from '@/components/layout/page-container';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { SectionAnalytics } from '@/features/data-admin/components/SectionAnalytics';
import { useDataStats } from '@/features/data-admin/hooks/use-data-stats';
import { UniversityDataTable } from './components/UniversityDataTable';
import { UniversityFormDialog } from './components/UniversityFormDialog';
import { UniversityExpenseTable } from './components/UniversityExpenseTable';
import { UniversityPictureTable } from './components/UniversityPictureTable';
import { UniversityVideoTable } from './components/UniversityVideoTable';
import { UniversityStudyReasonTable } from './components/UniversityStudyReasonTable';
import type { DataUniversity } from '@/features/data-admin/types';
import {
  GraduationCap,
  Building2,
  Landmark,
  Trophy,
  BookOpen,
  Plus
} from 'lucide-react';

export default function UniversitiesDataPage() {
  const { data: stats, isLoading: statsLoading } = useDataStats();
  const [activeTab, setActiveTab] = useState('universities');

  // University form dialog state
  const [universityDialogOpen, setUniversityDialogOpen] = useState(false);
  const [editingUniversity, setEditingUniversity] =
    useState<DataUniversity | null>(null);

  // Sub-model dialog states
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);
  const [pictureDialogOpen, setPictureDialogOpen] = useState(false);
  const [videoDialogOpen, setVideoDialogOpen] = useState(false);
  const [studyReasonDialogOpen, setStudyReasonDialogOpen] = useState(false);

  const handleEditUniversity = (university: DataUniversity) => {
    setEditingUniversity(university);
    setUniversityDialogOpen(true);
  };

  const handleCloseUniversityDialog = () => {
    setUniversityDialogOpen(false);
    setEditingUniversity(null);
  };

  const uniStats = stats?.universities;

  const analyticsStats = uniStats
    ? [
        {
          label: 'Total Universities',
          value: uniStats.total ?? 0,
          icon: GraduationCap,
          color:
            'bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400'
        },
        {
          label: 'Public',
          value: uniStats.by_category?.PUBLIC ?? 0,
          icon: Landmark,
          color:
            'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
        },
        {
          label: 'Private',
          value: uniStats.by_category?.PRIVATE ?? 0,
          icon: Building2,
          color:
            'bg-violet-100 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400'
        },
        {
          label: 'With Rankings',
          value: uniStats.with_ranking ?? 0,
          icon: Trophy,
          color:
            'bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400'
        },
        {
          label: 'Avg Courses',
          value:
            typeof uniStats.avg_courses_per_uni === 'number'
              ? uniStats.avg_courses_per_uni.toFixed(1)
              : '0',
          icon: BookOpen,
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
            <GraduationCap className='text-muted-foreground h-5 w-5' />
            <h1 className='text-2xl font-semibold tracking-tight'>
              Universities
            </h1>
          </div>
          <p className='text-muted-foreground mt-1 text-sm'>
            Manage universities, their rankings, expenses, media, and study
            reasons
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
        <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
          <div className='flex items-center justify-between'>
            <TabsList>
              <TabsTrigger value='universities'>Universities</TabsTrigger>
              <TabsTrigger value='expenses'>Expenses</TabsTrigger>
              <TabsTrigger value='pictures'>Pictures</TabsTrigger>
              <TabsTrigger value='videos'>Videos</TabsTrigger>
              <TabsTrigger value='study-reasons'>Study Reasons</TabsTrigger>
            </TabsList>

            <div>
              {activeTab === 'universities' && (
                <Button
                  size='sm'
                  onClick={() => {
                    setEditingUniversity(null);
                    setUniversityDialogOpen(true);
                  }}
                >
                  <Plus className='mr-2 h-4 w-4' />
                  Add University
                </Button>
              )}
              {activeTab === 'expenses' && (
                <Button size='sm' onClick={() => setExpenseDialogOpen(true)}>
                  <Plus className='mr-2 h-4 w-4' />
                  Add Expense
                </Button>
              )}
              {activeTab === 'pictures' && (
                <Button size='sm' onClick={() => setPictureDialogOpen(true)}>
                  <Plus className='mr-2 h-4 w-4' />
                  Add Picture
                </Button>
              )}
              {activeTab === 'videos' && (
                <Button size='sm' onClick={() => setVideoDialogOpen(true)}>
                  <Plus className='mr-2 h-4 w-4' />
                  Add Video
                </Button>
              )}
              {activeTab === 'study-reasons' && (
                <Button
                  size='sm'
                  onClick={() => setStudyReasonDialogOpen(true)}
                >
                  <Plus className='mr-2 h-4 w-4' />
                  Add Study Reason
                </Button>
              )}
            </div>
          </div>

          <TabsContent value='universities' className='mt-4'>
            <UniversityDataTable onEdit={handleEditUniversity} />
          </TabsContent>

          <TabsContent value='expenses' className='mt-4'>
            <UniversityExpenseTable
              dialogOpen={expenseDialogOpen}
              onDialogOpenChange={setExpenseDialogOpen}
            />
          </TabsContent>

          <TabsContent value='pictures' className='mt-4'>
            <UniversityPictureTable
              dialogOpen={pictureDialogOpen}
              onDialogOpenChange={setPictureDialogOpen}
            />
          </TabsContent>

          <TabsContent value='videos' className='mt-4'>
            <UniversityVideoTable
              dialogOpen={videoDialogOpen}
              onDialogOpenChange={setVideoDialogOpen}
            />
          </TabsContent>

          <TabsContent value='study-reasons' className='mt-4'>
            <UniversityStudyReasonTable
              dialogOpen={studyReasonDialogOpen}
              onDialogOpenChange={setStudyReasonDialogOpen}
            />
          </TabsContent>
        </Tabs>

        {/* University Form Dialog */}
        <UniversityFormDialog
          open={universityDialogOpen}
          onOpenChange={handleCloseUniversityDialog}
          university={editingUniversity}
        />
      </div>
    </PageContainer>
  );
}
