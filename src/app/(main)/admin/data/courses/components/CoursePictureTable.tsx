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
  useCoursePictures,
  useCreateCoursePicture,
  useUpdateCoursePicture,
  useDeleteCoursePicture
} from '@/features/data-admin/hooks/use-course-sub';
import type { DataCoursePicture } from '@/features/data-admin/types';

const pictureSchema = z.object({
  course: z.string().min(1, 'Course is required'),
  name: z.string().min(1, 'Name is required'),
  image: z.string().min(1, 'Image URL is required')
});

type PictureFormValues = z.infer<typeof pictureSchema>;

interface CoursePictureTableProps {
  dialogOpen: boolean;
  onDialogOpenChange: (open: boolean) => void;
}

export function CoursePictureTable({
  dialogOpen,
  onDialogOpenChange
}: CoursePictureTableProps) {
  const [courseFilter, setCourseFilter] = useState<string | null>(null);
  const { data: picturesData, isLoading } = useCoursePictures(
    courseFilter ? { course: courseFilter } : undefined
  );
  const createPicture = useCreateCoursePicture();
  const updatePicture = useUpdateCoursePicture();
  const deletePicture = useDeleteCoursePicture();

  const [sorting, setSorting] = useState<SortingState>([]);
  const [editingPicture, setEditingPicture] =
    useState<DataCoursePicture | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [pictureToDelete, setPictureToDelete] =
    useState<DataCoursePicture | null>(null);

  const isEdit = !!editingPicture;

  const form = useForm<PictureFormValues>({
    resolver: zodResolver(pictureSchema),
    defaultValues: { course: '', name: '', image: '' }
  });

  useEffect(() => {
    if (dialogOpen && !editingPicture) {
      form.reset({ course: courseFilter ?? '', name: '', image: '' });
    }
  }, [dialogOpen, editingPicture, form, courseFilter]);

  const handleEdit = (picture: DataCoursePicture) => {
    setEditingPicture(picture);
    form.reset({
      course: picture.course,
      name: picture.name,
      image: picture.image ?? ''
    });
    onDialogOpenChange(true);
  };

  const handleCloseDialog = () => {
    onDialogOpenChange(false);
    setEditingPicture(null);
  };

  const onSubmit = (values: PictureFormValues) => {
    if (isEdit && editingPicture) {
      updatePicture.mutate(
        { id: editingPicture.id, data: values },
        { onSuccess: handleCloseDialog }
      );
    } else {
      createPicture.mutate(values, { onSuccess: handleCloseDialog });
    }
  };

  const handleDeleteConfirm = () => {
    if (!pictureToDelete) return;
    deletePicture.mutate(pictureToDelete.id, {
      onSuccess: () => {
        setDeleteOpen(false);
        setPictureToDelete(null);
      }
    });
  };

  const columns = useMemo<ColumnDef<DataCoursePicture>[]>(
    () => [
      {
        accessorKey: 'course_name',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Course' />
        ),
        cell: ({ row }) => (
          <span className='font-medium'>{row.original.course_name ?? '-'}</span>
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
        accessorKey: 'image',
        header: 'Image URL',
        cell: ({ row }) => {
          const url = row.getValue('image') as string;
          return url ? (
            <a
              href={url}
              target='_blank'
              rel='noopener noreferrer'
              className='block max-w-[200px] truncate text-blue-600 hover:underline'
            >
              {url.length > 50 ? `${url.slice(0, 50)}...` : url}
            </a>
          ) : (
            <span className='text-muted-foreground text-sm'>-</span>
          );
        }
      },
      {
        id: 'actions',
        cell: ({ row }) => {
          const picture = row.original;
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
                <DropdownMenuItem onClick={() => handleEdit(picture)}>
                  <Pencil className='mr-2 h-4 w-4' />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className='text-destructive focus:text-destructive'
                  onClick={() => {
                    setPictureToDelete(picture);
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

  const tableData = picturesData?.results ?? [];
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

  const isPending = createPicture.isPending || updatePicture.isPending;

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
            endpoint='/data-admin/courses/'
            queryKey='data-admin-courses'
            mapItem={(item) => ({
              id: item.id as string,
              name: item.name as string
            })}
            value={courseFilter}
            onChange={setCourseFilter}
            placeholder='Filter by course...'
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
                    No pictures found.
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
            <DialogTitle>{isEdit ? 'Edit Picture' : 'Add Picture'}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
              <FormField
                control={form.control}
                name='course'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Course</FormLabel>
                    <FormControl>
                      <EntityPicker
                        endpoint='/data-admin/courses/'
                        queryKey='data-admin-courses'
                        mapItem={(item) => ({
                          id: item.id as string,
                          name: item.name as string
                        })}
                        value={field.value || null}
                        onChange={(id) => field.onChange(id ?? '')}
                        placeholder='Select course...'
                      />
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
                      <Input placeholder='e.g., Course Overview' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='image'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Image URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='https://example.com/image.jpg'
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
        title='Delete Picture'
        description={`Are you sure you want to delete "${pictureToDelete?.name}"? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        isPending={deletePicture.isPending}
      />
    </>
  );
}
