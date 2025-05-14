'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper
} from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import {
  IconCheck,
  IconX,
  IconEye,
  IconChevronDown,
  IconChevronUp
} from '@tabler/icons-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import useClientApi from '@/lib/axios/clientSide';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Application,
  ApplicationStatus,
  ApplicationFilters,
  ApplicationStats,
  ApplicationResponse,
  University,
  Course,
  ApplicationDetailsProps,
  ApplicationFiltersProps,
  ApplicationActionsProps
} from '@/types';

function ApplicationDetails({ application }: ApplicationDetailsProps) {
  return (
    <div className='space-y-4'>
      <div className='grid grid-cols-2 gap-4'>
        <div>
          <h3 className='font-semibold'>Student Information</h3>
          <p>Name: {application.student_name}</p>
          <p>Email: {application.student_email}</p>
          <p>Phone: {application.student_phone}</p>
        </div>
        <div>
          <h3 className='font-semibold'>Application Information</h3>
          <p>Course: {application.course_name}</p>
          <p>Status: {application.status}</p>
          <p>Applied: {formatDate(application.created_at)}</p>
        </div>
      </div>
      <div>
        <h3 className='font-semibold'>Additional Information</h3>
        <p className='whitespace-pre-wrap'>{application.additional_info}</p>
      </div>
      {application.notes && (
        <div>
          <h3 className='font-semibold'>Admin Notes</h3>
          <p className='whitespace-pre-wrap'>{application.notes}</p>
        </div>
      )}
    </div>
  );
}

async function handleApprove({
  applicationId,
  onSuccess
}: ApplicationActionsProps) {
  const { api } = useClientApi();
  if (!api) {
    toast.error('Not authenticated');
    return;
  }
  try {
    await api.post(`/api/v1/admin/applications/${applicationId}/approve/`);
    toast.success('Application approved successfully');
    onSuccess?.();
  } catch (error) {
    toast.error('Failed to approve application');
    console.error('Error approving application:', error);
  }
}

async function handleReject({
  applicationId,
  onSuccess
}: ApplicationActionsProps) {
  const { api } = useClientApi();
  if (!api) {
    toast.error('Not authenticated');
    return;
  }
  try {
    await api.post(`/api/v1/admin/applications/${applicationId}/reject/`);
    toast.success('Application rejected successfully');
    onSuccess?.();
  } catch (error) {
    toast.error('Failed to reject application');
    console.error('Error rejecting application:', error);
  }
}

function ApplicationFilters({
  filters,
  onChange,
  universities,
  courses
}: ApplicationFiltersProps) {
  return (
    <div className='mb-6 grid grid-cols-1 gap-4 md:grid-cols-5'>
      <div className='space-y-2'>
        <Label>Status</Label>
        <Select
          value={filters.status}
          onValueChange={(value) => onChange({ ...filters, status: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder='All Statuses' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value=''>All Statuses</SelectItem>
            <SelectItem value='pending'>Pending</SelectItem>
            <SelectItem value='approved'>Approved</SelectItem>
            <SelectItem value='rejected'>Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className='space-y-2'>
        <Label>University</Label>
        <Select
          value={filters.university}
          onValueChange={(value) => onChange({ ...filters, university: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder='All Universities' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value=''>All Universities</SelectItem>
            {universities.map((u: University) => (
              <SelectItem key={u.id} value={u.id.toString()}>
                {u.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className='space-y-2'>
        <Label>Course</Label>
        <Select
          value={filters.course}
          onValueChange={(value) => onChange({ ...filters, course: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder='All Courses' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value=''>All Courses</SelectItem>
            {courses.map((c: Course) => (
              <SelectItem key={c.id} value={c.id.toString()}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className='space-y-2'>
        <Label>Date Range</Label>
        <DateRangePicker
          value={filters.dateRange}
          onChange={(value) => onChange({ ...filters, dateRange: value })}
        />
      </div>
      <div className='space-y-2'>
        <Label>Search</Label>
        <Input
          placeholder='Search by student, university, course...'
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
        />
      </div>
    </div>
  );
}

export default function ApplicationsPage() {
  const { api } = useClientApi();
  const [applications, setApplications] = useState<Application[]>([]);
  const [stats, setStats] = useState<ApplicationStats>({
    total_applications: 0,
    pending_applications: 0,
    approved_applications: 0,
    rejected_applications: 0
  });
  const [loading, setLoading] = useState(true);
  const [universities, setUniversities] = useState<University[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState<ApplicationFilters>({
    status: '',
    university: '',
    course: '',
    search: '',
    dateRange: null,
    ordering: '-created_at',
    page: 1,
    pageSize: 20
  });

  const buildQuery = () => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.university) params.append('university', filters.university);
    if (filters.course) params.append('course', filters.course);
    if (filters.search) params.append('search', filters.search);
    if (filters.dateRange) {
      if (filters.dateRange.from)
        params.append('created_at__gte', filters.dateRange.from.toISOString());
      if (filters.dateRange.to)
        params.append('created_at__lte', filters.dateRange.to.toISOString());
    }
    if (filters.ordering) params.append('ordering', filters.ordering);
    params.append('page', filters.page.toString());
    params.append('page_size', filters.pageSize.toString());
    return params.toString();
  };

  const fetchData = async () => {
    if (!api) return;
    setLoading(true);
    try {
      const [applicationsRes, statsRes, universitiesRes, coursesRes] =
        await Promise.all([
          api.get<ApplicationResponse>(
            `/api/v1/admin/applications/?${buildQuery()}`
          ),
          api.get<ApplicationStats>('/api/v1/admin/applications/stats/'),
          api.get<{ results: University[] }>('/api/v1/admin/universities/'),
          api.get<{ results: Course[] }>('/api/v1/admin/courses/')
        ]);
      setApplications(applicationsRes.data.results);
      setTotal(applicationsRes.data.count);
      setStats(statsRes.data);
      setUniversities(universitiesRes.data.results || universitiesRes.data);
      setCourses(coursesRes.data.results || coursesRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, [JSON.stringify(filters)]);

  const columnHelper = createColumnHelper<Application>();

  const columns = [
    columnHelper.accessor('id', {
      header: 'ID',
      cell: (info) => info.getValue()
    }),
    columnHelper.accessor('student_name', {
      header: 'Student',
      cell: (info) => info.getValue()
    }),
    columnHelper.accessor('course_name', {
      header: 'Course',
      cell: (info) => info.getValue()
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: (info) => {
        const status = info.getValue();
        return (
          <Badge
            variant={
              status === 'approved'
                ? 'default'
                : status === 'rejected'
                  ? 'destructive'
                  : 'secondary'
            }
          >
            {status}
          </Badge>
        );
      }
    }),
    columnHelper.accessor('created_at', {
      header: 'Applied',
      cell: (info) => formatDate(info.getValue())
    }),
    columnHelper.accessor('actions', {
      header: 'Actions',
      cell: (info) => {
        const application = info.row.original;
        return (
          <div className='flex space-x-2'>
            <Dialog>
              <DialogTrigger asChild>
                <Button size='sm' variant='outline'>
                  <IconEye className='h-4 w-4' />
                </Button>
              </DialogTrigger>
              <DialogContent className='max-w-3xl'>
                <DialogHeader>
                  <DialogTitle>Application Details</DialogTitle>
                </DialogHeader>
                <ApplicationDetails application={application} />
              </DialogContent>
            </Dialog>
            {application.status === 'pending' && (
              <>
                <Button
                  size='sm'
                  variant='outline'
                  onClick={() =>
                    handleApprove({
                      applicationId: application.id,
                      onSuccess: fetchData
                    })
                  }
                >
                  <IconCheck className='h-4 w-4' />
                </Button>
                <Button
                  size='sm'
                  variant='outline'
                  onClick={() =>
                    handleReject({
                      applicationId: application.id,
                      onSuccess: fetchData
                    })
                  }
                >
                  <IconX className='h-4 w-4' />
                </Button>
              </>
            )}
          </div>
        );
      }
    })
  ];

  const table = useReactTable({
    data: applications,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    pageCount: Math.ceil(total / filters.pageSize),
    state: {
      pagination: {
        pageIndex: filters.page - 1,
        pageSize: filters.pageSize
      }
    },
    onPaginationChange: (updater) => {
      if (typeof updater === 'function') {
        const newState = updater({
          pageIndex: filters.page - 1,
          pageSize: filters.pageSize
        });
        setFilters((f: ApplicationFilters) => ({
          ...f,
          page: newState.pageIndex + 1,
          pageSize: newState.pageSize
        }));
      }
    },
    manualPagination: true
  });

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-3xl font-bold'>Applications Management</h1>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='outline'>Columns</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  {column.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Total Applications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.total_applications}</div>
            <p className='text-muted-foreground text-xs'>All applications</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Pending Applications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {stats.pending_applications}
            </div>
            <p className='text-muted-foreground text-xs'>Awaiting review</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Approved Applications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {stats.approved_applications}
            </div>
            <p className='text-muted-foreground text-xs'>
              Successfully approved
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Rejected Applications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {stats.rejected_applications}
            </div>
            <p className='text-muted-foreground text-xs'>Not approved</p>
          </CardContent>
        </Card>
      </div>

      <ApplicationFilters
        filters={filters}
        onChange={setFilters}
        universities={universities}
        courses={courses}
      />

      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : (
                      <div
                        className={
                          header.column.getCanSort()
                            ? 'cursor-pointer select-none'
                            : ''
                        }
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {header.column.getIsSorted() === 'asc' && (
                          <IconChevronUp className='ml-2 h-4 w-4' />
                        )}
                        {header.column.getIsSorted() === 'desc' && (
                          <IconChevronDown className='ml-2 h-4 w-4' />
                        )}
                      </div>
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className='h-24 text-center'
                >
                  Loading...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
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
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className='flex items-center justify-end space-x-2 py-4'>
        <div className='text-muted-foreground flex-1 text-sm'>
          {table.getFilteredSelectedRowModel().rows.length} of{' '}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className='space-x-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
