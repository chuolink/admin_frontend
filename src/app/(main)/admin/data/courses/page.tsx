'use client';

import { useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  XCircle,
  Layers,
  AlertTriangle,
  Plus
} from 'lucide-react';
import PageContainer from '@/components/layout/page-container';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { SectionAnalytics } from '@/features/data-admin/components/SectionAnalytics';
import { useDataStats } from '@/features/data-admin/hooks/use-data-stats';
import { Skeleton } from '@/components/ui/skeleton';
import CourseDataTable from './components/CourseDataTable';
import DisciplineDataTable from './components/DisciplineDataTable';
import { CourseFormDialog } from './components/CourseFormDialog';
import { DisciplineFormDialog } from './components/DisciplineFormDialog';
import { CourseTrendTable } from './components/CourseTrendTable';
import { CoursePictureTable } from './components/CoursePictureTable';
import { CourseVideoTable } from './components/CourseVideoTable';

export default function CoursesPage() {
  const { data: stats, isLoading: statsLoading } = useDataStats();
  const [courseDialogOpen, setCourseDialogOpen] = useState(false);
  const [disciplineDialogOpen, setDisciplineDialogOpen] = useState(false);
  const [trendDialogOpen, setTrendDialogOpen] = useState(false);
  const [pictureDialogOpen, setPictureDialogOpen] = useState(false);
  const [videoDialogOpen, setVideoDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('courses');

  const courseStats = stats?.courses;

  const analyticsItems = [
    {
      label: 'Total Courses',
      value: courseStats?.total ?? 0,
      icon: BookOpen,
      color: 'bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400'
    },
    {
      label: 'Active',
      value: courseStats?.active ?? 0,
      icon: CheckCircle2,
      color:
        'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
    },
    {
      label: 'Inactive',
      value: courseStats?.inactive ?? 0,
      icon: XCircle,
      color: 'bg-gray-100 text-gray-600 dark:bg-gray-500/10 dark:text-gray-400'
    },
    {
      label: 'Disciplines',
      value: courseStats?.disciplines ?? 0,
      icon: Layers,
      color:
        'bg-violet-100 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400'
    },
    {
      label: 'Without Discipline',
      value: courseStats?.without_discipline ?? 0,
      icon: AlertTriangle,
      color:
        'bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400'
    }
  ];

  return (
    <PageContainer className='w-full'>
      <div className='w-full min-w-0 space-y-6'>
        {/* Header */}
        <div>
          <div className='flex items-center gap-2'>
            <BookOpen className='text-muted-foreground h-5 w-5' />
            <h1 className='text-2xl font-semibold tracking-tight'>Courses</h1>
          </div>
          <p className='text-muted-foreground mt-1 text-sm'>
            Manage courses, disciplines, trends, and media
          </p>
        </div>

        {/* Stats */}
        {statsLoading ? (
          <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-5'>
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className='h-[88px]' />
            ))}
          </div>
        ) : (
          <SectionAnalytics stats={analyticsItems} />
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className='flex items-center justify-between'>
            <TabsList>
              <TabsTrigger value='courses'>Courses</TabsTrigger>
              <TabsTrigger value='disciplines'>Disciplines</TabsTrigger>
              <TabsTrigger value='trends'>Trends</TabsTrigger>
              <TabsTrigger value='pictures'>Pictures</TabsTrigger>
              <TabsTrigger value='videos'>Videos</TabsTrigger>
            </TabsList>
            <div>
              {activeTab === 'courses' && (
                <Button size='sm' onClick={() => setCourseDialogOpen(true)}>
                  <Plus className='mr-2 h-4 w-4' />
                  Add Course
                </Button>
              )}
              {activeTab === 'disciplines' && (
                <Button size='sm' onClick={() => setDisciplineDialogOpen(true)}>
                  <Plus className='mr-2 h-4 w-4' />
                  Add Discipline
                </Button>
              )}
              {activeTab === 'trends' && (
                <Button size='sm' onClick={() => setTrendDialogOpen(true)}>
                  <Plus className='mr-2 h-4 w-4' />
                  Add Trend
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
            </div>
          </div>

          <TabsContent value='courses' className='mt-4'>
            <CourseDataTable />
          </TabsContent>

          <TabsContent value='disciplines' className='mt-4'>
            <DisciplineDataTable />
          </TabsContent>

          <TabsContent value='trends' className='mt-4'>
            <CourseTrendTable
              dialogOpen={trendDialogOpen}
              onDialogOpenChange={setTrendDialogOpen}
            />
          </TabsContent>

          <TabsContent value='pictures' className='mt-4'>
            <CoursePictureTable
              dialogOpen={pictureDialogOpen}
              onDialogOpenChange={setPictureDialogOpen}
            />
          </TabsContent>

          <TabsContent value='videos' className='mt-4'>
            <CourseVideoTable
              dialogOpen={videoDialogOpen}
              onDialogOpenChange={setVideoDialogOpen}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialogs */}
      <CourseFormDialog
        open={courseDialogOpen}
        onOpenChange={setCourseDialogOpen}
        mode='create'
      />
      <DisciplineFormDialog
        open={disciplineDialogOpen}
        onOpenChange={setDisciplineDialogOpen}
        mode='create'
      />
    </PageContainer>
  );
}
