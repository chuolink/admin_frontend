// @ts-nocheck
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
import { Loader2, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import { Skeleton } from '@/components/ui/skeleton';
import { DeleteConfirmDialog } from '@/features/data-admin/components/DeleteConfirmDialog';
import { EntityPicker } from '@/features/data-admin/components/EntityPicker';
import {
  useUniversityStudyReasons,
  useCreateUniversityStudyReason,
  useUpdateUniversityStudyReason,
  useDeleteUniversityStudyReason
} from '@/features/data-admin/hooks/use-university-sub';
import type { DataUniversityStudyReason } from '@/features/data-admin/types';

const studyReasonSchema = z.object({
  university: z.string().min(1, 'University is required'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional().default('')
});

type StudyReasonFormValues = z.infer<typeof studyReasonSchema>;

interface UniversityStudyReasonTableProps {
  dialogOpen: boolean;
  onDialogOpenChange: (open: boolean) => void;
}

export function UniversityStudyReasonTable({
  dialogOpen,
  onDialogOpenChange
}: UniversityStudyReasonTableProps) {
  const [universityFilter, setUniversityFilter] = useState<string | null>(null);
  const { data: reasonsData, isLoading } = useUniversityStudyReasons(
    universityFilter ? { university: universityFilter } : undefined
  );
  const createReason = useCreateUniversityStudyReason();
  const updateReason = useUpdateUniversityStudyReason();
  const deleteReason = useDeleteUniversityStudyReason();

  const [sorting, setSorting] = useState<SortingState>([]);
  const [editingReason, setEditingReason] =
    useState<DataUniversityStudyReason | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [reasonToDelete, setReasonToDelete] =
    useState<DataUniversityStudyReason | null>(null);

  const isEdit = !!editingReason;

  const form = useForm<StudyReasonFormValues>({
    resolver: zodResolver(studyReasonSchema),
    defaultValues: {
      university: '',
      title: '',
      description: ''
    }
  });

  useEffect(() => {
    if (dialogOpen && !editingReason) {
      form.reset({
        university: universityFilter ?? '',
        title: '',
        description: ''
      });
    }
  }, [dialogOpen, editingReason, form, universityFilter]);

  const handleEdit = (reason: DataUniversityStudyReason) => {
    setEditingReason(reason);
    form.reset({
      university: reason.university,
      title: reason.title,
      description: reason.description ?? ''
    });
    onDialogOpenChange(true);
  };

  const handleCloseDialog = () => {
    onDialogOpenChange(false);
    setEditingReason(null);
  };

  const onSubmit = (values: StudyReasonFormValues) => {
    if (isEdit && editingReason) {
      updateReason.mutate(
        { id: editingReason.id, data: values },
        { onSuccess: handleCloseDialog }
      );
    } else {
      createReason.mutate(values, { onSuccess: handleCloseDialog });
    }
  };

  const handleDeleteConfirm = () => {
    if (!reasonToDelete) return;
    deleteReason.mutate(reasonToDelete.id, {
      onSuccess: () => {
        setDeleteOpen(false);
        setReasonToDelete(null);
      }
    });
  };

  const columns = useMemo<ColumnDef<DataUniversityStudyReason>[]>(
    () => [
      {
        accessorKey: 'university_name',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='University' />
        ),
        cell: ({ row }) => (
          <span className='font-medium'>
            {row.original.university_name ?? '-'}
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
        accessorKey: 'description',
        header: 'Description',
        cell: ({ row }) => {
          const desc = row.getValue('description') as string;
          return desc ? (
            <span className='text-muted-foreground block max-w-[300px] truncate text-sm'>
              {desc.length > 80 ? `${desc.slice(0, 80)}...` : desc}
            </span>
          ) : (
            <span className='text-muted-foreground text-sm'>-</span>
          );
        }
      },
      {
        id: 'actions',
        cell: ({ row }) => {
          const reason = row.original;
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
                <DropdownMenuItem onClick={() => handleEdit(reason)}>
                  <Pencil className='mr-2 h-4 w-4' />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className='text-destructive focus:text-destructive'
                  onClick={() => {
                    setReasonToDelete(reason);
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

  const tableData = reasonsData?.results ?? [];

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

  const isPending = createReason.isPending || updateReason.isPending;

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
            endpoint='/data-admin/universities/'
            queryKey='data-admin-universities'
            mapItem={(item) => ({
              id: item.id as string,
              name: item.name as string
            })}
            value={universityFilter}
            onChange={setUniversityFilter}
            placeholder='Filter by university...'
          />
        </div>

        <div className='overflow-x-auto rounded-md border'>
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
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
                    No study reasons found.
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
              {isEdit ? 'Edit Study Reason' : 'Add Study Reason'}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
              <FormField
                control={form.control}
                name='university'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>University</FormLabel>
                    <FormControl>
                      <EntityPicker
                        endpoint='/data-admin/universities/'
                        queryKey='data-admin-universities'
                        mapItem={(item) => ({
                          id: item.id as string,
                          name: item.name as string
                        })}
                        value={field.value || null}
                        onChange={(id) => field.onChange(id ?? '')}
                        placeholder='Select university...'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='title'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='e.g., World-class Research'
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
                        placeholder='Why students should study here...'
                        rows={3}
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
        title='Delete Study Reason'
        description={`Are you sure you want to delete "${reasonToDelete?.title}"? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        isPending={deleteReason.isPending}
      />
    </>
  );
}
