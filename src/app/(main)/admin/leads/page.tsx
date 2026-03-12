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
  UserSearch,
  UserPlus,
  TrendingUp,
  Clock,
  Phone,
  CalendarPlus,
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
  type Lead,
  type LeadsResponse,
  type LeadSource,
  type LeadStatus,
  LEAD_SOURCE_OPTIONS,
  LEAD_STATUS_OPTIONS
} from '@/features/leads/types';
import { format } from 'date-fns';
import { toast } from 'sonner';
import Link from 'next/link';

const statusVariant: Record<
  string,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  NEW: 'default',
  CONTACTED: 'secondary',
  CONSULTATION_SCHEDULED: 'outline',
  CONSULTATION_DONE: 'outline',
  CONVERTED: 'default',
  LOST: 'destructive'
};

interface LeadFormData {
  student_name: string;
  parent_name: string;
  phone_number: string;
  email: string;
  source: LeadSource;
  notes: string;
  follow_up_date: string;
}

const emptyForm: LeadFormData = {
  student_name: '',
  parent_name: '',
  phone_number: '',
  email: '',
  source: 'OFFICE_VISIT',
  notes: '',
  follow_up_date: ''
};

export default function LeadsPage() {
  const { api } = useClientApi();
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [editLead, setEditLead] = useState<Lead | null>(null);
  const [form, setForm] = useState<LeadFormData>(emptyForm);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { data, isLoading } = useQuery<LeadsResponse>({
    queryKey: ['leads'],
    queryFn: async () => {
      if (!api) throw new Error('API not initialized');
      const response = await api.get('/admin/leads/');
      return response.data;
    },
    enabled: !!api
  });

  const createLead = useMutation({
    mutationFn: async (data: LeadFormData) => {
      if (!api) throw new Error('API not initialized');
      const payload = {
        ...data,
        follow_up_date: data.follow_up_date || null
      };
      const response = await api.post('/admin/leads/', payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      setCreateOpen(false);
      setForm(emptyForm);
      toast.success('Lead created');
    },
    onError: () => toast.error('Failed to create lead')
  });

  const updateLead = useMutation({
    mutationFn: async ({
      id,
      data
    }: {
      id: string;
      data: Partial<LeadFormData & { status: LeadStatus }>;
    }) => {
      if (!api) throw new Error('API not initialized');
      const response = await api.patch(`/admin/leads/${id}/`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      setEditLead(null);
      setForm(emptyForm);
      toast.success('Lead updated');
    },
    onError: () => toast.error('Failed to update lead')
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: LeadStatus }) => {
      if (!api) throw new Error('API not initialized');
      const response = await api.patch(`/admin/leads/${id}/`, { status });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.success('Status updated');
    },
    onError: () => toast.error('Failed to update status')
  });

  const allLeads = data?.results ?? [];
  const totalLeads = data?.count ?? 0;
  const newLeads = allLeads.filter((l) => l.status === 'NEW').length;
  const convertedLeads = allLeads.filter(
    (l) => l.status === 'CONVERTED'
  ).length;
  const pendingFollowUp = allLeads.filter(
    (l) => l.follow_up_date && new Date(l.follow_up_date) <= new Date()
  ).length;

  const leads = allLeads.filter((l) => {
    if (statusFilter !== 'all' && l.status !== statusFilter) return false;
    if (
      searchQuery &&
      !l.student_name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !l.parent_name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !l.phone_number.includes(searchQuery)
    )
      return false;
    return true;
  });

  const sourceLabel = (val: string) =>
    LEAD_SOURCE_OPTIONS.find((o) => o.value === val)?.label ?? val;
  const statusLabel = (val: string) =>
    LEAD_STATUS_OPTIONS.find((o) => o.value === val)?.label ?? val;

  const openEdit = (lead: Lead) => {
    setEditLead(lead);
    setForm({
      student_name: lead.student_name,
      parent_name: lead.parent_name,
      phone_number: lead.phone_number,
      email: lead.email,
      source: lead.source,
      notes: lead.notes,
      follow_up_date: lead.follow_up_date ?? ''
    });
  };

  const isDialogOpen = createOpen || !!editLead;

  return (
    <PageContainer className='w-full'>
      <div className='w-full space-y-6'>
        <div className='flex w-full items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold'>Leads</h1>
            <p className='text-muted-foreground'>
              Track and manage prospective student leads
            </p>
          </div>
          <Button
            onClick={() => {
              setForm(emptyForm);
              setCreateOpen(true);
            }}
          >
            <UserPlus className='mr-2 h-4 w-4' />
            Add Lead
          </Button>
        </div>

        <div className='grid grid-cols-1 gap-4 md:grid-cols-4'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Total Leads</CardTitle>
              <UserSearch className='text-muted-foreground h-4 w-4' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{totalLeads}</div>
              <p className='text-muted-foreground text-xs'>All time leads</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>New Leads</CardTitle>
              <UserPlus className='text-muted-foreground h-4 w-4' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{newLeads}</div>
              <p className='text-muted-foreground text-xs'>Awaiting contact</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Converted</CardTitle>
              <TrendingUp className='text-muted-foreground h-4 w-4' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{convertedLeads}</div>
              <p className='text-muted-foreground text-xs'>Became students</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Pending Follow-up
              </CardTitle>
              <Clock className='text-muted-foreground h-4 w-4' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{pendingFollowUp}</div>
              <p className='text-muted-foreground text-xs'>Overdue actions</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className='flex gap-3'>
          <div className='relative flex-1'>
            <Search className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
            <Input
              placeholder='Search by name, parent, or phone...'
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
              {LEAD_STATUS_OPTIONS.map((opt) => (
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
                  <TableHead>Name</TableHead>
                  <TableHead>Parent</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Follow-up</TableHead>
                  <TableHead className='w-[80px]'>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className='py-8 text-center'>
                      Loading leads...
                    </TableCell>
                  </TableRow>
                ) : leads.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className='text-muted-foreground py-8 text-center'
                    >
                      No leads found.
                    </TableCell>
                  </TableRow>
                ) : (
                  leads.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell className='font-medium'>
                        <Link
                          href={`/admin/leads/${lead.id}`}
                          className='hover:underline'
                        >
                          {lead.student_name}
                        </Link>
                      </TableCell>
                      <TableCell>{lead.parent_name}</TableCell>
                      <TableCell>{lead.phone_number}</TableCell>
                      <TableCell>
                        <Badge variant='outline'>
                          {sourceLabel(lead.source)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={statusVariant[lead.status] ?? 'secondary'}
                        >
                          {statusLabel(lead.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {lead.follow_up_date
                          ? format(new Date(lead.follow_up_date), 'MMM d, yyyy')
                          : '—'}
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
                            <DropdownMenuItem onClick={() => openEdit(lead)}>
                              <Pencil className='mr-2 h-3.5 w-3.5' />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {lead.status === 'NEW' && (
                              <DropdownMenuItem
                                onClick={() =>
                                  updateStatus.mutate({
                                    id: lead.id,
                                    status: 'CONTACTED'
                                  })
                                }
                              >
                                <Phone className='mr-2 h-3.5 w-3.5' />
                                Mark Contacted
                              </DropdownMenuItem>
                            )}
                            {(lead.status === 'CONTACTED' ||
                              lead.status === 'NEW') && (
                              <DropdownMenuItem
                                onClick={() =>
                                  updateStatus.mutate({
                                    id: lead.id,
                                    status: 'CONSULTATION_SCHEDULED'
                                  })
                                }
                              >
                                <CalendarPlus className='mr-2 h-3.5 w-3.5' />
                                Schedule Consultation
                              </DropdownMenuItem>
                            )}
                            {lead.status !== 'CONVERTED' &&
                              lead.status !== 'LOST' && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    updateStatus.mutate({
                                      id: lead.id,
                                      status: 'CONVERTED'
                                    })
                                  }
                                >
                                  <TrendingUp className='mr-2 h-3.5 w-3.5' />
                                  Mark Converted
                                </DropdownMenuItem>
                              )}
                            {lead.status !== 'LOST' &&
                              lead.status !== 'CONVERTED' && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    updateStatus.mutate({
                                      id: lead.id,
                                      status: 'LOST'
                                    })
                                  }
                                  className='text-destructive'
                                >
                                  Mark Lost
                                </DropdownMenuItem>
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

      {/* Create / Edit Lead Dialog */}
      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setCreateOpen(false);
            setEditLead(null);
            setForm(emptyForm);
          }
        }}
      >
        <DialogContent className='max-w-md'>
          <DialogHeader>
            <DialogTitle>{editLead ? 'Edit Lead' : 'Add New Lead'}</DialogTitle>
          </DialogHeader>
          <div className='space-y-4'>
            <div className='grid grid-cols-2 gap-3'>
              <div>
                <Label>Student Name</Label>
                <Input
                  value={form.student_name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, student_name: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label>Parent Name</Label>
                <Input
                  value={form.parent_name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, parent_name: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className='grid grid-cols-2 gap-3'>
              <div>
                <Label>Phone Number</Label>
                <Input
                  value={form.phone_number}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, phone_number: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type='email'
                  value={form.email}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, email: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className='grid grid-cols-2 gap-3'>
              <div>
                <Label>Source</Label>
                <Select
                  value={form.source}
                  onValueChange={(val) =>
                    setForm((f) => ({ ...f, source: val as LeadSource }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LEAD_SOURCE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Follow-up Date</Label>
                <Input
                  type='date'
                  value={form.follow_up_date}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, follow_up_date: e.target.value }))
                  }
                />
              </div>
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea
                value={form.notes}
                onChange={(e) =>
                  setForm((f) => ({ ...f, notes: e.target.value }))
                }
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => {
                setCreateOpen(false);
                setEditLead(null);
                setForm(emptyForm);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (editLead) {
                  updateLead.mutate({ id: editLead.id, data: form });
                } else {
                  createLead.mutate(form);
                }
              }}
              disabled={
                !form.student_name.trim() ||
                !form.phone_number.trim() ||
                createLead.isPending ||
                updateLead.isPending
              }
            >
              {createLead.isPending || updateLead.isPending
                ? 'Saving...'
                : editLead
                  ? 'Update'
                  : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
