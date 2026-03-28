// @ts-nocheck
'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Calendar,
  ChevronDown,
  ChevronRight,
  FileText,
  Layers,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  TreePine
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { EntityPicker } from '@/features/data-admin/components/EntityPicker';
import { DeleteConfirmDialog } from '@/features/data-admin/components/DeleteConfirmDialog';
import {
  useCourseYears,
  useCreateCourseYear,
  useUpdateCourseYear,
  useDeleteCourseYear,
  useCourseSemesters,
  useCreateCourseSemester,
  useUpdateCourseSemester,
  useDeleteCourseSemester,
  useCourseModules,
  useCreateCourseModule,
  useUpdateCourseModule,
  useDeleteCourseModule
} from '@/features/data-admin/hooks/use-syllabus';
import type {
  DataCourseYear,
  DataCourseSemester,
  DataCourseModule
} from '@/features/data-admin/types';

// ─── Schemas ────────────────────────────────────────────────────────────────

const courseYearSchema = z.object({
  uni_course: z.string().min(1, 'Course offering is required'),
  year: z.coerce.number().min(1, 'Year is required'),
  objective: z.string().optional().default(''),
  description: z.string().optional().default('')
});

const courseSemesterSchema = z.object({
  course_year: z.string().min(1, 'Course year is required'),
  semister: z.string().min(1, 'Semester is required')
});

const moduleSchema = z.object({
  course_semister: z.string().min(1, 'Course semester is required'),
  title: z.string().min(1, 'Title is required'),
  code: z.string().min(1, 'Code is required'),
  description: z.string().optional().default(''),
  category: z.enum(['ELECTIVE', 'NON ELECTIVE'], {
    required_error: 'Category is required'
  }),
  version: z.string().optional().default('')
});

type CourseYearFormValues = z.infer<typeof courseYearSchema>;
type CourseSemesterFormValues = z.infer<typeof courseSemesterSchema>;
type ModuleFormValues = z.infer<typeof moduleSchema>;

// ─── Module Node ────────────────────────────────────────────────────────────

function ModuleNode({
  module,
  onEdit,
  onDelete
}: {
  module: DataCourseModule;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className='group hover:bg-muted/50 flex items-center gap-2 rounded-md px-2 py-1.5 transition-colors'>
      <FileText className='h-3.5 w-3.5 shrink-0 text-amber-500' />
      <Badge variant='outline' className='shrink-0 font-mono text-xs'>
        {module.code}
      </Badge>
      <span className='min-w-0 truncate text-sm'>{module.title}</span>
      <Badge
        variant={module.category === 'ELECTIVE' ? 'secondary' : 'default'}
        className='shrink-0 text-xs'
      >
        {module.category === 'ELECTIVE' ? 'Elective' : 'Core'}
      </Badge>
      <div className='ml-auto flex shrink-0 gap-0.5 opacity-0 transition-opacity group-hover:opacity-100'>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size='icon'
              variant='ghost'
              className='h-7 w-7'
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
            >
              <Pencil className='h-3.5 w-3.5' />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Edit module</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size='icon'
              variant='ghost'
              className='text-destructive hover:text-destructive h-7 w-7'
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <Trash2 className='h-3.5 w-3.5' />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Delete module</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}

// ─── Semester Node ──────────────────────────────────────────────────────────

function SemesterNode({
  courseSemester,
  modules,
  modulesLoading,
  onEditSemester,
  onDeleteSemester,
  onAddModule,
  onEditModule,
  onDeleteModule
}: {
  courseSemester: DataCourseSemester;
  modules: DataCourseModule[];
  modulesLoading: boolean;
  onEditSemester: () => void;
  onDeleteSemester: () => void;
  onAddModule: () => void;
  onEditModule: (mod: DataCourseModule) => void;
  onDeleteModule: (mod: DataCourseModule) => void;
}) {
  const [expanded, setExpanded] = useState(true);

  return (
    <Collapsible open={expanded} onOpenChange={setExpanded}>
      <div className='ml-3 border-l-2 border-violet-200 pl-3 dark:border-violet-800'>
        <div className='group flex items-center gap-2 rounded-md px-1 py-1.5'>
          <CollapsibleTrigger asChild>
            <Button variant='ghost' size='icon' className='h-6 w-6 shrink-0'>
              {expanded ? (
                <ChevronDown className='h-3.5 w-3.5' />
              ) : (
                <ChevronRight className='h-3.5 w-3.5' />
              )}
            </Button>
          </CollapsibleTrigger>
          <Layers className='h-4 w-4 shrink-0 text-violet-500' />
          <span className='text-sm font-medium'>
            {courseSemester.semister_name ?? 'Semester'}
          </span>
          <span className='text-muted-foreground text-xs'>
            ({modules.length} module{modules.length !== 1 ? 's' : ''})
          </span>
          <div className='ml-auto flex shrink-0 gap-0.5 opacity-0 transition-opacity group-hover:opacity-100'>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size='icon'
                  variant='ghost'
                  className='text-primary h-7 w-7'
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddModule();
                  }}
                >
                  <Plus className='h-3.5 w-3.5' />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Add module</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size='icon'
                  variant='ghost'
                  className='h-7 w-7'
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditSemester();
                  }}
                >
                  <Pencil className='h-3.5 w-3.5' />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Edit semester link</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size='icon'
                  variant='ghost'
                  className='text-destructive hover:text-destructive h-7 w-7'
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteSemester();
                  }}
                >
                  <Trash2 className='h-3.5 w-3.5' />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Remove semester</TooltipContent>
            </Tooltip>
          </div>
        </div>
        <CollapsibleContent>
          <div className='ml-2 space-y-0.5 pb-1'>
            {modulesLoading ? (
              <div className='flex items-center gap-2 px-2 py-2'>
                <Loader2 className='text-muted-foreground h-3.5 w-3.5 animate-spin' />
                <span className='text-muted-foreground text-xs'>
                  Loading modules...
                </span>
              </div>
            ) : modules.length === 0 ? (
              <div className='flex items-center gap-2 px-2 py-2'>
                <span className='text-muted-foreground text-xs italic'>
                  No modules yet
                </span>
                <Button
                  size='sm'
                  variant='ghost'
                  className='text-primary h-6 text-xs'
                  onClick={onAddModule}
                >
                  <Plus className='mr-1 h-3 w-3' />
                  Add module
                </Button>
              </div>
            ) : (
              modules.map((mod) => (
                <ModuleNode
                  key={mod.id}
                  module={mod}
                  onEdit={() => onEditModule(mod)}
                  onDelete={() => onDeleteModule(mod)}
                />
              ))
            )}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

// ─── Year Node ──────────────────────────────────────────────────────────────

function YearNode({
  year,
  offeringId,
  onEditYear,
  onDeleteYear,
  onAddSemester,
  onEditSemester,
  onDeleteSemester,
  onAddModule,
  onEditModule,
  onDeleteModule
}: {
  year: DataCourseYear;
  offeringId: string;
  onEditYear: () => void;
  onDeleteYear: () => void;
  onAddSemester: (yearId: string) => void;
  onEditSemester: (cs: DataCourseSemester) => void;
  onDeleteSemester: (cs: DataCourseSemester) => void;
  onAddModule: (courseSemesterId: string) => void;
  onEditModule: (mod: DataCourseModule) => void;
  onDeleteModule: (mod: DataCourseModule) => void;
}) {
  const [expanded, setExpanded] = useState(true);

  // Fetch course semesters for this year
  const { data: semestersData, isLoading: semestersLoading } =
    useCourseSemesters({
      course_year: year.id,
      page_size: '100'
    });

  const courseSemesters: DataCourseSemester[] = semestersData?.results ?? [];

  return (
    <Collapsible open={expanded} onOpenChange={setExpanded}>
      <div className='border-primary/30 ml-2 border-l-2 pl-3'>
        <div className='group flex items-center gap-2 rounded-md px-1 py-2'>
          <CollapsibleTrigger asChild>
            <Button variant='ghost' size='icon' className='h-7 w-7 shrink-0'>
              {expanded ? (
                <ChevronDown className='h-4 w-4' />
              ) : (
                <ChevronRight className='h-4 w-4' />
              )}
            </Button>
          </CollapsibleTrigger>
          <Calendar className='h-4 w-4 shrink-0 text-blue-500' />
          <span className='font-medium'>Year {year.year}</span>
          {year.objective && (
            <span className='text-muted-foreground max-w-[300px] truncate text-xs'>
              &mdash; {year.objective}
            </span>
          )}
          <span className='text-muted-foreground text-xs'>
            ({courseSemesters.length} semester
            {courseSemesters.length !== 1 ? 's' : ''})
          </span>
          <div className='ml-auto flex shrink-0 gap-0.5 opacity-0 transition-opacity group-hover:opacity-100'>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size='icon'
                  variant='ghost'
                  className='text-primary h-7 w-7'
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddSemester(year.id);
                  }}
                >
                  <Plus className='h-3.5 w-3.5' />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Add semester to year</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size='icon'
                  variant='ghost'
                  className='h-7 w-7'
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditYear();
                  }}
                >
                  <Pencil className='h-3.5 w-3.5' />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Edit year</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size='icon'
                  variant='ghost'
                  className='text-destructive hover:text-destructive h-7 w-7'
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteYear();
                  }}
                >
                  <Trash2 className='h-3.5 w-3.5' />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Delete year</TooltipContent>
            </Tooltip>
          </div>
        </div>
        <CollapsibleContent>
          <div className='space-y-1 pb-2'>
            {semestersLoading ? (
              <div className='ml-3 flex items-center gap-2 px-2 py-2'>
                <Loader2 className='text-muted-foreground h-3.5 w-3.5 animate-spin' />
                <span className='text-muted-foreground text-xs'>
                  Loading semesters...
                </span>
              </div>
            ) : courseSemesters.length === 0 ? (
              <div className='ml-3 flex items-center gap-2 px-2 py-2'>
                <span className='text-muted-foreground text-xs italic'>
                  No semesters yet
                </span>
                <Button
                  size='sm'
                  variant='ghost'
                  className='text-primary h-6 text-xs'
                  onClick={() => onAddSemester(year.id)}
                >
                  <Plus className='mr-1 h-3 w-3' />
                  Add semester
                </Button>
              </div>
            ) : (
              courseSemesters.map((cs) => (
                <SemesterNodeWithModules
                  key={cs.id}
                  courseSemester={cs}
                  onEditSemester={() => onEditSemester(cs)}
                  onDeleteSemester={() => onDeleteSemester(cs)}
                  onAddModule={() => onAddModule(cs.id)}
                  onEditModule={onEditModule}
                  onDeleteModule={onDeleteModule}
                />
              ))
            )}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

// Wrapper that fetches modules for a semester
function SemesterNodeWithModules({
  courseSemester,
  onEditSemester,
  onDeleteSemester,
  onAddModule,
  onEditModule,
  onDeleteModule
}: {
  courseSemester: DataCourseSemester;
  onEditSemester: () => void;
  onDeleteSemester: () => void;
  onAddModule: () => void;
  onEditModule: (mod: DataCourseModule) => void;
  onDeleteModule: (mod: DataCourseModule) => void;
}) {
  const { data: modulesData, isLoading: modulesLoading } = useCourseModules({
    course_semister: courseSemester.id,
    page_size: '100'
  });

  const modules: DataCourseModule[] = modulesData?.results ?? [];

  return (
    <SemesterNode
      courseSemester={courseSemester}
      modules={modules}
      modulesLoading={modulesLoading}
      onEditSemester={onEditSemester}
      onDeleteSemester={onDeleteSemester}
      onAddModule={onAddModule}
      onEditModule={onEditModule}
      onDeleteModule={onDeleteModule}
    />
  );
}

// ─── Course Year Dialog ─────────────────────────────────────────────────────

function CourseYearDialog({
  open,
  onOpenChange,
  offeringId,
  editing
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  offeringId: string;
  editing: DataCourseYear | null;
}) {
  const createMutation = useCreateCourseYear();
  const updateMutation = useUpdateCourseYear();
  const isEdit = !!editing;

  const form = useForm<CourseYearFormValues>({
    resolver: zodResolver(courseYearSchema),
    defaultValues: {
      uni_course: offeringId,
      year: 1,
      objective: '',
      description: ''
    }
  });

  useEffect(() => {
    if (open) {
      if (editing) {
        form.reset({
          uni_course: editing.uni_course,
          year: editing.year,
          objective: editing.objective ?? '',
          description: editing.description ?? ''
        });
      } else {
        form.reset({
          uni_course: offeringId,
          year: 1,
          objective: '',
          description: ''
        });
      }
    }
  }, [open, editing, offeringId, form]);

  const handleClose = () => {
    onOpenChange(false);
  };

  const onSubmit = (values: CourseYearFormValues) => {
    if (isEdit && editing) {
      updateMutation.mutate(
        { id: editing.id, data: values },
        { onSuccess: handleClose }
      );
    } else {
      createMutation.mutate(values, { onSuccess: handleClose });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className='max-w-lg'>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Edit Course Year' : 'Add Course Year'}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='uni_course'
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Course Offering</FormLabel>
                  <FormControl>
                    <EntityPicker
                      endpoint='/data-admin/course-offerings/'
                      queryKey='data-admin-course-offerings'
                      mapItem={(item) => ({
                        id: item.id as string,
                        name: item.name as string
                      })}
                      value={field.value || null}
                      onChange={(id) => field.onChange(id ?? '')}
                      placeholder='Select course offering...'
                      disabled
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='year'
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Year Number</FormLabel>
                  <FormControl>
                    <Input type='number' min={1} max={10} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='objective'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Objective</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='Year objective...'
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='description'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='Year description...'
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className='flex justify-end gap-2 pt-2'>
              <Button
                type='button'
                variant='outline'
                onClick={handleClose}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type='submit' disabled={isPending}>
                {isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                {isEdit ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Course Semester Dialog ─────────────────────────────────────────────────

function CourseSemesterDialog({
  open,
  onOpenChange,
  courseYearId,
  editing
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseYearId: string;
  editing: DataCourseSemester | null;
}) {
  const createMutation = useCreateCourseSemester();
  const updateMutation = useUpdateCourseSemester();
  const isEdit = !!editing;

  const form = useForm<CourseSemesterFormValues>({
    resolver: zodResolver(courseSemesterSchema),
    defaultValues: { course_year: courseYearId, semister: '' }
  });

  useEffect(() => {
    if (open) {
      if (editing) {
        form.reset({
          course_year: editing.course_year,
          semister: editing.semister
        });
      } else {
        form.reset({ course_year: courseYearId, semister: '' });
      }
    }
  }, [open, editing, courseYearId, form]);

  const handleClose = () => {
    onOpenChange(false);
  };

  const onSubmit = (values: CourseSemesterFormValues) => {
    if (isEdit && editing) {
      updateMutation.mutate(
        { id: editing.id, data: values },
        { onSuccess: handleClose }
      );
    } else {
      createMutation.mutate(values, { onSuccess: handleClose });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className='max-w-lg'>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Edit Course Semester' : 'Add Semester to Year'}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='course_year'
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Course Year</FormLabel>
                  <FormControl>
                    <EntityPicker
                      endpoint='/data-admin/course-years/'
                      queryKey='data-admin-course-years'
                      mapItem={(item) => ({
                        id: item.id as string,
                        name: `${(item as Record<string, unknown>).uni_course_name ?? 'Offering'} - Year ${(item as Record<string, unknown>).year ?? '?'}`
                      })}
                      value={field.value || null}
                      onChange={(id) => field.onChange(id ?? '')}
                      placeholder='Select course year...'
                      disabled={!isEdit}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='semister'
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Semester</FormLabel>
                  <FormControl>
                    <EntityPicker
                      endpoint='/data-admin/semesters/'
                      queryKey='data-admin-semesters'
                      mapItem={(item) => ({
                        id: item.id as string,
                        name: item.name as string,
                        subtitle: `${(item as Record<string, unknown>).start_month ?? ''} - ${(item as Record<string, unknown>).end_month ?? ''}`
                      })}
                      value={field.value || null}
                      onChange={(id) => field.onChange(id ?? '')}
                      placeholder='Select semester definition...'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className='flex justify-end gap-2 pt-2'>
              <Button
                type='button'
                variant='outline'
                onClick={handleClose}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type='submit' disabled={isPending}>
                {isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                {isEdit ? 'Update' : 'Add'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Module Dialog ──────────────────────────────────────────────────────────

function ModuleDialog({
  open,
  onOpenChange,
  courseSemesterId,
  editing
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseSemesterId: string;
  editing: DataCourseModule | null;
}) {
  const createMutation = useCreateCourseModule();
  const updateMutation = useUpdateCourseModule();
  const isEdit = !!editing;

  const form = useForm<ModuleFormValues>({
    resolver: zodResolver(moduleSchema),
    defaultValues: {
      course_semister: courseSemesterId,
      title: '',
      code: '',
      description: '',
      category: 'NON ELECTIVE',
      version: ''
    }
  });

  useEffect(() => {
    if (open) {
      if (editing) {
        form.reset({
          course_semister: editing.course_semister,
          title: editing.title,
          code: editing.code,
          description: editing.description ?? '',
          category: editing.category,
          version: editing.version ?? ''
        });
      } else {
        form.reset({
          course_semister: courseSemesterId,
          title: '',
          code: '',
          description: '',
          category: 'NON ELECTIVE',
          version: ''
        });
      }
    }
  }, [open, editing, courseSemesterId, form]);

  const handleClose = () => {
    onOpenChange(false);
  };

  const onSubmit = (values: ModuleFormValues) => {
    if (isEdit && editing) {
      updateMutation.mutate(
        { id: editing.id, data: values },
        { onSuccess: handleClose }
      );
    } else {
      createMutation.mutate(values, { onSuccess: handleClose });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className='max-w-lg'>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Module' : 'Add Module'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='course_semister'
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Course Semester</FormLabel>
                  <FormControl>
                    <EntityPicker
                      endpoint='/data-admin/course-semesters/'
                      queryKey='data-admin-course-semesters'
                      mapItem={(item) => ({
                        id: item.id as string,
                        name: `${(item as Record<string, unknown>).course_year_name ?? 'Year'} - ${(item as Record<string, unknown>).semister_name ?? 'Semester'}`
                      })}
                      value={field.value || null}
                      onChange={(id) => field.onChange(id ?? '')}
                      placeholder='Select course semester...'
                      disabled={!isEdit}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className='grid grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='title'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Title</FormLabel>
                    <FormControl>
                      <Input placeholder='e.g., Data Structures' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='code'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Code</FormLabel>
                    <FormControl>
                      <Input placeholder='e.g., CS201' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className='grid grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='category'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select category' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='ELECTIVE'>Elective</SelectItem>
                        <SelectItem value='NON ELECTIVE'>
                          Non-Elective (Core)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='version'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Version</FormLabel>
                    <FormControl>
                      <Input placeholder='e.g., 1.0' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name='description'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='Module description...'
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className='flex justify-end gap-2 pt-2'>
              <Button
                type='button'
                variant='outline'
                onClick={handleClose}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type='submit' disabled={isPending}>
                {isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                {isEdit ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Tree View ─────────────────────────────────────────────────────────

export function SyllabusTreeView() {
  const [selectedOffering, setSelectedOffering] = useState<string | null>(null);

  // Dialog states
  const [yearDialogOpen, setYearDialogOpen] = useState(false);
  const [editingYear, setEditingYear] = useState<DataCourseYear | null>(null);

  const [semesterDialogOpen, setSemesterDialogOpen] = useState(false);
  const [editingSemester, setEditingSemester] =
    useState<DataCourseSemester | null>(null);
  const [addSemesterYearId, setAddSemesterYearId] = useState('');

  const [moduleDialogOpen, setModuleDialogOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<DataCourseModule | null>(
    null
  );
  const [addModuleCSId, setAddModuleCSId] = useState('');

  // Delete states
  const [deleteYearOpen, setDeleteYearOpen] = useState(false);
  const [toDeleteYear, setToDeleteYear] = useState<DataCourseYear | null>(null);
  const [deleteSemesterOpen, setDeleteSemesterOpen] = useState(false);
  const [toDeleteSemester, setToDeleteSemester] =
    useState<DataCourseSemester | null>(null);
  const [deleteModuleOpen, setDeleteModuleOpen] = useState(false);
  const [toDeleteModule, setToDeleteModule] = useState<DataCourseModule | null>(
    null
  );

  // Mutations
  const deleteYearMutation = useDeleteCourseYear();
  const deleteSemesterMutation = useDeleteCourseSemester();
  const deleteModuleMutation = useDeleteCourseModule();

  // Fetch years for selected offering
  const { data: yearsData, isLoading: yearsLoading } = useCourseYears(
    selectedOffering
      ? { uni_course: selectedOffering, page_size: '100', ordering: 'year' }
      : undefined
  );

  const years: DataCourseYear[] = selectedOffering
    ? (yearsData?.results ?? [])
    : [];

  // ─── Year handlers
  const handleAddYear = () => {
    setEditingYear(null);
    setYearDialogOpen(true);
  };

  const handleEditYear = (year: DataCourseYear) => {
    setEditingYear(year);
    setYearDialogOpen(true);
  };

  const handleDeleteYear = (year: DataCourseYear) => {
    setToDeleteYear(year);
    setDeleteYearOpen(true);
  };

  // ─── Semester handlers
  const handleAddSemester = (yearId: string) => {
    setEditingSemester(null);
    setAddSemesterYearId(yearId);
    setSemesterDialogOpen(true);
  };

  const handleEditSemester = (cs: DataCourseSemester) => {
    setEditingSemester(cs);
    setAddSemesterYearId(cs.course_year);
    setSemesterDialogOpen(true);
  };

  const handleDeleteSemester = (cs: DataCourseSemester) => {
    setToDeleteSemester(cs);
    setDeleteSemesterOpen(true);
  };

  // ─── Module handlers
  const handleAddModule = (courseSemesterId: string) => {
    setEditingModule(null);
    setAddModuleCSId(courseSemesterId);
    setModuleDialogOpen(true);
  };

  const handleEditModule = (mod: DataCourseModule) => {
    setEditingModule(mod);
    setAddModuleCSId(mod.course_semister);
    setModuleDialogOpen(true);
  };

  const handleDeleteModule = (mod: DataCourseModule) => {
    setToDeleteModule(mod);
    setDeleteModuleOpen(true);
  };

  return (
    <div className='space-y-4'>
      {/* Course offering picker */}
      <div className='flex items-center gap-3'>
        <div className='w-full max-w-md'>
          <EntityPicker
            endpoint='/data-admin/course-offerings/'
            queryKey='data-admin-course-offerings'
            mapItem={(item) => ({
              id: item.id as string,
              name: item.name as string,
              subtitle: item.university_name as string | undefined
            })}
            value={selectedOffering}
            onChange={setSelectedOffering}
            placeholder='Search and select a course offering...'
          />
        </div>
        {selectedOffering && (
          <Button size='sm' onClick={handleAddYear}>
            <Plus className='mr-2 h-4 w-4' />
            Add Year
          </Button>
        )}
      </div>

      {/* Tree content */}
      {!selectedOffering ? (
        <div className='flex flex-col items-center justify-center rounded-lg border border-dashed py-16'>
          <TreePine className='text-muted-foreground/40 h-12 w-12' />
          <p className='text-muted-foreground mt-4 text-sm font-medium'>
            Select a course offering to view its syllabus
          </p>
          <p className='text-muted-foreground/70 mt-1 text-xs'>
            Search for a course + university combination above
          </p>
        </div>
      ) : yearsLoading ? (
        <div className='space-y-3 py-4'>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className='ml-2 space-y-2'>
              <Skeleton className='h-8 w-[300px]' />
              <div className='ml-8 space-y-1.5'>
                <Skeleton className='h-6 w-[250px]' />
                <Skeleton className='h-6 w-[200px]' />
              </div>
            </div>
          ))}
        </div>
      ) : years.length === 0 ? (
        <div className='flex flex-col items-center justify-center rounded-lg border border-dashed py-12'>
          <Calendar className='text-muted-foreground/40 h-10 w-10' />
          <p className='text-muted-foreground mt-3 text-sm font-medium'>
            No years defined for this offering
          </p>
          <Button
            size='sm'
            variant='outline'
            className='mt-3'
            onClick={handleAddYear}
          >
            <Plus className='mr-2 h-4 w-4' />
            Add Year
          </Button>
        </div>
      ) : (
        <div className='space-y-1 rounded-lg border p-4'>
          {years.map((year) => (
            <YearNode
              key={year.id}
              year={year}
              offeringId={selectedOffering}
              onEditYear={() => handleEditYear(year)}
              onDeleteYear={() => handleDeleteYear(year)}
              onAddSemester={handleAddSemester}
              onEditSemester={handleEditSemester}
              onDeleteSemester={handleDeleteSemester}
              onAddModule={handleAddModule}
              onEditModule={handleEditModule}
              onDeleteModule={handleDeleteModule}
            />
          ))}
          <div className='mt-2 ml-2 pl-3'>
            <Button
              size='sm'
              variant='ghost'
              className='text-primary'
              onClick={handleAddYear}
            >
              <Plus className='mr-2 h-4 w-4' />
              Add Year
            </Button>
          </div>
        </div>
      )}

      {/* Dialogs */}
      <CourseYearDialog
        open={yearDialogOpen}
        onOpenChange={(open) => {
          setYearDialogOpen(open);
          if (!open) setEditingYear(null);
        }}
        offeringId={selectedOffering ?? ''}
        editing={editingYear}
      />

      <CourseSemesterDialog
        open={semesterDialogOpen}
        onOpenChange={(open) => {
          setSemesterDialogOpen(open);
          if (!open) setEditingSemester(null);
        }}
        courseYearId={addSemesterYearId}
        editing={editingSemester}
      />

      <ModuleDialog
        open={moduleDialogOpen}
        onOpenChange={(open) => {
          setModuleDialogOpen(open);
          if (!open) setEditingModule(null);
        }}
        courseSemesterId={addModuleCSId}
        editing={editingModule}
      />

      {/* Delete confirmations */}
      <DeleteConfirmDialog
        open={deleteYearOpen}
        onOpenChange={setDeleteYearOpen}
        title='Delete Course Year'
        description={`Are you sure you want to delete Year ${toDeleteYear?.year}? This will also remove all linked semesters and modules. This action cannot be undone.`}
        onConfirm={() => {
          if (!toDeleteYear) return;
          deleteYearMutation.mutate(toDeleteYear.id, {
            onSuccess: () => {
              setDeleteYearOpen(false);
              setToDeleteYear(null);
            }
          });
        }}
        isPending={deleteYearMutation.isPending}
      />

      <DeleteConfirmDialog
        open={deleteSemesterOpen}
        onOpenChange={setDeleteSemesterOpen}
        title='Remove Semester'
        description={`Are you sure you want to remove "${toDeleteSemester?.semister_name ?? 'this semester'}" from this year? This will also remove all modules under it. This action cannot be undone.`}
        onConfirm={() => {
          if (!toDeleteSemester) return;
          deleteSemesterMutation.mutate(toDeleteSemester.id, {
            onSuccess: () => {
              setDeleteSemesterOpen(false);
              setToDeleteSemester(null);
            }
          });
        }}
        isPending={deleteSemesterMutation.isPending}
      />

      <DeleteConfirmDialog
        open={deleteModuleOpen}
        onOpenChange={setDeleteModuleOpen}
        title='Delete Module'
        description={`Are you sure you want to delete "${toDeleteModule?.title}"? This action cannot be undone.`}
        onConfirm={() => {
          if (!toDeleteModule) return;
          deleteModuleMutation.mutate(toDeleteModule.id, {
            onSuccess: () => {
              setDeleteModuleOpen(false);
              setToDeleteModule(null);
            }
          });
        }}
        isPending={deleteModuleMutation.isPending}
      />
    </div>
  );
}
