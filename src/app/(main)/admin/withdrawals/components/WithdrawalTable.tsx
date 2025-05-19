'use client';

import { useMemo, useState } from 'react';
import {
  MaterialReactTable,
  type MRT_ColumnDef,
  MRT_ToggleFiltersButton
} from 'material-react-table';
import {
  Box,
  Button,
  MenuItem,
  ListItemIcon,
  Chip,
  Stack,
  Typography,
  useMediaQuery,
  useTheme as useMuiTheme
} from '@mui/material';
import { Edit, Delete, Visibility, Download, Add } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useClientApi from '@/lib/axios/clientSide';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ColumnFiltersState, SortingState } from '@tanstack/react-table';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useTheme } from 'next-themes';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Withdrawal } from '@/types/withdrawal';

interface WithdrawalTableProps {
  onExport?: () => void;
  onAddNew?: () => void;
}

export default function WithdrawalTable({
  onExport,
  onAddNew
}: WithdrawalTableProps) {
  const { resolvedTheme } = useTheme();
  const { api } = useClientApi();
  const router = useRouter();
  const queryClient = useQueryClient();
  const muiTheme = useMuiTheme();

  // Responsive check
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm'));

  // State for server-side operations
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 25
  });

  // Build query params from table state
  const queryParams = useMemo(() => {
    const params: Record<string, string> = {};

    if (globalFilter) {
      params.search = globalFilter;
    }

    if (sorting.length > 0) {
      params.ordering = sorting
        .map((sort) => (sort.desc ? `-${sort.id}` : sort.id))
        .join(',');
    }

    params.page = String(pagination.pageIndex + 1);
    params.limit = String(pagination.pageSize);

    columnFilters.forEach((filter) => {
      if (filter.id === 'status') {
        params[filter.id] = filter.value as string;
      } else if (filter.id === 'type') {
        params[filter.id] = filter.value as string;
      } else if (filter.id === 'created_at') {
        const dateRange = filter.value as [string, string];
        if (dateRange[0]) params.created_after = dateRange[0];
        if (dateRange[1]) params.created_before = dateRange[1];
      }
    });

    return params;
  }, [columnFilters, globalFilter, sorting, pagination]);

  // Fetch data with server-side filtering
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['withdrawals', queryParams],
    queryFn: async () => {
      if (!api) throw new Error('API not initialized');
      const response = await api.get('/admin/withdrawals/', {
        params: queryParams
      });
      return response.data;
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (withdrawalId: string) => {
      if (!api) throw new Error('API not initialized');
      await api.delete(`/admin/withdrawals/${withdrawalId}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['withdrawals'] });
      toast.success('Withdrawal deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete withdrawal');
    }
  });

  // Define columns with consistent sizing
  const columns = useMemo<MRT_ColumnDef<Withdrawal>[]>(
    () => [
      {
        accessorKey: 'id',
        header: 'ID',
        size: 150,
        enableColumnFilter: false
      },
      {
        accessorKey: 'user',
        header: 'User',
        size: 250,
        enableColumnFilter: true,
        filterFn: 'contains',
        Cell: ({ row }) => (
          <Box>
            <Typography variant='body2' fontWeight='medium'>
              {row.original.student?.name ||
                `${row.original.user.first_name} ${row.original.user.last_name}`}
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              {row.original.student?.email || row.original.user.email}
            </Typography>
          </Box>
        )
      },
      {
        accessorKey: 'amount',
        header: 'Amount',
        size: 150,
        enableColumnFilter: false,
        Cell: ({ cell }) => {
          const amount = cell.getValue<number>();
          return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'TZS'
          }).format(amount);
        }
      },
      {
        accessorKey: 'type',
        header: 'Type',
        size: 120,
        filterVariant: 'select',
        filterSelectOptions: ['deposit', 'payment'],
        Cell: ({ cell }) => {
          const type = cell.getValue<string>();
          return (
            <Chip
              label={type}
              color='primary'
              size='small'
              className='capitalize'
            />
          );
        }
      },
      {
        accessorKey: 'status',
        header: 'Status',
        size: 120,
        filterVariant: 'select',
        filterSelectOptions: ['pending', 'success', 'failed'],
        Cell: ({ cell }) => {
          const status = cell.getValue<string>();
          const color = {
            pending: 'warning',
            success: 'success',
            failed: 'error'
          }[status] as 'warning' | 'success' | 'error';
          return (
            <Chip
              label={status}
              color={color}
              size='small'
              className='capitalize'
            />
          );
        }
      },
      {
        accessorKey: 'created_at',
        header: 'Date',
        size: 150,
        filterVariant: 'date-range',
        Cell: ({ cell }) => {
          const date = cell.getValue<string>();
          return format(new Date(date), 'MMM d, yyyy');
        }
      }
    ],
    [isMobile]
  );

  // Create MUI theme based on next-themes
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: resolvedTheme === 'dark' ? 'dark' : 'light'
        },
        components: {
          MuiPaper: {
            styleOverrides: {
              root: {
                backgroundImage: 'none'
              }
            }
          },
          MuiTableCell: {
            styleOverrides: {
              root: {
                borderColor:
                  resolvedTheme === 'dark'
                    ? 'rgba(255, 255, 255, 0.1)'
                    : 'rgba(0, 0, 0, 0.1)'
              }
            }
          }
        }
      }),
    [resolvedTheme]
  );

  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <MaterialReactTable
          columns={columns}
          data={data?.results ?? []}
          enableColumnFilters
          enableGlobalFilter
          enableRowActions
          enableRowSelection
          enableMultiRowSelection
          enableColumnResizing
          enableColumnDragging
          enableColumnOrdering
          enablePagination
          enableSorting
          manualFiltering
          manualPagination
          manualSorting
          rowCount={data?.count ?? 0}
          onColumnFiltersChange={setColumnFilters}
          onGlobalFilterChange={setGlobalFilter}
          onPaginationChange={setPagination}
          onSortingChange={setSorting}
          state={{
            columnFilters,
            globalFilter,
            pagination,
            sorting,
            isLoading,
            showProgressBars: isFetching
          }}
          layoutMode='grid'
          muiTablePaperProps={{
            elevation: 0,
            sx: {
              borderRadius: '0.5rem',
              border: '1px solid',
              borderColor:
                resolvedTheme === 'dark'
                  ? 'rgba(255, 255, 255, 0.1)'
                  : 'rgba(0, 0, 0, 0.1)',
              width: '100%'
            }
          }}
          muiTableContainerProps={{
            sx: {
              width: '100%'
            }
          }}
          muiTableHeadCellProps={{
            sx: {
              fontWeight: 'bold',
              fontSize: '0.875rem'
            }
          }}
          muiTableBodyCellProps={{
            sx: {
              fontSize: '0.875rem'
            }
          }}
          renderRowActions={({ row }) => (
            <Stack direction='row' spacing={1}>
              <Button
                size='small'
                onClick={() =>
                  router.push(`/admin/withdrawals/${row.original.id}`)
                }
              >
                <Visibility fontSize='small' />
              </Button>
              <Button
                size='small'
                onClick={() =>
                  router.push(`/admin/withdrawals/${row.original.id}/edit`)
                }
              >
                <Edit fontSize='small' />
              </Button>
              <Button
                size='small'
                color='error'
                onClick={() => deleteMutation.mutate(row.original.id)}
              >
                <Delete fontSize='small' />
              </Button>
            </Stack>
          )}
          renderTopToolbar={({ table }) => (
            <Box sx={{ p: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
              <Button
                variant='contained'
                startIcon={<Add />}
                onClick={onAddNew}
              >
                Add New
              </Button>
              <Button
                variant='outlined'
                startIcon={<Download />}
                onClick={onExport}
              >
                Export
              </Button>
              <MRT_ToggleFiltersButton table={table} />
            </Box>
          )}
        />
      </LocalizationProvider>
    </ThemeProvider>
  );
}
