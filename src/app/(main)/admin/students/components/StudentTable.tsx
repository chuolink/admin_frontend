'use client';

import { useMemo, useState } from 'react';
import {
  MaterialReactTable,
  type MRT_ColumnDef,
  type MRT_Cell,
  type MRT_Row,
  MRT_ToggleFiltersButton
} from 'material-react-table';
import {
  Box,
  Button,
  MenuItem,
  ListItemIcon,
  Chip,
  Stack,
  Typography
} from '@mui/material';
import { Edit, Delete, Visibility, Download, Add } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useClientApi from '@/lib/axios/clientSide';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { format, parseISO } from 'date-fns';
import { Student, StudentsResponse } from '@/types/student-details';
import { ColumnFiltersState, SortingState } from '@tanstack/react-table';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useTheme } from 'next-themes';
import { createTheme, ThemeProvider } from '@mui/material/styles';

interface StudentsTableProps {
  onExport?: () => void;
  onAddNew?: () => void;
}

export default function StudentsTable({
  onExport,
  onAddNew
}: StudentsTableProps) {
  const { resolvedTheme } = useTheme();
  const { api } = useClientApi();
  const router = useRouter();
  const queryClient = useQueryClient();

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
    const params: Record<string, any> = {
      page: pagination.pageIndex + 1,
      page_size: pagination.pageSize
    };

    // Add search param
    if (globalFilter) {
      params.search = globalFilter;
    }

    // Add sorting param
    if (sorting.length > 0) {
      params.ordering = sorting
        .map((sort) => (sort.desc ? '-' : '') + sort.id)
        .join(',');
    }

    // Add column filters
    columnFilters.forEach((filter) => {
      const { id, value } = filter;

      // Handle different filter types based on your backend API
      if (id === 'user.is_active') {
        params.is_active = value;
      } else if (id === 'subscription_status') {
        params.subscription_status = value;
      } else if (id === 'subscription_type') {
        // Map the frontend type to backend query param
        if (value === 'standard') {
          params.subscription_status = 'none';
        } else {
          params.subscription_status = value;
        }
      } else if (id === 'reg_prog') {
        if (Array.isArray(value)) {
          params.min_progress = value[0];
          params.max_progress = value[1];
        }
      } else if (id === 'referral_count') {
        if (Array.isArray(value)) {
          params.min_referrals = value[0];
          params.max_referrals = value[1];
        }
      } else if (id === 'user.date_joined') {
        if (Array.isArray(value) && value[0] && value[1]) {
          params.created_after = value[0].toISOString();
          params.created_before = value[1].toISOString();
        }
      } else if (id === 'has_payments') {
        params.has_payments = value;
      } else if (id === 'education_level') {
        params.education_level = value;
      }
    });

    return params;
  }, [columnFilters, globalFilter, sorting, pagination]);

  // Fetch data with server-side filtering
  const { data, isLoading, isFetching } = useQuery<StudentsResponse>({
    queryKey: ['students', queryParams],
    queryFn: async () => {
      if (!api) throw new Error('API not initialized');
      const response = await api.get('/admin/students/', {
        params: queryParams
      });
      return response.data;
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (studentId: string) => {
      if (!api) throw new Error('API not initialized');
      await api.delete(`/admin/students/${studentId}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast.success('Student deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete student');
    }
  });

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Define columns with proper responsive settings
  const columns = useMemo<MRT_ColumnDef<Student>[]>(
    () => [
      {
        accessorKey: 'user_name',
        header: 'Name',
        size: 150,
        minSize: 100,
        maxSize: 200,
        enableColumnFilter: true,
        filterVariant: 'text',
        muiTableHeadCellProps: {
          sx: { minWidth: '100px' }
        },
        muiTableBodyCellProps: {
          sx: { minWidth: '100px' }
        }
      },
      {
        accessorKey: 'user_email',
        header: 'Email',
        size: 200,
        minSize: 150,
        maxSize: 300,
        enableColumnFilter: true,
        filterVariant: 'text',
        muiTableBodyCellProps: {
          sx: {
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            maxWidth: '200px'
          }
        }
      },
      {
        accessorKey: 'user.is_active',
        header: 'Status',
        size: 100,
        enableColumnFilter: true,
        filterVariant: 'checkbox',
        Cell: ({ cell }: { cell: MRT_Cell<Student> }) => (
          <Chip
            label={cell.getValue<boolean>() ? 'Active' : 'Inactive'}
            color={cell.getValue<boolean>() ? 'success' : 'default'}
            size='small'
          />
        )
      },
      {
        id: 'subscription_status',
        accessorFn: (row) => row.subscription.status,
        header: 'Subscription',
        size: 120,
        enableColumnFilter: true,
        filterVariant: 'select',
        filterSelectOptions: [
          { label: 'Active', value: 'active' },
          { label: 'Expired', value: 'expired' },
          { label: 'None', value: 'none' }
        ],
        Cell: ({ row }: { row: MRT_Row<Student> }) => {
          const status = row.original.subscription.status;
          return (
            <Chip
              label={status.charAt(0).toUpperCase() + status.slice(1)}
              color={status === 'active' ? 'success' : 'default'}
              size='small'
            />
          );
        }
      },
      {
        id: 'subscription_type',
        accessorFn: (row) => row.subscription.type,
        header: 'Type',
        size: 100,
        enableColumnFilter: true,
        filterVariant: 'select',
        filterSelectOptions: [
          { label: 'Premium', value: 'premium' },
          { label: 'Standard', value: 'standard' },
          { label: 'Basic', value: 'basic' }
        ],
        Cell: ({ row }: { row: MRT_Row<Student> }) => {
          const type = row.original.subscription.type;
          const colors: Record<string, 'secondary' | 'primary' | 'default'> = {
            premium: 'secondary',
            standard: 'primary',
            basic: 'default'
          };
          return (
            <Chip
              label={type.charAt(0).toUpperCase() + type.slice(1)}
              color={colors[type] || 'default'}
              size='small'
              variant='outlined'
            />
          );
        }
      },
      {
        accessorKey: 'education_level',
        header: 'Education',
        size: 150,
        enableColumnFilter: true,
        filterVariant: 'text',
        Cell: ({ cell }: { cell: MRT_Cell<Student> }) =>
          cell.getValue<string>() || 'Not Set'
      },
      {
        accessorKey: 'reg_prog',
        header: 'Progress',
        size: 100,
        enableColumnFilter: true,
        filterVariant: 'range-slider',
        muiFilterSliderProps: {
          min: 0,
          max: 100,
          step: 10
        },
        Cell: ({ cell }: { cell: MRT_Cell<Student> }) => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{ width: 60, height: 8, bgcolor: '#e5e7eb', borderRadius: 1 }}
            >
              <Box
                sx={{
                  width: `${cell.getValue<number>()}%`,
                  height: '100%',
                  bgcolor: '#3b82f6',
                  borderRadius: 1
                }}
              />
            </Box>
            <Box sx={{ fontSize: '0.875rem', minWidth: '35px' }}>
              {cell.getValue<number>()}%
            </Box>
          </Box>
        )
      },
      {
        accessorKey: 'referral_count',
        header: 'Referrals',
        size: 80,
        enableColumnFilter: true,
        filterVariant: 'range',
        muiFilterTextFieldProps: {
          type: 'number'
        }
      },
      {
        accessorKey: 'user.date_joined',
        header: 'Joined',
        size: 100,
        enableColumnFilter: true,
        filterVariant: 'date-range',
        Cell: ({ cell }: { cell: MRT_Cell<Student> }) => {
          const date = cell.getValue<string>();
          return date ? format(parseISO(date), 'MMM d, yyyy') : 'N/A';
        }
      },
      {
        id: 'has_payments',
        accessorFn: (row) => (row.payments?.total_amount || 0) > 0,
        header: 'Has Payments',
        size: 120,
        enableColumnFilter: true,
        filterVariant: 'checkbox',
        Cell: ({ row }: { row: MRT_Row<Student> }) => {
          const amount = row.original.payments?.total_amount || 0;
          const count = row.original.payments?.total_count || 0;
          return amount > 0 ? (
            <Box>
              <Box sx={{ fontWeight: 500, fontSize: '0.875rem' }}>
                {formatCurrency(amount)}
              </Box>
              <Box sx={{ fontSize: '0.75rem', color: '#6b7280' }}>
                {count} payments
              </Box>
            </Box>
          ) : (
            <Typography variant='body2' color='text.secondary'>
              No payments
            </Typography>
          );
        }
      }
    ],
    []
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
                padding: '8px 16px'
              }
            }
          }
        }
      }),
    [resolvedTheme]
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <ThemeProvider theme={theme}>
        <Box sx={{ width: '100%', overflowX: 'auto' }}>
          <MaterialReactTable
            columns={columns}
            data={data?.results ?? []}
            rowCount={data?.count ?? 0}
            // Server-side operations
            manualFiltering
            manualPagination
            manualSorting
            // State
            state={{
              columnFilters,
              globalFilter,
              isLoading,
              pagination,
              showAlertBanner: false,
              showProgressBars: isFetching,
              sorting
            }}
            // State setters
            onColumnFiltersChange={setColumnFilters}
            onGlobalFilterChange={setGlobalFilter}
            onPaginationChange={setPagination}
            onSortingChange={setSorting}
            // Features
            enableColumnFilters
            enableGlobalFilter
            enablePagination
            enableSorting
            enableRowActions
            enableRowSelection
            positionActionsColumn='last'
            enableDensityToggle={false}
            enableFullScreenToggle
            enableColumnResizing
            enableStickyHeader
            enableColumnPinning
            // Layout
            layoutMode='grid'
            // Custom toolbar
            renderTopToolbar={({ table }) => (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  p: 2,
                  flexWrap: 'wrap',
                  gap: 2
                }}
              >
                <Stack direction='row' spacing={1} flexWrap='wrap' useFlexGap>
                  <MRT_ToggleFiltersButton table={table} />
                  {onExport && (
                    <Button
                      variant='outlined'
                      onClick={onExport}
                      startIcon={<Download />}
                      size='small'
                    >
                      Export
                    </Button>
                  )}
                  {onAddNew && (
                    <Button
                      variant='contained'
                      onClick={onAddNew}
                      startIcon={<Add />}
                      size='small'
                    >
                      Add Student
                    </Button>
                  )}
                </Stack>
              </Box>
            )}
            // Row actions
            renderRowActionMenuItems={({ row, closeMenu }) => [
              <MenuItem
                key='view'
                onClick={() => {
                  router.push(`/admin/students/${row.original.id}`);
                  closeMenu();
                }}
              >
                <ListItemIcon>
                  <Visibility />
                </ListItemIcon>
                View Details
              </MenuItem>,
              <MenuItem
                key='edit'
                onClick={() => {
                  router.push(`/admin/students/${row.original.id}/edit`);
                  closeMenu();
                }}
              >
                <ListItemIcon>
                  <Edit />
                </ListItemIcon>
                Edit
              </MenuItem>,
              <MenuItem
                key='delete'
                onClick={() => {
                  if (
                    confirm(
                      `Are you sure you want to delete ${row.original.user_name}?`
                    )
                  ) {
                    deleteMutation.mutate(row.original.id.toString());
                  }
                  closeMenu();
                }}
                sx={{ color: 'error.main' }}
              >
                <ListItemIcon>
                  <Delete color='error' />
                </ListItemIcon>
                Delete
              </MenuItem>
            ]}
            // Pagination options
            muiPaginationProps={{
              rowsPerPageOptions: [10, 25, 50, 100],
              showFirstButton: true,
              showLastButton: true
            }}
            // Initial state
            initialState={{
              density: 'compact',
              columnVisibility: {
                education_level: false
              },
              columnPinning: {
                left: ['mrt-row-select', 'user_name'],
                right: ['mrt-row-actions']
              }
            }}
            // Display column options
            displayColumnDefOptions={{
              'mrt-row-select': {
                size: 50,
                muiTableHeadCellProps: {
                  align: 'center'
                },
                muiTableBodyCellProps: {
                  align: 'center'
                }
              },
              'mrt-row-actions': {
                header: 'Actions',
                size: 100,
                muiTableHeadCellProps: {
                  align: 'center'
                },
                muiTableBodyCellProps: {
                  align: 'center'
                }
              }
            }}
            // Container styling
            muiTableContainerProps={{
              sx: {
                maxHeight: 'calc(100vh - 400px)',
                minHeight: '400px',
                '&::-webkit-scrollbar': {
                  height: '10px',
                  width: '10px'
                },
                '&::-webkit-scrollbar-track': {
                  background: 'rgba(0,0,0,0.1)'
                },
                '&::-webkit-scrollbar-thumb': {
                  background: 'rgba(0,0,0,0.5)',
                  borderRadius: '5px'
                }
              }
            }}
            // Table styling
            muiTableProps={{
              sx: {
                tableLayout: 'fixed'
              }
            }}
            // Paper styling
            muiTablePaperProps={{
              sx: {
                boxShadow: 'none',
                border: '1px solid rgba(0,0,0,0.1)'
              }
            }}
          />
        </Box>
      </ThemeProvider>
    </LocalizationProvider>
  );
}
