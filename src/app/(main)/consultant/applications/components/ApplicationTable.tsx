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
  useTheme as useMuiTheme,
  TextField,
  InputAdornment
} from '@mui/material';
import { Edit, Visibility, Download, Search } from '@mui/icons-material';
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
import { ConsultantApplication } from '@/types/consultant';

export default function ApplicationTable() {
  const { resolvedTheme } = useTheme();
  const { api } = useClientApi();
  const router = useRouter();
  const queryClient = useQueryClient();
  const muiTheme = useMuiTheme();

  // Responsive checks
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTablet = useMediaQuery('(max-width: 1024px)');

  // State for server-side operations
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 15 // Reduced from 25 for faster loading
  });
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('');

  // Simplified query params for better performance
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

    // Simplified column filters
    columnFilters.forEach((filter) => {
      if (filter.id === 'status') {
        params[filter.id] = filter.value as string;
      } else if (filter.id === 'application.university.name') {
        params['university'] = filter.value as string;
      } else if (filter.id === 'student_name') {
        params['student'] = filter.value as string;
      }
    });

    if (paymentStatusFilter === 'not_paid') {
      params['not_paid'] = 'true';
    } else if (paymentStatusFilter === 'paid') {
      params['not_paid'] = 'false';
    }
    return params;
  }, [columnFilters, globalFilter, sorting, pagination, paymentStatusFilter]);

  // Fetch data with server-side filtering - Optimized for performance
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['consultant-applications', queryParams],
    queryFn: async () => {
      if (!api) throw new Error('API not initialized');
      const response = await api.get('/consultant/application/', {
        params: queryParams
      });
      return response.data;
    },
    staleTime: 30000, // Cache for 30 seconds to reduce requests
    refetchOnWindowFocus: false // Prevent unnecessary refetches
  });

  // Define columns with responsive sizing
  const columns = useMemo<MRT_ColumnDef<ConsultantApplication>[]>(
    () => [
      {
        accessorKey: 'application.app_id',
        header: 'ID',
        size: isMobile ? 80 : 100,
        maxSize: 100,
        minSize: 80,
        enableColumnFilter: false,
        enableHiding: false
      },
      {
        id: 'student_name',
        header: 'Student',
        size: isMobile ? 150 : 200,
        maxSize: 250,
        minSize: 150,
        enableColumnFilter: true,
        filterVariant: 'text',
        filterFn: 'contains',
        enableHiding: false,
        accessorFn: (row) =>
          `${row.application.student.user.first_name} ${row.application.student.user.last_name}`,
        Cell: ({ row }) => (
          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant='body2'
              fontWeight='medium'
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {`${row.original.application.student.user.first_name} ${row.original.application.student.user.last_name}`}
            </Typography>
            <Typography
              variant='caption'
              color='text.secondary'
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                display: 'block'
              }}
            >
              {row.original.application.student.user.email}
            </Typography>
          </Box>
        )
      },
      {
        accessorKey: 'application.university.name',
        header: 'University',
        size: isMobile ? 120 : 180,
        maxSize: 200,
        minSize: 120,
        enableColumnFilter: true,
        filterVariant: 'text',
        filterFn: 'contains',
        Cell: ({ cell }) => {
          const universityName = cell.getValue<string>();
          return (
            <Box
              title={universityName}
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {universityName}
            </Box>
          );
        }
      },

      {
        accessorKey: 'status',
        header: 'Status',
        size: isMobile ? 100 : 120,
        maxSize: 130,
        minSize: 100,
        filterVariant: 'select',
        filterSelectOptions: [
          'PENDING',
          'APPROVED',
          'REJECTED',
          'WAITING',
          'COMPLETED'
        ],
        Cell: ({ cell }) => {
          const status = cell.getValue<string>();
          const color = {
            PENDING: 'warning',
            APPROVED: 'success',
            REJECTED: 'error',
            WAITING: 'info',
            COMPLETED: 'success'
          }[status] as 'warning' | 'success' | 'error' | 'info';
          return (
            <Chip
              label={status}
              color={color}
              size='small'
              sx={{
                fontSize: isMobile ? '10px' : '12px',
                height: isMobile ? 20 : 24
              }}
            />
          );
        }
      },
      {
        accessorKey: 'paid_fee',
        header: 'Fee',
        size: isMobile ? 80 : 110,
        maxSize: 120,
        minSize: 80,
        enableColumnFilter: false,
        enableSorting: false,
        Cell: ({ cell }) => {
          const paid = cell.getValue<boolean>();
          return paid ? (
            <Chip
              label='Paid'
              color='success'
              size='small'
              sx={{
                fontSize: isMobile ? '10px' : '11px',
                height: isMobile ? 18 : 22
              }}
            />
          ) : (
            <Chip
              label='Not Paid'
              color='error'
              size='small'
              sx={{
                fontSize: isMobile ? '10px' : '11px',
                height: isMobile ? 18 : 22
              }}
            />
          );
        }
      },
      {
        accessorKey: 'created_at',
        header: 'Date',
        size: isMobile ? 100 : 120,
        maxSize: 130,
        minSize: 100,
        enableColumnFilter: false, // Disabled for performance
        Cell: ({ cell }) => {
          const date = cell.getValue<string>();
          return (
            <Typography
              variant='body2'
              sx={{ fontSize: isMobile ? '11px' : '14px' }}
            >
              {format(new Date(date), isMobile ? 'M/d/yy' : 'MMM d, yyyy')}
            </Typography>
          );
        }
      },
      {
        id: 'consultant_name',
        header: 'Consultant',
        size: isMobile ? 140 : 180,
        maxSize: 200,
        minSize: 140,
        enableColumnFilter: false,
        enableSorting: false,
        accessorFn: (row: ConsultantApplication) => {
          if (
            row.consultant &&
            typeof row.consultant === 'object' &&
            (row.consultant as any).user
          ) {
            const user = (row.consultant as any).user;
            return `${user.first_name || ''} ${user.middle_name || ''} ${user.last_name || ''}`.trim();
          }
          return '';
        },
        Cell: ({ row }: { row: { original: ConsultantApplication } }) => {
          const user = (row.original.consultant as any)?.user;
          if (!user) return '';
          return (
            <Box sx={{ minWidth: 0 }}>
              <Typography
                variant='body2'
                fontWeight='medium'
                sx={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  fontSize: isMobile ? '11px' : '14px'
                }}
              >
                {`${user.first_name || ''} ${user.middle_name || ''} ${user.last_name || ''}`.trim()}
              </Typography>
              <Typography
                variant='caption'
                color='text.secondary'
                sx={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  display: 'block',
                  fontSize: isMobile ? '10px' : '12px'
                }}
              >
                {user.email}
              </Typography>
            </Box>
          );
        }
      },
      {
        id: 'payment_status',
        header: 'Payment',
        size: isMobile ? 90 : 120,
        maxSize: 130,
        minSize: 90,
        enableColumnFilter: false,
        Cell: ({ row }) => {
          const payment = row.original.payment;
          if (!payment) {
            return (
              <Chip
                label='Not Submitted'
                color='warning'
                size='small'
                sx={{
                  fontSize: isMobile ? '9px' : '11px',
                  height: isMobile ? 18 : 22,
                  minWidth: 0,
                  px: 0.5
                }}
              />
            );
          }
          const status = payment.status as
            | 'pending'
            | 'success'
            | 'failed'
            | 'cancelled';
          const colorMap: Record<
            typeof status,
            'warning' | 'success' | 'error'
          > = {
            pending: 'warning',
            success: 'success',
            failed: 'error',
            cancelled: 'error'
          };
          return (
            <Chip
              label={status.charAt(0).toUpperCase() + status.slice(1)}
              color={colorMap[status] || 'warning'}
              size='small'
              sx={{
                fontSize: isMobile ? '9px' : '11px',
                height: isMobile ? 18 : 22,
                minWidth: 0,
                px: 0.5
              }}
            />
          );
        }
      }
    ],
    [isMobile, isTablet]
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
                padding: isMobile ? '4px 8px' : '8px 16px',
                fontSize: isMobile ? '12px' : '14px'
              }
            }
          }
        }
      }),
    [resolvedTheme, isMobile]
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <ThemeProvider theme={theme}>
        <Box
          sx={{
            width: '100%',
            height: '100%',
            '& .MuiPaper-root': {
              width: '100%',
              overflow: 'hidden'
            }
          }}
        >
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
            // Features - Simplified for better performance
            enableColumnFilters={!isMobile} // Disabled on mobile
            enableGlobalFilter
            enablePagination
            enableSorting={!isMobile} // Disabled on mobile for performance
            enableRowActions
            enableRowSelection={false} // Disabled for performance
            positionActionsColumn='last'
            enableDensityToggle={false}
            enableFullScreenToggle={false}
            enableColumnResizing={false} // Disabled for performance
            enableStickyHeader={!isMobile} // Only on desktop
            enableColumnPinning={false} // Disabled for performance
            enableHiding={false} // Disabled for performance
            // Layout - Important for responsive
            layoutMode={isMobile ? 'semantic' : 'grid'}
            // Custom toolbar - Simplified
            renderTopToolbar={({ table }) => (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  p: 1.5,
                  flexDirection: isMobile ? 'column' : 'row',
                  gap: 1
                }}
              >
                <Stack
                  direction={isMobile ? 'column' : 'row'}
                  spacing={1}
                  sx={{ width: isMobile ? '100%' : 'auto' }}
                >
                  <TextField
                    select
                    label='Payment Status'
                    value={paymentStatusFilter}
                    onChange={(e) => setPaymentStatusFilter(e.target.value)}
                    size='small'
                    sx={{ minWidth: 140, width: isMobile ? '100%' : 'auto' }}
                  >
                    <MenuItem value=''>All</MenuItem>
                    <MenuItem value='not_paid'>Not Paid</MenuItem>
                    <MenuItem value='paid'>Paid</MenuItem>
                  </TextField>
                </Stack>
                <Box
                  sx={{
                    minWidth: isMobile ? '100%' : '250px',
                    mt: isMobile ? 1 : 0
                  }}
                >
                  <TextField
                    placeholder='Search...'
                    value={globalFilter ?? ''}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                    size='small'
                    fullWidth
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position='start'>
                          <Search />
                        </InputAdornment>
                      )
                    }}
                  />
                </Box>
              </Box>
            )}
            // Row actions
            renderRowActionMenuItems={({ row, closeMenu }) => [
              <MenuItem
                key='edit'
                onClick={() => {
                  router.push(
                    `/consultant/applications/${row.original.id}/edit`
                  );
                  closeMenu();
                }}
              >
                <ListItemIcon>
                  <Edit />
                </ListItemIcon>
                Edit
              </MenuItem>
            ]}
            // Pagination options - Simplified
            muiPaginationProps={{
              rowsPerPageOptions: [15, 30, 50],
              showFirstButton: false,
              showLastButton: false
            }}
            // Initial state - Simplified for performance
            initialState={{
              density: 'compact',
              pagination: { pageSize: 15, pageIndex: 0 }
            }}
            // Display column options - Simplified
            displayColumnDefOptions={{
              'mrt-row-actions': {
                header: 'Actions',
                size: 80
              }
            }}
            // Container styling - Key for responsive behavior
            muiTableContainerProps={{
              sx: {
                maxHeight: isMobile ? '60vh' : '70vh',
                minHeight: isMobile ? 300 : 400,
                width: '100%',
                overflowX: 'auto',
                overflowY: 'auto',
                // Enhanced scrollbar styling
                '&::-webkit-scrollbar': {
                  height: '12px',
                  width: '12px'
                },
                '&::-webkit-scrollbar-track': {
                  background: 'rgba(0,0,0,0.05)',
                  borderRadius: '6px'
                },
                '&::-webkit-scrollbar-thumb': {
                  background: 'rgba(0,0,0,0.2)',
                  borderRadius: '6px',
                  '&:hover': {
                    background: 'rgba(0,0,0,0.3)'
                  }
                },
                // Force scrollbar visibility on mobile
                '@media (max-width: 768px)': {
                  '&::-webkit-scrollbar': {
                    height: '8px',
                    width: '8px'
                  }
                }
              }
            }}
            // Table styling - Reduced minimum width after removing course column
            muiTableProps={{
              sx: {
                width: '100%',
                minWidth: isMobile ? '600px' : '900px', // Reduced from 800px/1200px
                tableLayout: 'fixed'
              }
            }}
            // Paper styling
            muiTablePaperProps={{
              sx: {
                boxShadow: 'none',
                border: '1px solid rgba(0,0,0,0.1)',
                width: '100%',
                maxWidth: '100%',
                overflow: 'hidden'
              }
            }}
          />
        </Box>
      </ThemeProvider>
    </LocalizationProvider>
  );
}
