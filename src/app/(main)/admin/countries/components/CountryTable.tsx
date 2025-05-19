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
  Chip,
  Stack,
  Typography,
  useMediaQuery,
  useTheme as useMuiTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { Edit, Delete, Visibility, Download, Add } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { ColumnFiltersState, SortingState } from '@tanstack/react-table';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useTheme } from 'next-themes';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { ICountry } from '@/models/Country';
import axios from 'axios';
import { toast } from 'sonner';

interface CountryTableProps {
  data: ICountry[];
  isLoading: boolean;
  onExport?: () => void;
  onAddNew?: () => void;
}

export default function CountryTable({
  data,
  isLoading,
  onExport,
  onAddNew
}: CountryTableProps) {
  const { resolvedTheme } = useTheme();
  const router = useRouter();
  const muiTheme = useMuiTheme();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [countryToDelete, setCountryToDelete] = useState<ICountry | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleDeleteClick = (country: ICountry) => {
    setCountryToDelete(country);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!countryToDelete) return;

    try {
      setIsDeleting(true);
      await axios.delete(`/api/countries?id=${countryToDelete._id}`);
      toast.success('Country deleted successfully');
      // Refresh the page to update the table
      router.refresh();
    } catch (error) {
      console.error('Error deleting country:', error);
      toast.error('Failed to delete country');
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setCountryToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setCountryToDelete(null);
  };

  // Define columns with consistent sizing
  const columns = useMemo<MRT_ColumnDef<ICountry>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
        size: 200,
        enableColumnFilter: true,
        filterFn: 'contains'
      },
      {
        accessorKey: 'slug',
        header: 'Slug',
        size: 150,
        enableColumnFilter: true,
        filterFn: 'contains'
      },
      {
        accessorKey: 'description',
        header: 'Description',
        size: 300,
        enableColumnFilter: true,
        filterFn: 'contains',
        Cell: ({ cell }) => (
          <Typography
            variant='body2'
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical'
            }}
          >
            {cell.getValue<string>()}
          </Typography>
        )
      },
      {
        accessorKey: 'benefits',
        header: 'Benefits',
        size: 100,
        enableColumnFilter: false,
        Cell: ({ cell }) => (
          <Chip
            label={`${cell.getValue<any[]>().length} benefits`}
            size='small'
          />
        )
      },
      {
        accessorKey: 'faqs',
        header: 'FAQs',
        size: 100,
        enableColumnFilter: false,
        Cell: ({ cell }) => (
          <Chip label={`${cell.getValue<any[]>().length} FAQs`} size='small' />
        )
      },
      {
        accessorKey: 'testimonials',
        header: 'Testimonials',
        size: 100,
        enableColumnFilter: false,
        Cell: ({ cell }) => (
          <Chip
            label={`${cell.getValue<any[]>().length} testimonials`}
            size='small'
          />
        )
      },
      {
        accessorKey: 'createdAt',
        header: 'Created At',
        size: 150,
        filterVariant: 'date-range',
        Cell: ({ cell }) => {
          const date = cell.getValue<string>();
          return format(new Date(date), 'MMM d, yyyy');
        }
      },
      {
        id: 'actions',
        header: 'Actions',
        size: 150,
        enableColumnFilter: false,
        enableSorting: false,
        Cell: ({ row }) => (
          <Stack direction='row' spacing={1}>
            <Button
              size='small'
              onClick={() =>
                router.push(`/admin/countries/${row.original._id}`)
              }
            >
              <Visibility fontSize='small' />
            </Button>
            <Button
              size='small'
              color='error'
              onClick={() => handleDeleteClick(row.original)}
            >
              <Delete fontSize='small' />
            </Button>
          </Stack>
        )
      }
    ],
    [isMobile, router, handleDeleteClick]
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
          data={data}
          enableColumnFilters
          enableGlobalFilter
          enableRowActions={false}
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
          onColumnFiltersChange={setColumnFilters}
          onGlobalFilterChange={setGlobalFilter}
          onPaginationChange={setPagination}
          onSortingChange={setSorting}
          state={{
            columnFilters,
            globalFilter,
            pagination,
            sorting,
            isLoading
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

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={handleDeleteCancel}
          aria-labelledby='delete-dialog-title'
        >
          <DialogTitle id='delete-dialog-title'>Delete Country</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete {countryToDelete?.name}? This
              action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDeleteCancel} disabled={isDeleting}>
              Cancel
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              color='error'
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogActions>
        </Dialog>
      </LocalizationProvider>
    </ThemeProvider>
  );
}
