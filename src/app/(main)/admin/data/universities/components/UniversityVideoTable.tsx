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
  useUniversityVideos,
  useCreateUniversityVideo,
  useUpdateUniversityVideo,
  useDeleteUniversityVideo
} from '@/features/data-admin/hooks/use-university-sub';
import type { DataUniversityVideo } from '@/features/data-admin/types';

const videoSchema = z.object({
  university: z.string().min(1, 'University is required'),
  name: z.string().min(1, 'Name is required'),
  video_url: z.string().min(1, 'Video URL is required')
});

type VideoFormValues = z.infer<typeof videoSchema>;

interface UniversityVideoTableProps {
  dialogOpen: boolean;
  onDialogOpenChange: (open: boolean) => void;
}

export function UniversityVideoTable({
  dialogOpen,
  onDialogOpenChange
}: UniversityVideoTableProps) {
  const [universityFilter, setUniversityFilter] = useState<string | null>(null);
  const { data: videosData, isLoading } = useUniversityVideos(
    universityFilter ? { university: universityFilter } : undefined
  );
  const createVideo = useCreateUniversityVideo();
  const updateVideo = useUpdateUniversityVideo();
  const deleteVideo = useDeleteUniversityVideo();

  const [sorting, setSorting] = useState<SortingState>([]);
  const [editingVideo, setEditingVideo] = useState<DataUniversityVideo | null>(
    null
  );
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [videoToDelete, setVideoToDelete] =
    useState<DataUniversityVideo | null>(null);

  const isEdit = !!editingVideo;

  const form = useForm<VideoFormValues>({
    resolver: zodResolver(videoSchema),
    defaultValues: {
      university: '',
      name: '',
      video_url: ''
    }
  });

  useEffect(() => {
    if (dialogOpen && !editingVideo) {
      form.reset({
        university: universityFilter ?? '',
        name: '',
        video_url: ''
      });
    }
  }, [dialogOpen, editingVideo, form, universityFilter]);

  const handleEdit = (video: DataUniversityVideo) => {
    setEditingVideo(video);
    form.reset({
      university: video.university,
      name: video.name,
      video_url: video.video_url ?? ''
    });
    onDialogOpenChange(true);
  };

  const handleCloseDialog = () => {
    onDialogOpenChange(false);
    setEditingVideo(null);
  };

  const onSubmit = (values: VideoFormValues) => {
    if (isEdit && editingVideo) {
      updateVideo.mutate(
        { id: editingVideo.id, data: values },
        { onSuccess: handleCloseDialog }
      );
    } else {
      createVideo.mutate(values, { onSuccess: handleCloseDialog });
    }
  };

  const handleDeleteConfirm = () => {
    if (!videoToDelete) return;
    deleteVideo.mutate(videoToDelete.id, {
      onSuccess: () => {
        setDeleteOpen(false);
        setVideoToDelete(null);
      }
    });
  };

  const columns = useMemo<ColumnDef<DataUniversityVideo>[]>(
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
          <DataTableColumnHeader column={column} title='Name' />
        ),
        cell: ({ row }) => (
          <span className='font-medium'>{row.getValue('name')}</span>
        )
      },
      {
        accessorKey: 'video_url',
        header: 'Video URL',
        cell: ({ row }) => {
          const url = row.getValue('video_url') as string;
          return url ? (
            <a
              href={url}
              target='_blank'
              rel='noopener noreferrer'
              className='block max-w-[300px] truncate text-blue-600 hover:underline'
            >
              {url.length > 60 ? `${url.slice(0, 60)}...` : url}
            </a>
          ) : (
            <span className='text-muted-foreground text-sm'>-</span>
          );
        }
      },
      {
        id: 'actions',
        cell: ({ row }) => {
          const video = row.original;
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
                <DropdownMenuItem onClick={() => handleEdit(video)}>
                  <Pencil className='mr-2 h-4 w-4' />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className='text-destructive focus:text-destructive'
                  onClick={() => {
                    setVideoToDelete(video);
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

  const tableData = videosData?.results ?? [];

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

  const isPending = createVideo.isPending || updateVideo.isPending;

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
                    No videos found.
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
            <DialogTitle>{isEdit ? 'Edit Video' : 'Add Video'}</DialogTitle>
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
                    <FormLabel required>Name</FormLabel>
                    <FormControl>
                      <Input placeholder='e.g., Campus Tour' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='video_url'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Video URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='https://youtube.com/watch?v=...'
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
        title='Delete Video'
        description={`Are you sure you want to delete "${videoToDelete?.name}"? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        isPending={deleteVideo.isPending}
      />
    </>
  );
}
