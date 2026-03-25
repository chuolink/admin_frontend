'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useClientApi from '@/lib/axios/clientSide';
import PageContainer from '@/components/layout/page-container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import {
  UserSearch,
  UserPlus,
  TrendingUp,
  Clock,
  ArrowRight,
  GraduationCap,
  SkipForward
} from 'lucide-react';
import { toast } from 'sonner';
import {
  type Lead,
  type LeadSource,
  type LeadsResponse,
  LEAD_SOURCE_OPTIONS
} from '@/features/leads/types';
import {
  StudentPicker,
  type StudentSearchResult
} from '@/components/student-picker';
import LeadTable from './components/LeadTable';

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

  // Dialog state
  const [createOpen, setCreateOpen] = useState(false);
  const [editLead, setEditLead] = useState<Lead | null>(null);
  const [form, setForm] = useState<LeadFormData>(emptyForm);

  // Two-step create flow state
  const [dialogStep, setDialogStep] = useState<'search' | 'form'>('search');
  const [selectedStudent, setSelectedStudent] =
    useState<StudentSearchResult | null>(null);

  // Stats queries
  const { data: totalData } = useQuery<LeadsResponse>({
    queryKey: ['leads-stats-total'],
    queryFn: async () => {
      const response = await api!.get('/admin/leads/', {
        params: { page_size: 1 }
      });
      return response.data;
    },
    enabled: !!api
  });

  const { data: newData } = useQuery<LeadsResponse>({
    queryKey: ['leads-stats-new'],
    queryFn: async () => {
      const response = await api!.get('/admin/leads/', {
        params: { page_size: 1, status: 'NEW' }
      });
      return response.data;
    },
    enabled: !!api
  });

  const { data: convertedData } = useQuery<LeadsResponse>({
    queryKey: ['leads-stats-converted'],
    queryFn: async () => {
      const response = await api!.get('/admin/leads/', {
        params: { page_size: 1, status: 'CONVERTED' }
      });
      return response.data;
    },
    enabled: !!api
  });

  const { data: contactedData } = useQuery<LeadsResponse>({
    queryKey: ['leads-stats-contacted'],
    queryFn: async () => {
      const response = await api!.get('/admin/leads/', {
        params: { page_size: 1, status: 'CONTACTED' }
      });
      return response.data;
    },
    enabled: !!api
  });

  const createLead = useMutation({
    mutationFn: async (data: LeadFormData) => {
      const payload = {
        ...data,
        follow_up_date: data.follow_up_date || null,
        converted_student: selectedStudent?.id || null,
        is_app_student: !!selectedStudent
      };
      const response = await api!.post('/admin/leads/', payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      closeDialog();
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
      data: Partial<LeadFormData>;
    }) => {
      const response = await api!.patch(`/admin/leads/${id}/`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      closeDialog();
      toast.success('Lead updated');
    },
    onError: () => toast.error('Failed to update lead')
  });

  const closeDialog = () => {
    setCreateOpen(false);
    setEditLead(null);
    setForm(emptyForm);
    setDialogStep('search');
    setSelectedStudent(null);
  };

  const openCreate = () => {
    setForm(emptyForm);
    setDialogStep('search');
    setSelectedStudent(null);
    setCreateOpen(true);
  };

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

  // When moving from search step → form step with a selected student
  const proceedWithStudent = () => {
    if (selectedStudent) {
      setForm((f) => ({
        ...f,
        student_name: selectedStudent.user_name,
        email: selectedStudent.user_email,
        source: 'APP' as LeadSource
      }));
    }
    setDialogStep('form');
  };

  // Skip search → go directly to manual form
  const skipSearch = () => {
    setSelectedStudent(null);
    setDialogStep('form');
  };

  const isDialogOpen = createOpen || !!editLead;
  const isCreating = createOpen && !editLead;

  return (
    <PageContainer className='w-full'>
      <div className='w-full space-y-6'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight'>Leads</h1>
          <p className='text-muted-foreground'>
            Track and manage prospective student leads
          </p>
        </div>

        <div className='grid grid-cols-2 gap-4 lg:grid-cols-4'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Total Leads</CardTitle>
              <UserSearch className='text-muted-foreground h-4 w-4' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {totalData?.count ?? '--'}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>New Leads</CardTitle>
              <UserPlus className='h-4 w-4 text-amber-500' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-amber-600'>
                {newData?.count ?? '--'}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Converted</CardTitle>
              <TrendingUp className='h-4 w-4 text-green-500' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-green-600'>
                {convertedData?.count ?? '--'}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Contacted</CardTitle>
              <Clock className='text-muted-foreground h-4 w-4' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {contactedData?.count ?? '--'}
              </div>
            </CardContent>
          </Card>
        </div>

        <LeadTable onAddNew={openCreate} onEdit={openEdit} />
      </div>

      {/* Create / Edit Lead Dialog */}
      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          if (!open) closeDialog();
        }}
      >
        <DialogContent className='max-w-md'>
          {/* ===== STEP 1: Student Search (create only) ===== */}
          {isCreating && dialogStep === 'search' ? (
            <>
              <DialogHeader>
                <DialogTitle>Add New Lead</DialogTitle>
                <DialogDescription>
                  Search for an existing student in the app, or create a new
                  lead from scratch.
                </DialogDescription>
              </DialogHeader>

              <div className='space-y-4 py-2'>
                <div>
                  <Label className='mb-2 block'>Search Existing Students</Label>
                  <StudentPicker
                    value={selectedStudent}
                    onSelect={setSelectedStudent}
                    placeholder='Search by name, email, or phone...'
                  />
                </div>

                {selectedStudent && (
                  <div className='flex items-start gap-3 rounded-lg border bg-green-50/50 p-3 dark:bg-green-950/20'>
                    <GraduationCap className='mt-0.5 h-5 w-5 shrink-0 text-green-600' />
                    <div className='min-w-0'>
                      <p className='text-sm font-medium'>
                        {selectedStudent.user_name}
                      </p>
                      <p className='text-muted-foreground truncate text-xs'>
                        {selectedStudent.user_email}
                        {selectedStudent.education_level &&
                          ` · ${selectedStudent.education_level}`}
                      </p>
                      <Badge
                        variant='outline'
                        className='mt-1.5 border-green-200 text-[10px] text-green-700 dark:border-green-800 dark:text-green-400'
                      >
                        App Student
                      </Badge>
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter className='flex-col gap-2 sm:flex-row'>
                <Button
                  variant='ghost'
                  onClick={skipSearch}
                  className='text-muted-foreground w-full sm:w-auto'
                >
                  <SkipForward className='mr-1.5 h-4 w-4' />
                  Skip — New Lead
                </Button>
                <Button
                  onClick={proceedWithStudent}
                  disabled={!selectedStudent}
                  className='w-full sm:w-auto'
                >
                  Continue
                  <ArrowRight className='ml-1.5 h-4 w-4' />
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              {/* ===== STEP 2: Lead Form (create & edit) ===== */}
              <DialogHeader>
                <DialogTitle>
                  {editLead ? 'Edit Lead' : 'Lead Details'}
                </DialogTitle>
                {isCreating && selectedStudent && (
                  <DialogDescription>
                    Creating lead linked to{' '}
                    <span className='font-medium'>
                      {selectedStudent.user_name}
                    </span>
                  </DialogDescription>
                )}
              </DialogHeader>

              <div className='space-y-4'>
                <div className='grid grid-cols-2 gap-4'>
                  <div className='space-y-1.5'>
                    <Label required>Student Name</Label>
                    <Input
                      value={form.student_name}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          student_name: e.target.value
                        }))
                      }
                      readOnly={isCreating && !!selectedStudent}
                      className={
                        isCreating && selectedStudent
                          ? 'bg-muted cursor-not-allowed'
                          : ''
                      }
                    />
                  </div>
                  <div className='space-y-1.5'>
                    <Label>Parent Name</Label>
                    <Input
                      value={form.parent_name}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          parent_name: e.target.value
                        }))
                      }
                    />
                  </div>
                </div>
                <div className='grid grid-cols-2 gap-4'>
                  <div className='space-y-1.5'>
                    <Label required>Phone Number</Label>
                    <Input
                      value={form.phone_number}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          phone_number: e.target.value
                        }))
                      }
                    />
                  </div>
                  <div className='space-y-1.5'>
                    <Label>Email</Label>
                    <Input
                      type='email'
                      value={form.email}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, email: e.target.value }))
                      }
                      readOnly={isCreating && !!selectedStudent}
                      className={
                        isCreating && selectedStudent
                          ? 'bg-muted cursor-not-allowed'
                          : ''
                      }
                    />
                  </div>
                </div>
                <div className='grid grid-cols-2 gap-4'>
                  <div className='space-y-1.5'>
                    <Label required>Source</Label>
                    <Select
                      value={form.source}
                      onValueChange={(val) =>
                        setForm((f) => ({
                          ...f,
                          source: val as LeadSource
                        }))
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
                  <div className='space-y-1.5'>
                    <Label>Follow-up Date</Label>
                    <Input
                      type='date'
                      value={form.follow_up_date}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          follow_up_date: e.target.value
                        }))
                      }
                    />
                  </div>
                </div>
                <div className='space-y-1.5'>
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
                {isCreating && (
                  <Button
                    variant='ghost'
                    onClick={() => {
                      setDialogStep('search');
                      setForm(emptyForm);
                      setSelectedStudent(null);
                    }}
                    className='mr-auto'
                  >
                    Back
                  </Button>
                )}
                <Button variant='outline' onClick={closeDialog}>
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
                      : 'Create Lead'}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
