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
      } else if (filter.id === 'application.university.name') {
        params['application__university__name__icontains'] =
          filter.value as string;
      } else if (filter.id === 'course_name') {
        params['application__courses__name'] = filter.value as string;
      } else if (filter.id === 'student_name') {
        params['application__student__user__first_name__icontains'] =
          filter.value as string;
      } else if (filter.id === 'created_at') {
        const dateRange = filter.value as [string, string];
        if (dateRange[0]) params.created_at__gte = dateRange[0];
        if (dateRange[1]) params.created_at__lte = dateRange[1];
      }
    });

    return params;
  }, [columnFilters, globalFilter, sorting, pagination]);

  // Fetch data with server-side filtering
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['consultant-applications', queryParams],
    queryFn: async () => {
      if (!api) throw new Error('API not initialized');
      const response = await api.get('/consultant/application/', {
        params: queryParams
      });
      return response.data;
    }
  });

  // Define columns with consistent sizing
  const columns = useMemo<MRT_ColumnDef<ConsultantApplication>[]>(
    () => [
      {
        accessorKey: 'application.app_id',
        header: 'ID',
        size: 100,
        enableColumnFilter: false
      },
      {
        id: 'student_name',
        header: 'Student',
        size: 150,
        enableColumnFilter: true,
        filterVariant: 'text',
        filterFn: 'contains',
        accessorFn: (row) =>
          `${row.application.student.user.first_name} ${row.application.student.user.last_name}`,
        Cell: ({ row }) => (
          <Box>
            <Typography variant='body2' fontWeight='medium'>
              {`${row.original.application.student.user.first_name} ${row.original.application.student.user.last_name}`}
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              {row.original.application.student.user.email}
            </Typography>
          </Box>
        )
      },
      {
        accessorKey: 'application.university.name',
        header: 'University',
        size: 150,
        enableColumnFilter: true,
        filterVariant: 'text',
        filterFn: 'contains',
        Cell: ({ cell }) => {
          const universityName = cell.getValue<string>();
          return <Box title={universityName}>{universityName}</Box>;
        }
      },
      {
        accessorKey: 'application.courses',
        header: 'Course',
        size: 150,
        enableColumnFilter: true,
        Cell: ({ row }) => {
          const courses = row.original.application.courses;
          if (!courses || courses.length === 0) return 'No courses';
          return courses[0].name;
        }
      },
      {
        accessorKey: 'status',
        header: 'Status',
        size: 100,
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
              className='capitalize'
            />
          );
        }
      },
      // Paid Fee column
      {
        accessorKey: 'paid_fee',
        header: 'Processing Fee',
        size: 120,
        enableColumnFilter: false,
        enableSorting: false,
        Cell: ({ cell }) => {
          const paid = cell.getValue<boolean>();
          return paid ? (
            <Chip label='Paid' color='success' size='small' />
          ) : (
            <Chip label='Not Paid' color='error' size='small' />
          );
        }
      },
      {
        accessorKey: 'created_at',
        header: 'Date',
        size: 120,
        filterVariant: 'date-range',
        Cell: ({ cell }) => {
          const date = cell.getValue<string>();
          return format(new Date(date), 'MMM d, yyyy');
        }
      },
      // Consultant Name column
      {
        id: 'consultant_name',
        header: 'Consultant',
        size: 180,
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
            <Box>
              <Typography variant='body2' fontWeight='medium'>
                {`${user.first_name || ''} ${user.middle_name || ''} ${user.last_name || ''}`.trim()}
              </Typography>
              <Typography variant='caption' color='text.secondary'>
                {user.email}
              </Typography>
            </Box>
          );
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
                  <Button
                    variant='outlined'
                    onClick={() =>
                      window.open(
                        '/admin/consultant-applications/applications/export',
                        '_blank'
                      )
                    }
                    startIcon={<Download />}
                    size='small'
                  >
                    Export
                  </Button>
                </Stack>
                <Box sx={{ minWidth: '300px' }}>
                  <TextField
                    placeholder='Search all columns...'
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
                    `/admin/consultant-applications/${row.original.id}/edit`
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
            // Pagination options
            muiPaginationProps={{
              rowsPerPageOptions: [10, 25, 50, 100],
              showFirstButton: true,
              showLastButton: true
            }}
            // Initial state
            initialState={{
              density: 'compact',
              columnPinning: {
                left: ['mrt-row-select', 'application.student.user.first_name'],
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
                width: '100%',
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
                tableLayout: 'fixed',
                width: '100%'
              }
            }}
            // Paper styling
            muiTablePaperProps={{
              sx: {
                boxShadow: 'none',
                border: '1px solid rgba(0,0,0,0.1)',
                width: '100%'
              }
            }}
          />
        </Box>
      </ThemeProvider>
    </LocalizationProvider>
  );
}
