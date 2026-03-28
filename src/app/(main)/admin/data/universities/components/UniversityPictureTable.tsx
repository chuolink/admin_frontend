// @ts-nocheck
'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
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
import { ServerPagination } from '@/features/data-admin/components/ServerPagination';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { DeleteConfirmDialog } from '@/features/data-admin/components/DeleteConfirmDialog';
import { EntityPicker } from '@/features/data-admin/components/EntityPicker';
import {
  TableFilters,
  type FilterDef
} from '@/features/data-admin/components/TableFilters';
import {
  useUniversityPictures,
  useCreateUniversityPicture,
  useUpdateUniversityPicture,
  useDeleteUniversityPicture
} from '@/features/data-admin/hooks/use-university-sub';
import type { DataUniversityPicture } from '@/features/data-admin/types';

const pictureSchema = z.object({
  university: z.string().min(1, 'University is required'),
  name: z.string().min(1, 'Name is required'),
  image: z.string().min(1, 'Image URL is required')
});

type PictureFormValues = z.infer<typeof pictureSchema>;

interface UniversityPictureTableProps {
  dialogOpen: boolean;
  onDialogOpenChange: (open: boolean) => void;
}

export function UniversityPictureTable({
  dialogOpen,
  onDialogOpenChange
}: UniversityPictureTableProps) {
  const [universityFilter, setUniversityFilter] = useState<string | null>(null);
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const { data: picturesData, isLoading } = useUniversityPictures({
    page: String(page),
    page_size: String(pageSize),
    ...(universityFilter ? { university: universityFilter } : {}),
    ...Object.fromEntries(Object.entries(filterValues).filter(([, v]) => v))
  } as Record<string, string>);
  const createPicture = useCreateUniversityPicture();
  const updatePicture = useUpdateUniversityPicture();
  const deletePicture = useDeleteUniversityPicture();

  const [sorting, setSorting] = useState<SortingState>([]);
  const [editingPicture, setEditingPicture] =
    useState<DataUniversityPicture | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [pictureToDelete, setPictureToDelete] =
    useState<DataUniversityPicture | null>(null);

  const isEdit = !!editingPicture;

  const form = useForm<PictureFormValues>({
    resolver: zodResolver(pictureSchema),
    defaultValues: {
      university: '',
      name: '',
      image: ''
    }
  });

  useEffect(() => {
    if (dialogOpen && !editingPicture) {
      form.reset({
        university: universityFilter ?? '',
        name: '',
        image: ''
      });
    }
  }, [dialogOpen, editingPicture, form, universityFilter]);

  const handleEdit = (picture: DataUniversityPicture) => {
    setEditingPicture(picture);
    form.reset({
      university: picture.university,
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

  const columns = useMemo<ColumnDef<DataUniversityPicture>[]>(
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
        accessorKey: 'name',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Name (Category)' />
        ),
        cell: ({ row }) => (
          <Badge variant='secondary'>{row.getValue('name')}</Badge>
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
        <div className='flex flex-wrap items-center gap-2'>
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
          <TableFilters
            filters={
              [
                {
                  key: 'name',
                  label: 'Category',
                  type: 'select',
                  options: [
                    { value: 'labs', label: 'Labs' },
                    { value: 'libraries', label: 'Libraries' },
                    { value: 'hostels', label: 'Hostels' },
                    { value: 'overview', label: 'Overview' },
                    { value: 'lecture_rooms', label: 'Lecture Rooms' },
                    { value: 'other', label: 'Other' }
                  ]
                }
              ] satisfies FilterDef[]
            }
            values={filterValues}
            onChange={(key, val) =>
              setFilterValues((prev) => ({ ...prev, [key]: val }))
            }
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
                  <TableRow
                    key={row.id}
                    className='hover:bg-muted/50 cursor-pointer'
                    onClick={() => handleEdit(row.original)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        onClick={
                          cell.column.id === 'actions'
                            ? (e) => e.stopPropagation()
                            : undefined
                        }
                      >
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

        <ServerPagination
          totalCount={picturesData?.count ?? 0}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
        />
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
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Name (Category)</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select category...' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='labs'>Labs</SelectItem>
                        <SelectItem value='libraries'>Libraries</SelectItem>
                        <SelectItem value='hostels'>Hostels</SelectItem>
                        <SelectItem value='overview'>Overview</SelectItem>
                        <SelectItem value='lecture_rooms'>
                          Lecture Rooms
                        </SelectItem>
                        <SelectItem value='other'>Other</SelectItem>
                      </SelectContent>
                    </Select>
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
