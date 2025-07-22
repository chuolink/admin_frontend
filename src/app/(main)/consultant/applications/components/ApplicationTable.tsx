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

  // Build query params - each column filter maps to specific backend parameter
  const queryParams = useMemo(() => {
    const params: Record<string, string> = {};

    // Global search using the 'search' parameter for global search bar
    if (globalFilter) {
      params.search = globalFilter;
    }

    // Sorting - map frontend column IDs to backend field names
    if (sorting.length > 0) {
      params.ordering = sorting
        .map((sort) => {
          let fieldName = sort.id;

          // Map frontend column IDs to backend field names for sorting
          switch (sort.id) {
            case 'student_name':
              fieldName = 'application__student__user__first_name';
              break;
            case 'university':
              fieldName = 'application__university__name';
              break;
            case 'application.app_id':
              fieldName = 'application__app_id';
              break;
            default:
              fieldName = sort.id;
          }

          return sort.desc ? `-${fieldName}` : fieldName;
        })
        .join(',');
    }

    params.page = String(pagination.pageIndex + 1);
    params.limit = String(pagination.pageSize);

    // Individual column filters - each maps to its specific backend filter
    columnFilters.forEach((filter) => {
      if (filter.value) {
        switch (filter.id) {
          case 'status':
            // Status filter - exact match
            params.status = filter.value as string;
            break;
          case 'student_name':
            // Student name filter - searches first name OR last name
            params.student_name = filter.value as string;
            break;
          case 'university':
            // University filter - case insensitive contains
            params.university = filter.value as string;
            break;
          case 'course_name':
            // Course name filter - case insensitive contains
            params.course_name = filter.value as string;
            break;
          case 'created_at':
            // Date range filter
            const dateRange = filter.value as [string, string];
            if (dateRange[0]) params.created_at__gte = dateRange[0];
            if (dateRange[1]) params.created_at__lte = dateRange[1];
            break;
        }
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
    },
    placeholderData: (prev) => prev
  });

  // Define columns - each column filter only searches within that specific column
  const columns = useMemo<MRT_ColumnDef<ConsultantApplication>[]>(
    () => [
      {
        accessorKey: 'application.app_id',
        header: 'Application ID',
        size: 120,
        enableColumnFilter: false, // ID doesn't need filtering usually
        enableSorting: true
      },
      {
        id: 'student_name', // This maps to backend 'student_name' filter
        header: 'Student Name',
        size: 180,
        enableColumnFilter: true,
        filterVariant: 'text',
        enableSorting: true,
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
        ),
        // Custom filter placeholder
        muiColumnFilterTextFieldProps: {
          placeholder: 'Search student name...'
        }
      },
      {
        id: 'university', // This maps to backend 'university' filter
        accessorKey: 'application.university.name',
        header: 'University',
        size: 200,
        enableColumnFilter: true,
        filterVariant: 'text',
        enableSorting: true,
        Cell: ({ cell }) => {
          const universityName = cell.getValue<string>();
          return <Box title={universityName}>{universityName}</Box>;
        },
        muiColumnFilterTextFieldProps: {
          placeholder: 'Search university...'
        }
      },
      {
        id: 'course_name', // This maps to backend 'course_name' filter
        accessorKey: 'application.courses',
        header: 'Course',
        size: 180,
        enableColumnFilter: true,
        filterVariant: 'text',
        enableSorting: false,
        Cell: ({ row }) => {
          const courses = row.original.application.courses;
          if (!courses || courses.length === 0) return 'No courses';
          return courses[0].name;
        },
        muiColumnFilterTextFieldProps: {
          placeholder: 'Search course...'
        }
      },
      {
        accessorKey: 'status',
        header: 'Status',
        size: 120,
        filterVariant: 'select',
        filterSelectOptions: [
          { value: 'PENDING', text: 'Pending' },
          { value: 'APPROVED', text: 'Approved' },
          { value: 'REJECTED', text: 'Rejected' },
          { value: 'WAITING', text: 'Waiting' },
          { value: 'COMPLETED', text: 'Completed' }
        ],
        enableSorting: true,
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
        header: 'Created Date',
        size: 140,
        filterVariant: 'date-range',
        enableSorting: true,
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
                      window.open('/consultant/applications/export', '_blank')
                    }
                    startIcon={<Download />}
                    size='small'
                  >
                    Export
                  </Button>
                </Stack>
                <Box sx={{ minWidth: '300px' }}>
                  <TextField
                    placeholder='Global search across all fields...'
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
                left: ['mrt-row-select'],
                right: ['mrt-row-actions']
              },
              showColumnFilters: true // Show column filters by default
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
