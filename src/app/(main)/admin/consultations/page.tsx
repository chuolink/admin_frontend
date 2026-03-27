// @ts-nocheck
'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useClientApi from '@/lib/axios/clientSide';
import PageContainer from '@/components/layout/page-container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  CalendarCheck,
  CalendarPlus,
  CheckCircle,
  XCircle,
  Plus,
  Search,
  MoreVertical,
  Pencil
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  type Consultation,
  type ConsultationsResponse,
  type ConsultationType,
  type ConsultationStatus,
  type ConsultationOutcome,
  CONSULTATION_TYPE_OPTIONS,
  CONSULTATION_STATUS_OPTIONS
} from '@/features/consultations/types';
import { format } from 'date-fns';
import { toast } from 'sonner';
import {
  UniversityPicker,
  CoursePicker,
  type PickerItem
} from '@/components/entity-multi-picker';

const OUTCOME_OPTIONS: { label: string; value: ConsultationOutcome }[] = [
  { label: 'Interested', value: 'INTERESTED' },
  { label: 'Needs More Time', value: 'NEEDS_TIME' },
  { label: 'Follow-up Needed', value: 'FOLLOW_UP_NEEDED' },
  { label: 'Ready to Apply', value: 'READY_TO_APPLY' },
  { label: 'Not Interested', value: 'NOT_INTERESTED' }
];

interface ConsultationFormData {
  consultation_type: ConsultationType;
  scheduled_at: string;
  summary: string;
}

const emptyForm: ConsultationFormData = {
  consultation_type: 'IN_PERSON',
  scheduled_at: '',
  summary: ''
};

export default function ConsultationsPage() {
  const { api } = useClientApi();
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState<ConsultationFormData>(emptyForm);
  const [selectedCourses, setSelectedCourses] = useState<PickerItem[]>([]);
  const [selectedUniversities, setSelectedUniversities] = useState<
    PickerItem[]
  >([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { data, isLoading } = useQuery<ConsultationsResponse>({
    queryKey: ['consultations'],
    queryFn: async () => {
      if (!api) throw new Error('API not initialized');
      const response = await api.get('/admin/consultations/');
      return response.data;
    },
    enabled: !!api
  });

  const createConsultation = useMutation({
    mutationFn: async (data: ConsultationFormData) => {
      if (!api) throw new Error('API not initialized');
      const response = await api.post('/admin/consultations/', {
        ...data,
        recommended_courses: selectedCourses.map((c) => c.name).join(', '),
        recommended_universities: selectedUniversities
          .map((u) => u.name)
          .join(', ')
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultations'] });
      setCreateOpen(false);
      setForm(emptyForm);
      setSelectedCourses([]);
      setSelectedUniversities([]);
      toast.success('Consultation scheduled');
    },
    onError: () => toast.error('Failed to schedule consultation')
  });

  const updateStatus = useMutation({
    mutationFn: async ({
      id,
      status,
      outcome
    }: {
      id: string;
      status?: ConsultationStatus;
      outcome?: ConsultationOutcome;
    }) => {
      if (!api) throw new Error('API not initialized');
      const payload: Record<string, string> = {};
      if (status) payload.status = status;
      if (outcome) payload.outcome = outcome;
      const response = await api.patch(`/admin/consultations/${id}/`, payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultations'] });
      toast.success('Consultation updated');
    },
    onError: () => toast.error('Failed to update consultation')
  });

  const allItems = data?.results ?? [];
  const total = data?.count ?? 0;
  const scheduled = allItems.filter((c) => c.status === 'SCHEDULED').length;
  const completed = allItems.filter((c) => c.status === 'COMPLETED').length;
  const noShows = allItems.filter((c) => c.status === 'NO_SHOW').length;

  const items = allItems.filter((c) => {
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    if (
      searchQuery &&
      !c.staff_member_name?.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !c.summary?.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false;
    return true;
  });

  const typeLabel = (val: string) =>
    CONSULTATION_TYPE_OPTIONS.find((o) => o.value === val)?.label ?? val;
  const statusLabel = (val: string) =>
    CONSULTATION_STATUS_OPTIONS.find((o) => o.value === val)?.label ?? val;
  const outcomeLabel = (val: string) =>
    OUTCOME_OPTIONS.find((o) => o.value === val)?.label ?? val;

  const statusVariant: Record<
    string,
    'default' | 'secondary' | 'destructive' | 'outline'
  > = {
    SCHEDULED: 'outline',
    IN_PROGRESS: 'default',
    COMPLETED: 'secondary',
    CANCELLED: 'destructive',
    NO_SHOW: 'destructive'
  };

  return (
    <PageContainer className='w-full'>
      <div className='w-full space-y-6'>
        <div className='flex w-full items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold'>Consultations</h1>
            <p className='text-muted-foreground'>
              Schedule and track student consultations
            </p>
          </div>
          <Button
            onClick={() => {
              setForm(emptyForm);
              setCreateOpen(true);
            }}
          >
            <Plus className='mr-2 h-4 w-4' />
            Schedule Consultation
          </Button>
        </div>

        <div className='grid grid-cols-1 gap-4 md:grid-cols-4'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Total</CardTitle>
              <CalendarCheck className='text-muted-foreground h-4 w-4' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{total}</div>
              <p className='text-muted-foreground text-xs'>All consultations</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Scheduled</CardTitle>
              <CalendarPlus className='text-muted-foreground h-4 w-4' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{scheduled}</div>
              <p className='text-muted-foreground text-xs'>Upcoming</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Completed</CardTitle>
              <CheckCircle className='text-muted-foreground h-4 w-4' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{completed}</div>
              <p className='text-muted-foreground text-xs'>Done</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>No Shows</CardTitle>
              <XCircle className='text-muted-foreground h-4 w-4' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{noShows}</div>
              <p className='text-muted-foreground text-xs'>Missed</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className='flex gap-3'>
          <div className='relative flex-1'>
            <Search className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
            <Input
              placeholder='Search by staff member or summary...'
              className='pl-9'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className='w-[200px]'>
              <SelectValue placeholder='Filter by status' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Statuses</SelectItem>
              {CONSULTATION_STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Card>
          <CardContent className='p-0'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Staff Member</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Outcome</TableHead>
                  <TableHead>Summary</TableHead>
                  <TableHead className='w-[60px]'>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className='py-8 text-center'>
                      Loading consultations...
                    </TableCell>
                  </TableRow>
                ) : items.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className='text-muted-foreground py-8 text-center'
                    >
                      No consultations found.
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        {format(
                          new Date(item.scheduled_at),
                          'MMM d, yyyy HH:mm'
                        )}
                      </TableCell>
                      <TableCell className='font-medium'>
                        {item.staff_member_name ?? item.staff_member}
                      </TableCell>
                      <TableCell>
                        <Badge variant='outline'>
                          {typeLabel(item.consultation_type)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={statusVariant[item.status] ?? 'secondary'}
                        >
                          {statusLabel(item.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {item.outcome ? outcomeLabel(item.outcome) : '—'}
                      </TableCell>
                      <TableCell className='max-w-[200px] truncate'>
                        {item.summary || '—'}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant='ghost'
                              size='icon'
                              className='h-7 w-7'
                            >
                              <MoreVertical className='h-3.5 w-3.5' />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align='end'>
                            {item.status === 'SCHEDULED' && (
                              <>
                                <DropdownMenuItem
                                  onClick={() =>
                                    updateStatus.mutate({
                                      id: item.id,
                                      status: 'IN_PROGRESS'
                                    })
                                  }
                                >
                                  Start Consultation
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    updateStatus.mutate({
                                      id: item.id,
                                      status: 'NO_SHOW'
                                    })
                                  }
                                  className='text-destructive'
                                >
                                  Mark No Show
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    updateStatus.mutate({
                                      id: item.id,
                                      status: 'CANCELLED'
                                    })
                                  }
                                  className='text-destructive'
                                >
                                  Cancel
                                </DropdownMenuItem>
                              </>
                            )}
                            {item.status === 'IN_PROGRESS' && (
                              <>
                                <DropdownMenuSeparator />
                                {OUTCOME_OPTIONS.map((opt) => (
                                  <DropdownMenuItem
                                    key={opt.value}
                                    onClick={() =>
                                      updateStatus.mutate({
                                        id: item.id,
                                        status: 'COMPLETED',
                                        outcome: opt.value
                                      })
                                    }
                                  >
                                    Complete — {opt.label}
                                  </DropdownMenuItem>
                                ))}
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Schedule Consultation Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className='max-w-md'>
          <DialogHeader>
            <DialogTitle>Schedule Consultation</DialogTitle>
          </DialogHeader>
          <div className='space-y-4'>
            <div className='grid grid-cols-2 gap-3'>
              <div>
                <Label required>Type</Label>
                <Select
                  value={form.consultation_type}
                  onValueChange={(val) =>
                    setForm((f) => ({
                      ...f,
                      consultation_type: val as ConsultationType
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CONSULTATION_TYPE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label required>Scheduled Date & Time</Label>
                <Input
                  type='datetime-local'
                  value={form.scheduled_at}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, scheduled_at: e.target.value }))
                  }
                />
              </div>
            </div>
            <div>
              <Label>Recommended Courses</Label>
              <CoursePicker
                value={selectedCourses}
                onChange={setSelectedCourses}
              />
            </div>
            <div>
              <Label>Recommended Universities</Label>
              <UniversityPicker
                value={selectedUniversities}
                onChange={setSelectedUniversities}
              />
            </div>
            <div>
              <Label>Summary / Notes</Label>
              <Textarea
                value={form.summary}
                onChange={(e) =>
                  setForm((f) => ({ ...f, summary: e.target.value }))
                }
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => createConsultation.mutate(form)}
              disabled={!form.scheduled_at || createConsultation.isPending}
            >
              {createConsultation.isPending ? 'Scheduling...' : 'Schedule'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
