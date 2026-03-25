'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
  type SortingState
} from '@tanstack/react-table';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  BookOpen,
  Calendar,
  Layers,
  LayoutGrid,
  Loader2,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2
} from 'lucide-react';
import PageContainer from '@/components/layout/page-container';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { DataTablePagination } from '@/components/data-table/data-table-pagination';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { SectionAnalytics } from '@/features/data-admin/components/SectionAnalytics';
import { DeleteConfirmDialog } from '@/features/data-admin/components/DeleteConfirmDialog';
import { EntityPicker } from '@/features/data-admin/components/EntityPicker';
import {
  useCourseYears,
  useCreateCourseYear,
  useUpdateCourseYear,
  useDeleteCourseYear,
  useSemesters,
  useCreateSemester,
  useUpdateSemester,
  useDeleteSemester,
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
  DataSemester,
  DataCourseSemester,
  DataCourseModule
} from '@/features/data-admin/types';

// ─── Course Years Tab ────────────────────────────────────────────────────────

const courseYearSchema = z.object({
  uni_course: z.string().min(1, 'Course offering is required'),
  year: z.coerce.number().min(1, 'Year is required'),
  objective: z.string().optional().default(''),
  description: z.string().optional().default('')
});

type CourseYearFormValues = z.infer<typeof courseYearSchema>;

function CourseYearsTab({
  dialogOpen,
  onDialogOpenChange
}: {
  dialogOpen: boolean;
  onDialogOpenChange: (open: boolean) => void;
}) {
  const [offeringFilter, setOfferingFilter] = useState<string | null>(null);
  const { data, isLoading } = useCourseYears(
    offeringFilter ? { uni_course: offeringFilter } : undefined
  );
  const createMutation = useCreateCourseYear();
  const updateMutation = useUpdateCourseYear();
  const deleteMutation = useDeleteCourseYear();

  const [sorting, setSorting] = useState<SortingState>([]);
  const [editing, setEditing] = useState<DataCourseYear | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [toDelete, setToDelete] = useState<DataCourseYear | null>(null);

  const isEdit = !!editing;

  const form = useForm<CourseYearFormValues>({
    resolver: zodResolver(courseYearSchema),
    defaultValues: { uni_course: '', year: 1, objective: '', description: '' }
  });

  useEffect(() => {
    if (dialogOpen && !editing) {
      form.reset({
        uni_course: offeringFilter ?? '',
        year: 1,
        objective: '',
        description: ''
      });
    }
  }, [dialogOpen, editing, form, offeringFilter]);

  const handleEdit = (item: DataCourseYear) => {
    setEditing(item);
    form.reset({
      uni_course: item.uni_course,
      year: item.year,
      objective: item.objective ?? '',
      description: item.description ?? ''
    });
    onDialogOpenChange(true);
  };

  const handleCloseDialog = () => {
    onDialogOpenChange(false);
    setEditing(null);
  };

  const onSubmit = (values: CourseYearFormValues) => {
    if (isEdit && editing) {
      updateMutation.mutate(
        { id: editing.id, data: values },
        { onSuccess: handleCloseDialog }
      );
    } else {
      createMutation.mutate(values, { onSuccess: handleCloseDialog });
    }
  };

  const columns = useMemo<ColumnDef<DataCourseYear>[]>(
    () => [
      {
        accessorKey: 'uni_course_name',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Course Offering' />
        ),
        cell: ({ row }) => (
          <span className='font-medium'>
            {row.original.uni_course_name ?? '-'}
          </span>
        )
      },
      {
        accessorKey: 'year',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Year Number' />
        ),
        cell: ({ row }) => (
          <Badge variant='secondary'>Year {row.getValue('year')}</Badge>
        )
      },
      {
        accessorKey: 'objective',
        header: 'Objective',
        cell: ({ row }) => {
          const val = row.getValue('objective') as string;
          return val ? (
            <span className='text-muted-foreground block max-w-[250px] truncate text-sm'>
              {val.length > 60 ? `${val.slice(0, 60)}...` : val}
            </span>
          ) : (
            <span className='text-muted-foreground text-sm'>-</span>
          );
        }
      },
      {
        id: 'actions',
        cell: ({ row }) => {
          const item = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='ghost'
                  className='data-[state=open]:bg-muted flex h-8 w-8 p-0'
                >
                  <MoreHorizontal className='h-4 w-4' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end' className='w-[160px]'>
                <DropdownMenuItem onClick={() => handleEdit(item)}>
                  <Pencil className='mr-2 h-4 w-4' />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className='text-destructive focus:text-destructive'
                  onClick={() => {
                    setToDelete(item);
                    setDeleteOpen(true);
                  }}
                >
                  <Trash2 className='mr-2 h-4 w-4' />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
        enableSorting: false,
        enableHiding: false
      }
    ],
    []
  );

  const tableData = data?.results ?? [];
  const table = useReactTable({
    data: tableData,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel()
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  if (isLoading) {
    return (
      <div className='space-y-4'>
        <Skeleton className='h-8 w-[250px]' />
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className='h-12 w-full' />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className='flex flex-col gap-4'>
        <div className='max-w-xs'>
          <EntityPicker
            endpoint='/data-admin/course-offerings/'
            queryKey='data-admin-course-offerings'
            mapItem={(item) => ({
              id: item.id as string,
              name: item.name as string
            })}
            value={offeringFilter}
            onChange={setOfferingFilter}
            placeholder='Filter by course offering...'
          />
        </div>
        <div className='overflow-x-auto rounded-md border'>
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((hg) => (
                <TableRow key={hg.id}>
                  {hg.headers.map((h) => (
                    <TableHead key={h.id} colSpan={h.colSpan}>
                      {h.isPlaceholder
                        ? null
                        : flexRender(h.column.columnDef.header, h.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className='h-24 text-center'
                  >
                    No course years found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <DataTablePagination table={table} />
      </div>

      <Dialog open={dialogOpen} onOpenChange={handleCloseDialog}>
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
                  onClick={handleCloseDialog}
                  disabled={isPending}
                >
                  Cancel
                </Button>
                <Button type='submit' disabled={isPending}>
                  {isPending && (
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  )}
                  {isEdit ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title='Delete Course Year'
        description={`Are you sure you want to delete Year ${toDelete?.year}? This action cannot be undone.`}
        onConfirm={() => {
          if (!toDelete) return;
          deleteMutation.mutate(toDelete.id, {
            onSuccess: () => {
              setDeleteOpen(false);
              setToDelete(null);
            }
          });
        }}
        isPending={deleteMutation.isPending}
      />
    </>
  );
}

// ─── Semesters Tab ───────────────────────────────────────────────────────────

const semesterSchema = z.object({
  semister_no: z.coerce.number().min(1, 'Semester number is required'),
  name: z.string().min(1, 'Name is required'),
  start_month: z.string().optional().default(''),
  end_month: z.string().optional().default(''),
  description: z.string().optional().default('')
});

type SemesterFormValues = z.infer<typeof semesterSchema>;

function SemestersTab({
  dialogOpen,
  onDialogOpenChange
}: {
  dialogOpen: boolean;
  onDialogOpenChange: (open: boolean) => void;
}) {
  const { data, isLoading } = useSemesters();
  const createMutation = useCreateSemester();
  const updateMutation = useUpdateSemester();
  const deleteMutation = useDeleteSemester();

  const [sorting, setSorting] = useState<SortingState>([]);
  const [editing, setEditing] = useState<DataSemester | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [toDelete, setToDelete] = useState<DataSemester | null>(null);

  const isEdit = !!editing;

  const form = useForm<SemesterFormValues>({
    resolver: zodResolver(semesterSchema),
    defaultValues: {
      semister_no: 1,
      name: '',
      start_month: '',
      end_month: '',
      description: ''
    }
  });

  useEffect(() => {
    if (dialogOpen && !editing) {
      form.reset({
        semister_no: 1,
        name: '',
        start_month: '',
        end_month: '',
        description: ''
      });
    }
  }, [dialogOpen, editing, form]);

  const handleEdit = (item: DataSemester) => {
    setEditing(item);
    form.reset({
      semister_no: item.semister_no,
      name: item.name,
      start_month: item.start_month ?? '',
      end_month: item.end_month ?? '',
      description: item.description ?? ''
    });
    onDialogOpenChange(true);
  };

  const handleCloseDialog = () => {
    onDialogOpenChange(false);
    setEditing(null);
  };

  const onSubmit = (values: SemesterFormValues) => {
    if (isEdit && editing) {
      updateMutation.mutate(
        { id: editing.id, data: values },
        { onSuccess: handleCloseDialog }
      );
    } else {
      createMutation.mutate(values, { onSuccess: handleCloseDialog });
    }
  };

  const columns = useMemo<ColumnDef<DataSemester>[]>(
    () => [
      {
        accessorKey: 'semister_no',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Semester No' />
        ),
        cell: ({ row }) => (
          <Badge variant='secondary'>Sem {row.getValue('semister_no')}</Badge>
        )
      },
      {
        accessorKey: 'name',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Name' />
        ),
        cell: ({ row }) => (
          <span className='font-medium'>{row.getValue('name')}</span>
        )
      },
      {
        accessorKey: 'start_month',
        header: 'Start Month',
        cell: ({ row }) => (
          <span>{(row.getValue('start_month') as string) || '-'}</span>
        )
      },
      {
        accessorKey: 'end_month',
        header: 'End Month',
        cell: ({ row }) => (
          <span>{(row.getValue('end_month') as string) || '-'}</span>
        )
      },
      {
        accessorKey: 'description',
        header: 'Description',
        cell: ({ row }) => {
          const val = row.getValue('description') as string;
          return val ? (
            <span className='text-muted-foreground block max-w-[200px] truncate text-sm'>
              {val.length > 50 ? `${val.slice(0, 50)}...` : val}
            </span>
          ) : (
            <span className='text-muted-foreground text-sm'>-</span>
          );
        }
      },
      {
        id: 'actions',
        cell: ({ row }) => {
          const item = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='ghost'
                  className='data-[state=open]:bg-muted flex h-8 w-8 p-0'
                >
                  <MoreHorizontal className='h-4 w-4' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end' className='w-[160px]'>
                <DropdownMenuItem onClick={() => handleEdit(item)}>
                  <Pencil className='mr-2 h-4 w-4' />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className='text-destructive focus:text-destructive'
                  onClick={() => {
                    setToDelete(item);
                    setDeleteOpen(true);
                  }}
                >
                  <Trash2 className='mr-2 h-4 w-4' />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
        enableSorting: false,
        enableHiding: false
      }
    ],
    []
  );

  const tableData = data?.results ?? [];
  const table = useReactTable({
    data: tableData,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel()
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  if (isLoading) {
    return (
      <div className='space-y-4'>
        <Skeleton className='h-8 w-[250px]' />
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className='h-12 w-full' />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className='flex flex-col gap-4'>
        <div className='overflow-x-auto rounded-md border'>
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((hg) => (
                <TableRow key={hg.id}>
                  {hg.headers.map((h) => (
                    <TableHead key={h.id} colSpan={h.colSpan}>
                      {h.isPlaceholder
                        ? null
                        : flexRender(h.column.columnDef.header, h.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className='h-24 text-center'
                  >
                    No semesters found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <DataTablePagination table={table} />
      </div>

      <Dialog open={dialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className='max-w-lg'>
          <DialogHeader>
            <DialogTitle>
              {isEdit ? 'Edit Semester' : 'Add Semester'}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='semister_no'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>Semester No</FormLabel>
                      <FormControl>
                        <Input type='number' min={1} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='name'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>Name</FormLabel>
                      <FormControl>
                        <Input placeholder='e.g., Semester 1' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className='grid grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='start_month'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Month</FormLabel>
                      <FormControl>
                        <Input placeholder='e.g., January' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='end_month'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Month</FormLabel>
                      <FormControl>
                        <Input placeholder='e.g., June' {...field} />
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
                        placeholder='Semester description...'
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
                  onClick={handleCloseDialog}
                  disabled={isPending}
                >
                  Cancel
                </Button>
                <Button type='submit' disabled={isPending}>
                  {isPending && (
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  )}
                  {isEdit ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title='Delete Semester'
        description={`Are you sure you want to delete "${toDelete?.name}"? This action cannot be undone.`}
        onConfirm={() => {
          if (!toDelete) return;
          deleteMutation.mutate(toDelete.id, {
            onSuccess: () => {
              setDeleteOpen(false);
              setToDelete(null);
            }
          });
        }}
        isPending={deleteMutation.isPending}
      />
    </>
  );
}

// ─── Course Semesters Tab ────────────────────────────────────────────────────

const courseSemesterSchema = z.object({
  course_year: z.string().min(1, 'Course year is required'),
  semister: z.string().min(1, 'Semester is required')
});

type CourseSemesterFormValues = z.infer<typeof courseSemesterSchema>;

function CourseSemestersTab({
  dialogOpen,
  onDialogOpenChange
}: {
  dialogOpen: boolean;
  onDialogOpenChange: (open: boolean) => void;
}) {
  const { data, isLoading } = useCourseSemesters();
  const createMutation = useCreateCourseSemester();
  const updateMutation = useUpdateCourseSemester();
  const deleteMutation = useDeleteCourseSemester();

  const [sorting, setSorting] = useState<SortingState>([]);
  const [editing, setEditing] = useState<DataCourseSemester | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [toDelete, setToDelete] = useState<DataCourseSemester | null>(null);

  const isEdit = !!editing;

  const form = useForm<CourseSemesterFormValues>({
    resolver: zodResolver(courseSemesterSchema),
    defaultValues: { course_year: '', semister: '' }
  });

  useEffect(() => {
    if (dialogOpen && !editing) {
      form.reset({ course_year: '', semister: '' });
    }
  }, [dialogOpen, editing, form]);

  const handleEdit = (item: DataCourseSemester) => {
    setEditing(item);
    form.reset({ course_year: item.course_year, semister: item.semister });
    onDialogOpenChange(true);
  };

  const handleCloseDialog = () => {
    onDialogOpenChange(false);
    setEditing(null);
  };

  const onSubmit = (values: CourseSemesterFormValues) => {
    if (isEdit && editing) {
      updateMutation.mutate(
        { id: editing.id, data: values },
        { onSuccess: handleCloseDialog }
      );
    } else {
      createMutation.mutate(values, { onSuccess: handleCloseDialog });
    }
  };

  const columns = useMemo<ColumnDef<DataCourseSemester>[]>(
    () => [
      {
        accessorKey: 'course_year_name',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Course Year' />
        ),
        cell: ({ row }) => (
          <span className='font-medium'>
            {row.original.course_year_name ?? row.original.course_year}
          </span>
        )
      },
      {
        accessorKey: 'semister_name',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Semester' />
        ),
        cell: ({ row }) => (
          <span className='font-medium'>
            {row.original.semister_name ?? row.original.semister}
          </span>
        )
      },
      {
        id: 'actions',
        cell: ({ row }) => {
          const item = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='ghost'
                  className='data-[state=open]:bg-muted flex h-8 w-8 p-0'
                >
                  <MoreHorizontal className='h-4 w-4' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end' className='w-[160px]'>
                <DropdownMenuItem onClick={() => handleEdit(item)}>
                  <Pencil className='mr-2 h-4 w-4' />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className='text-destructive focus:text-destructive'
                  onClick={() => {
                    setToDelete(item);
                    setDeleteOpen(true);
                  }}
                >
                  <Trash2 className='mr-2 h-4 w-4' />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
        enableSorting: false,
        enableHiding: false
      }
    ],
    []
  );

  const tableData = data?.results ?? [];
  const table = useReactTable({
    data: tableData,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel()
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  if (isLoading) {
    return (
      <div className='space-y-4'>
        <Skeleton className='h-8 w-[250px]' />
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className='h-12 w-full' />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className='flex flex-col gap-4'>
        <div className='overflow-x-auto rounded-md border'>
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((hg) => (
                <TableRow key={hg.id}>
                  {hg.headers.map((h) => (
                    <TableHead key={h.id} colSpan={h.colSpan}>
                      {h.isPlaceholder
                        ? null
                        : flexRender(h.column.columnDef.header, h.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className='h-24 text-center'
                  >
                    No course semesters found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <DataTablePagination table={table} />
      </div>

      <Dialog open={dialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className='max-w-lg'>
          <DialogHeader>
            <DialogTitle>
              {isEdit ? 'Edit Course Semester' : 'Add Course Semester'}
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
                          name: item.name as string
                        })}
                        value={field.value || null}
                        onChange={(id) => field.onChange(id ?? '')}
                        placeholder='Select semester...'
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
                  onClick={handleCloseDialog}
                  disabled={isPending}
                >
                  Cancel
                </Button>
                <Button type='submit' disabled={isPending}>
                  {isPending && (
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  )}
                  {isEdit ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title='Delete Course Semester'
        description='Are you sure you want to delete this course semester? This action cannot be undone.'
        onConfirm={() => {
          if (!toDelete) return;
          deleteMutation.mutate(toDelete.id, {
            onSuccess: () => {
              setDeleteOpen(false);
              setToDelete(null);
            }
          });
        }}
        isPending={deleteMutation.isPending}
      />
    </>
  );
}

// ─── Modules Tab ─────────────────────────────────────────────────────────────

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

type ModuleFormValues = z.infer<typeof moduleSchema>;

function ModulesTab({
  dialogOpen,
  onDialogOpenChange
}: {
  dialogOpen: boolean;
  onDialogOpenChange: (open: boolean) => void;
}) {
  const [csFilter, setCsFilter] = useState<string | null>(null);
  const { data, isLoading } = useCourseModules(
    csFilter ? { course_semister: csFilter } : undefined
  );
  const createMutation = useCreateCourseModule();
  const updateMutation = useUpdateCourseModule();
  const deleteMutation = useDeleteCourseModule();

  const [sorting, setSorting] = useState<SortingState>([]);
  const [editing, setEditing] = useState<DataCourseModule | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [toDelete, setToDelete] = useState<DataCourseModule | null>(null);

  const isEdit = !!editing;

  const form = useForm<ModuleFormValues>({
    resolver: zodResolver(moduleSchema),
    defaultValues: {
      course_semister: '',
      title: '',
      code: '',
      description: '',
      category: 'NON ELECTIVE',
      version: ''
    }
  });

  useEffect(() => {
    if (dialogOpen && !editing) {
      form.reset({
        course_semister: csFilter ?? '',
        title: '',
        code: '',
        description: '',
        category: 'NON ELECTIVE',
        version: ''
      });
    }
  }, [dialogOpen, editing, form, csFilter]);

  const handleEdit = (item: DataCourseModule) => {
    setEditing(item);
    form.reset({
      course_semister: item.course_semister,
      title: item.title,
      code: item.code,
      description: item.description ?? '',
      category: item.category,
      version: item.version ?? ''
    });
    onDialogOpenChange(true);
  };

  const handleCloseDialog = () => {
    onDialogOpenChange(false);
    setEditing(null);
  };

  const onSubmit = (values: ModuleFormValues) => {
    if (isEdit && editing) {
      updateMutation.mutate(
        { id: editing.id, data: values },
        { onSuccess: handleCloseDialog }
      );
    } else {
      createMutation.mutate(values, { onSuccess: handleCloseDialog });
    }
  };

  const columns = useMemo<ColumnDef<DataCourseModule>[]>(
    () => [
      {
        accessorKey: 'course_semister_name',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Course Semester' />
        ),
        cell: ({ row }) => (
          <span className='font-medium'>
            {row.original.course_semister_name ?? row.original.course_semister}
          </span>
        )
      },
      {
        accessorKey: 'title',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Title' />
        ),
        cell: ({ row }) => (
          <span className='font-medium'>{row.getValue('title')}</span>
        )
      },
      {
        accessorKey: 'code',
        header: 'Code',
        cell: ({ row }) => (
          <Badge variant='outline'>{row.getValue('code')}</Badge>
        )
      },
      {
        accessorKey: 'category',
        header: 'Category',
        cell: ({ row }) => {
          const cat = row.getValue('category') as string;
          return (
            <Badge variant={cat === 'ELECTIVE' ? 'secondary' : 'default'}>
              {cat}
            </Badge>
          );
        }
      },
      {
        accessorKey: 'description',
        header: 'Description',
        cell: ({ row }) => {
          const val = row.getValue('description') as string;
          return val ? (
            <span className='text-muted-foreground block max-w-[200px] truncate text-sm'>
              {val.length > 50 ? `${val.slice(0, 50)}...` : val}
            </span>
          ) : (
            <span className='text-muted-foreground text-sm'>-</span>
          );
        }
      },
      {
        id: 'actions',
        cell: ({ row }) => {
          const item = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='ghost'
                  className='data-[state=open]:bg-muted flex h-8 w-8 p-0'
                >
                  <MoreHorizontal className='h-4 w-4' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end' className='w-[160px]'>
                <DropdownMenuItem onClick={() => handleEdit(item)}>
                  <Pencil className='mr-2 h-4 w-4' />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className='text-destructive focus:text-destructive'
                  onClick={() => {
                    setToDelete(item);
                    setDeleteOpen(true);
                  }}
                >
                  <Trash2 className='mr-2 h-4 w-4' />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
        enableSorting: false,
        enableHiding: false
      }
    ],
    []
  );

  const tableData = data?.results ?? [];
  const table = useReactTable({
    data: tableData,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel()
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  if (isLoading) {
    return (
      <div className='space-y-4'>
        <Skeleton className='h-8 w-[250px]' />
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className='h-12 w-full' />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className='flex flex-col gap-4'>
        <div className='max-w-xs'>
          <EntityPicker
            endpoint='/data-admin/course-semesters/'
            queryKey='data-admin-course-semesters'
            mapItem={(item) => ({
              id: item.id as string,
              name: `${(item as Record<string, unknown>).course_year_name ?? 'Year'} - ${(item as Record<string, unknown>).semister_name ?? 'Semester'}`
            })}
            value={csFilter}
            onChange={setCsFilter}
            placeholder='Filter by course semester...'
          />
        </div>
        <div className='overflow-x-auto rounded-md border'>
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((hg) => (
                <TableRow key={hg.id}>
                  {hg.headers.map((h) => (
                    <TableHead key={h.id} colSpan={h.colSpan}>
                      {h.isPlaceholder
                        ? null
                        : flexRender(h.column.columnDef.header, h.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className='h-24 text-center'
                  >
                    No modules found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <DataTablePagination table={table} />
      </div>

      <Dialog open={dialogOpen} onOpenChange={handleCloseDialog}>
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
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Select category' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value='ELECTIVE'>Elective</SelectItem>
                          <SelectItem value='NON ELECTIVE'>
                            Non-Elective
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
                  onClick={handleCloseDialog}
                  disabled={isPending}
                >
                  Cancel
                </Button>
                <Button type='submit' disabled={isPending}>
                  {isPending && (
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  )}
                  {isEdit ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title='Delete Module'
        description={`Are you sure you want to delete "${toDelete?.title}"? This action cannot be undone.`}
        onConfirm={() => {
          if (!toDelete) return;
          deleteMutation.mutate(toDelete.id, {
            onSuccess: () => {
              setDeleteOpen(false);
              setToDelete(null);
            }
          });
        }}
        isPending={deleteMutation.isPending}
      />
    </>
  );
}

// ─── Main Syllabus Page ──────────────────────────────────────────────────────

export default function SyllabusPage() {
  const [activeTab, setActiveTab] = useState('course-years');
  const [courseYearDialogOpen, setCourseYearDialogOpen] = useState(false);
  const [semesterDialogOpen, setSemesterDialogOpen] = useState(false);
  const [courseSemesterDialogOpen, setCourseSemesterDialogOpen] =
    useState(false);
  const [moduleDialogOpen, setModuleDialogOpen] = useState(false);

  const { data: courseYears } = useCourseYears();
  const { data: semesters } = useSemesters();
  const { data: courseSemesters } = useCourseSemesters();
  const { data: modules } = useCourseModules();

  const analyticsStats = [
    {
      label: 'Course Years',
      value: courseYears?.count ?? 0,
      icon: Calendar,
      color: 'bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400'
    },
    {
      label: 'Semesters',
      value: semesters?.count ?? 0,
      icon: Layers,
      color:
        'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
    },
    {
      label: 'Course-Semesters',
      value: courseSemesters?.count ?? 0,
      icon: LayoutGrid,
      color:
        'bg-violet-100 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400'
    },
    {
      label: 'Modules',
      value: modules?.count ?? 0,
      icon: BookOpen,
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
            <h1 className='text-2xl font-semibold tracking-tight'>
              Course Syllabus
            </h1>
          </div>
          <p className='text-muted-foreground mt-1 text-sm'>
            Manage course syllabus structure: years, semesters, and modules
          </p>
        </div>

        {/* Section Analytics */}
        <SectionAnalytics stats={analyticsStats} />

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className='flex items-center justify-between'>
            <TabsList>
              <TabsTrigger value='course-years'>Course Years</TabsTrigger>
              <TabsTrigger value='semesters'>Semesters</TabsTrigger>
              <TabsTrigger value='course-semesters'>
                Course Semesters
              </TabsTrigger>
              <TabsTrigger value='modules'>Modules</TabsTrigger>
            </TabsList>
            <div>
              {activeTab === 'course-years' && (
                <Button size='sm' onClick={() => setCourseYearDialogOpen(true)}>
                  <Plus className='mr-2 h-4 w-4' />
                  Add Course Year
                </Button>
              )}
              {activeTab === 'semesters' && (
                <Button size='sm' onClick={() => setSemesterDialogOpen(true)}>
                  <Plus className='mr-2 h-4 w-4' />
                  Add Semester
                </Button>
              )}
              {activeTab === 'course-semesters' && (
                <Button
                  size='sm'
                  onClick={() => setCourseSemesterDialogOpen(true)}
                >
                  <Plus className='mr-2 h-4 w-4' />
                  Add Course Semester
                </Button>
              )}
              {activeTab === 'modules' && (
                <Button size='sm' onClick={() => setModuleDialogOpen(true)}>
                  <Plus className='mr-2 h-4 w-4' />
                  Add Module
                </Button>
              )}
            </div>
          </div>

          <TabsContent value='course-years' className='mt-4'>
            <CourseYearsTab
              dialogOpen={courseYearDialogOpen}
              onDialogOpenChange={setCourseYearDialogOpen}
            />
          </TabsContent>

          <TabsContent value='semesters' className='mt-4'>
            <SemestersTab
              dialogOpen={semesterDialogOpen}
              onDialogOpenChange={setSemesterDialogOpen}
            />
          </TabsContent>

          <TabsContent value='course-semesters' className='mt-4'>
            <CourseSemestersTab
              dialogOpen={courseSemesterDialogOpen}
              onDialogOpenChange={setCourseSemesterDialogOpen}
            />
          </TabsContent>

          <TabsContent value='modules' className='mt-4'>
            <ModulesTab
              dialogOpen={moduleDialogOpen}
              onDialogOpenChange={setModuleDialogOpen}
            />
          </TabsContent>
        </Tabs>
      </div>
    </PageContainer>
  );
}
