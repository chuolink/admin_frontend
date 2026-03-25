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
import { Checkbox } from '@/components/ui/checkbox';
import { DataTablePagination } from '@/components/data-table/data-table-pagination';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { Skeleton } from '@/components/ui/skeleton';
import { DeleteConfirmDialog } from '@/features/data-admin/components/DeleteConfirmDialog';
import { EntityPicker } from '@/features/data-admin/components/EntityPicker';
import {
  useCountryFAQs,
  useCreateCountryFAQ,
  useUpdateCountryFAQ,
  useDeleteCountryFAQ
} from '@/features/data-admin/hooks/use-countries';
import type { CountryFAQDetail } from '@/features/data-admin/hooks/use-countries';

const faqSchema = z.object({
  country: z.string().min(1, 'Country is required'),
  question: z.string().min(1, 'Question is required'),
  answer: z.string().min(1, 'Answer is required')
});

type FAQFormValues = z.infer<typeof faqSchema>;

interface CountryFAQTableProps {
  dialogOpen: boolean;
  onDialogOpenChange: (open: boolean) => void;
}

export function CountryFAQTable({
  dialogOpen,
  onDialogOpenChange
}: CountryFAQTableProps) {
  const [countryFilter, setCountryFilter] = useState<string | null>(null);
  const { data: faqsData, isLoading } = useCountryFAQs(
    countryFilter ? { country: countryFilter } : undefined
  );
  const createFAQ = useCreateCountryFAQ();
  const updateFAQ = useUpdateCountryFAQ();
  const deleteFAQ = useDeleteCountryFAQ();

  const [sorting, setSorting] = useState<SortingState>([]);
  const [editingFAQ, setEditingFAQ] = useState<CountryFAQDetail | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [faqToDelete, setFaqToDelete] = useState<CountryFAQDetail | null>(null);

  const isEdit = !!editingFAQ;

  const form = useForm<FAQFormValues>({
    resolver: zodResolver(faqSchema),
    defaultValues: {
      country: '',
      question: '',
      answer: ''
    }
  });

  useEffect(() => {
    if (dialogOpen && !editingFAQ) {
      form.reset({
        country: countryFilter ?? '',
        question: '',
        answer: ''
      });
    }
  }, [dialogOpen, editingFAQ, form, countryFilter]);

  const handleEdit = (faq: CountryFAQDetail) => {
    setEditingFAQ(faq);
    form.reset({
      country: (faq as any).country,
      question: (faq as any).question,
      answer: (faq as any).answer ?? ''
    });
    onDialogOpenChange(true);
  };

  const handleCloseDialog = () => {
    onDialogOpenChange(false);
    setEditingFAQ(null);
  };

  const onSubmit = (values: FAQFormValues) => {
    if (isEdit && editingFAQ) {
      updateFAQ.mutate(
        { id: editingFAQ.id, data: values },
        { onSuccess: handleCloseDialog }
      );
    } else {
      createFAQ.mutate(values, { onSuccess: handleCloseDialog });
    }
  };

  const handleDeleteConfirm = () => {
    if (!faqToDelete) return;
    deleteFAQ.mutate(faqToDelete.id, {
      onSuccess: () => {
        setDeleteOpen(false);
        setFaqToDelete(null);
      }
    });
  };

  const columns = useMemo<ColumnDef<CountryFAQDetail>[]>(
    () => [
      {
        accessorKey: 'country_name',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Country' />
        ),
        cell: ({ row }) => (
          <span className='font-medium'>
            {row.original.country_name ?? '-'}
          </span>
        )
      },
      {
        accessorKey: 'question',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Question' />
        ),
        cell: ({ row }) => (
          <span className='block max-w-[300px] truncate font-medium'>
            {row.getValue('question')}
          </span>
        )
      },
      {
        accessorKey: 'answer',
        header: 'Answer',
        cell: ({ row }) => {
          const answer = row.getValue('answer') as string;
          return (
            <span
              className='text-muted-foreground line-clamp-2 block max-w-[400px] text-sm'
              title={answer}
            >
              {answer}
            </span>
          );
        },
        enableSorting: false
      },
      {
        id: 'actions',
        cell: ({ row }) => {
          const faq = row.original;
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
                <DropdownMenuItem onClick={() => handleEdit(faq)}>
                  <Pencil className='mr-2 h-4 w-4' />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className='text-destructive focus:text-destructive'
                  onClick={() => {
                    setFaqToDelete(faq);
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

  const tableData = faqsData?.results ?? [];

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

  const isPending = createFAQ.isPending || updateFAQ.isPending;

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
        {/* Country filter */}
        <div className='max-w-xs'>
          <EntityPicker
            endpoint='/data-admin/countries/'
            queryKey='data-admin-countries'
            mapItem={(item) => ({
              id: item.id as string,
              name: item.name as string
            })}
            value={countryFilter}
            onChange={setCountryFilter}
            placeholder='Filter by country...'
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
                    No FAQs found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <DataTablePagination table={table} />
      </div>

      {/* Add/Edit FAQ Dialog */}
      <Dialog open={dialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className='max-w-lg'>
          <DialogHeader>
            <DialogTitle>{isEdit ? 'Edit FAQ' : 'Add FAQ'}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
              <FormField
                control={form.control}
                name='country'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Country</FormLabel>
                    <FormControl>
                      <EntityPicker
                        endpoint='/data-admin/countries/'
                        queryKey='data-admin-countries'
                        mapItem={(item) => ({
                          id: item.id as string,
                          name: item.name as string
                        })}
                        value={field.value || null}
                        onChange={(id) => field.onChange(id ?? '')}
                        placeholder='Select country...'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='question'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Question</FormLabel>
                    <FormControl>
                      <Input placeholder='Enter the question' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='answer'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Answer</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='Enter the answer'
                        rows={4}
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
        title='Delete FAQ'
        description={`Are you sure you want to delete this FAQ? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        isPending={deleteFAQ.isPending}
      />
    </>
  );
}
