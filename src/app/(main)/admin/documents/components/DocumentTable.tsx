'use client';

import { useMemo, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  flexRender,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  type VisibilityState
} from '@tanstack/react-table';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useClientApi from '@/lib/axios/clientSide';
import { toast } from 'sonner';
import { format } from 'date-fns';
import {
  Eye,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Clock,
  FileCheck,
  FileX,
  Upload,
  Ban
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar';
import { DataTablePagination } from '@/components/data-table/data-table-pagination';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { Skeleton } from '@/components/ui/skeleton';
import { type DocumentRequirement } from '@/features/pipeline/types';

interface DocumentQueueItem extends DocumentRequirement {
  student_name?: string;
  stage_label?: string;
  pipeline_id?: string;
}

interface DocumentsQueueResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: DocumentQueueItem[];
}

const statusOptions = [
  { label: 'Required', value: 'REQUIRED', icon: Clock },
  { label: 'Uploaded', value: 'UPLOADED', icon: Upload },
  { label: 'Verified', value: 'VERIFIED', icon: FileCheck },
  { label: 'Rejected', value: 'REJECTED', icon: FileX },
  { label: 'N/A', value: 'NOT_APPLICABLE', icon: Ban }
];

const STATUS_BADGE: Record<
  string,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  REQUIRED: 'outline',
  UPLOADED: 'secondary',
  VERIFIED: 'default',
  REJECTED: 'destructive',
  NOT_APPLICABLE: 'secondary'
};

function docTypeLabel(type: string) {
  return type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function DocumentTable() {
  const { api } = useClientApi();
  const queryClient = useQueryClient();

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState('');
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 20
  });

  // Reject dialog state
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectDocId, setRejectDocId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const queryParams = useMemo(() => {
    const params: Record<string, string | number> = {
      page: pagination.pageIndex + 1,
      page_size: pagination.pageSize
    };
    if (globalFilter) params.search = globalFilter;
    if (sorting.length > 0) {
      params.ordering = sorting
        .map((s) => (s.desc ? '-' : '') + s.id)
        .join(',');
    }
    return params;
  }, [globalFilter, sorting, pagination]);

  const { data, isLoading } = useQuery<DocumentsQueueResponse>({
    queryKey: ['documents-queue', queryParams],
    queryFn: async () => {
      const response = await api!.get('/admin/documents/', {
        params: queryParams
      });
      return response.data;
    },
    enabled: !!api
  });

  const verifyDoc = useMutation({
    mutationFn: async (docId: string) => {
      const response = await api!.post(`/admin/documents/${docId}/verify/`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents-queue'] });
      toast.success('Document verified');
    },
    onError: () => toast.error('Failed to verify document')
  });

  const rejectDoc = useMutation({
    mutationFn: async ({
      docId,
      reason
    }: {
      docId: string;
      reason: string;
    }) => {
      const response = await api!.post(`/admin/documents/${docId}/reject/`, {
        reason
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents-queue'] });
      setRejectOpen(false);
      setRejectDocId(null);
      setRejectReason('');
      toast.success('Document rejected');
    },
    onError: () => toast.error('Failed to reject document')
  });

  const columns = useMemo<ColumnDef<DocumentQueueItem>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && 'indeterminate')
            }
            onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
            aria-label='Select all'
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(v) => row.toggleSelected(!!v)}
            aria-label='Select row'
          />
        ),
        enableSorting: false,
        enableHiding: false
      },
      {
        id: 'student_name',
        accessorKey: 'student_name',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Student' />
        ),
        cell: ({ row }) => (
          <span className='font-medium'>
            {row.original.student_name ?? '—'}
          </span>
        )
      },
      {
        id: 'document_type',
        accessorKey: 'document_type',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Document Type' />
        ),
        cell: ({ row }) => (
          <span className='text-sm'>
            {docTypeLabel(row.original.document_type)}
          </span>
        )
      },
      {
        id: 'stage_label',
        accessorKey: 'stage_label',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Stage' />
        ),
        cell: ({ row }) => (
          <span className='text-muted-foreground text-sm'>
            {row.original.stage_label ?? '—'}
          </span>
        )
      },
      {
        accessorKey: 'status',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Status' />
        ),
        cell: ({ row }) => {
          const status = row.getValue('status') as string;
          return (
            <Badge variant={STATUS_BADGE[status] || 'secondary'}>
              {status.replace(/_/g, ' ')}
            </Badge>
          );
        },
        filterFn: (row, id, value) => value.includes(row.getValue(id))
      },
      {
        accessorKey: 'updated_at',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Updated' />
        ),
        cell: ({ row }) => {
          const date = row.getValue('updated_at') as string;
          return (
            <span className='text-muted-foreground text-sm'>
              {format(new Date(date), 'MMM d, yyyy')}
            </span>
          );
        }
      },
      {
        id: 'actions',
        cell: ({ row }) => {
          const doc = row.original;
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
                {doc.document_file && (
                  <DropdownMenuItem asChild>
                    <a
                      href={doc.document_file}
                      target='_blank'
                      rel='noopener noreferrer'
                    >
                      <Eye className='mr-2 h-4 w-4' />
                      View File
                    </a>
                  </DropdownMenuItem>
                )}
                {doc.status === 'UPLOADED' && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => verifyDoc.mutate(doc.id)}
                      disabled={verifyDoc.isPending}
                    >
                      <CheckCircle className='mr-2 h-4 w-4 text-green-600' />
                      Verify
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className='text-destructive focus:text-destructive'
                      onClick={() => {
                        setRejectDocId(doc.id);
                        setRejectOpen(true);
                      }}
                      disabled={rejectDoc.isPending}
                    >
                      <XCircle className='mr-2 h-4 w-4' />
                      Reject
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
        enableSorting: false,
        enableHiding: false
      }
    ],
    [verifyDoc, rejectDoc]
  );

  const table = useReactTable({
    data: data?.results ?? [],
    columns,
    pageCount: data ? Math.ceil(data.count / pagination.pageSize) : -1,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination
    },
    enableRowSelection: true,
    manualPagination: true,
    manualSorting: true,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues()
  });

  if (isLoading) {
    return (
      <div className='space-y-4'>
        <div className='flex items-center gap-2'>
          <Skeleton className='h-8 w-[250px]' />
          <Skeleton className='h-8 w-[100px]' />
        </div>
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className='h-12 w-full' />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className='flex flex-col gap-4'>
        <DataTableToolbar
          table={table}
          globalFilter={globalFilter}
          onGlobalFilterChange={setGlobalFilter}
          searchPlaceholder='Search documents...'
          filters={[
            { columnId: 'status', title: 'Status', options: statusOptions }
          ]}
        />

        <div className='rounded-md border'>
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
                    data-state={row.getIsSelected() && 'selected'}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        onClick={(e) => {
                          if (
                            cell.column.id === 'select' ||
                            cell.column.id === 'actions'
                          )
                            e.stopPropagation();
                        }}
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
                    No documents found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <DataTablePagination table={table} />
      </div>

      {/* Reject Dialog */}
      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Document</DialogTitle>
          </DialogHeader>
          <Textarea
            placeholder='Reason for rejection (required)...'
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={3}
          />
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => {
                setRejectOpen(false);
                setRejectDocId(null);
                setRejectReason('');
              }}
            >
              Cancel
            </Button>
            <Button
              variant='destructive'
              onClick={() => {
                if (rejectDocId) {
                  rejectDoc.mutate({
                    docId: rejectDocId,
                    reason: rejectReason
                  });
                }
              }}
              disabled={!rejectReason.trim() || rejectDoc.isPending}
            >
              {rejectDoc.isPending ? 'Rejecting...' : 'Reject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
