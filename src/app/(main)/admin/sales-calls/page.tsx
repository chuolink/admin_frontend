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
import { Switch } from '@/components/ui/switch';
import {
  Phone,
  PhoneOutgoing,
  PhoneIncoming,
  PhoneMissed,
  Plus,
  Search
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  type SalesCall,
  type SalesCallsResponse,
  type CallType,
  type CallPurpose,
  type CallOutcome,
  CALL_PURPOSE_OPTIONS,
  CALL_OUTCOME_OPTIONS
} from '@/features/sales-calls/types';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface CallFormData {
  call_type: CallType;
  purpose: CallPurpose;
  outcome: CallOutcome;
  duration_minutes: number;
  notes: string;
  follow_up_required: boolean;
  follow_up_date: string;
}

const emptyForm: CallFormData = {
  call_type: 'OUTBOUND',
  purpose: 'GENERAL',
  outcome: 'ANSWERED',
  duration_minutes: 5,
  notes: '',
  follow_up_required: false,
  follow_up_date: ''
};

export default function SalesCallsPage() {
  const { api } = useClientApi();
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState<CallFormData>(emptyForm);
  const [searchQuery, setSearchQuery] = useState('');

  const { data, isLoading } = useQuery<SalesCallsResponse>({
    queryKey: ['sales-calls'],
    queryFn: async () => {
      if (!api) throw new Error('API not initialized');
      const response = await api.get('/admin/sales-calls/');
      return response.data;
    },
    enabled: !!api
  });

  const createCall = useMutation({
    mutationFn: async (data: CallFormData) => {
      if (!api) throw new Error('API not initialized');
      const payload = {
        ...data,
        follow_up_date: data.follow_up_date || null
      };
      const response = await api.post('/admin/sales-calls/', payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales-calls'] });
      setCreateOpen(false);
      setForm(emptyForm);
      toast.success('Call logged');
    },
    onError: () => toast.error('Failed to log call')
  });

  const allCalls = data?.results ?? [];
  const totalCalls = data?.count ?? 0;
  const outbound = allCalls.filter((c) => c.call_type === 'OUTBOUND').length;
  const answered = allCalls.filter((c) => c.outcome === 'ANSWERED').length;
  const pendingFollowUp = allCalls.filter(
    (c) => c.follow_up_required && c.follow_up_date
  ).length;

  const calls = allCalls.filter((c) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.caller_name?.toLowerCase().includes(q) ||
      c.notes?.toLowerCase().includes(q)
    );
  });

  const purposeLabel = (val: string) =>
    CALL_PURPOSE_OPTIONS.find((o) => o.value === val)?.label ?? val;
  const outcomeLabel = (val: string) =>
    CALL_OUTCOME_OPTIONS.find((o) => o.value === val)?.label ?? val;

  const outcomeVariant: Record<
    string,
    'default' | 'secondary' | 'destructive' | 'outline'
  > = {
    ANSWERED: 'default',
    NO_ANSWER: 'destructive',
    BUSY: 'secondary',
    CALLBACK_REQUESTED: 'outline',
    VOICEMAIL: 'secondary'
  };

  return (
    <PageContainer className='w-full'>
      <div className='w-full space-y-6'>
        <div className='flex w-full items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold'>Sales Calls</h1>
            <p className='text-muted-foreground'>
              Track outbound and inbound sales calls
            </p>
          </div>
          <Button
            onClick={() => {
              setForm(emptyForm);
              setCreateOpen(true);
            }}
          >
            <Plus className='mr-2 h-4 w-4' />
            Log Call
          </Button>
        </div>

        <div className='grid grid-cols-1 gap-4 md:grid-cols-4'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Total Calls</CardTitle>
              <Phone className='text-muted-foreground h-4 w-4' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{totalCalls}</div>
              <p className='text-muted-foreground text-xs'>All logged calls</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Outbound</CardTitle>
              <PhoneOutgoing className='text-muted-foreground h-4 w-4' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{outbound}</div>
              <p className='text-muted-foreground text-xs'>Sales calls made</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Answered</CardTitle>
              <PhoneIncoming className='text-muted-foreground h-4 w-4' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{answered}</div>
              <p className='text-muted-foreground text-xs'>
                Successfully connected
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Follow-ups</CardTitle>
              <PhoneMissed className='text-muted-foreground h-4 w-4' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{pendingFollowUp}</div>
              <p className='text-muted-foreground text-xs'>Callbacks pending</p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className='relative'>
          <Search className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
          <Input
            placeholder='Search by caller or notes...'
            className='pl-9'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Card>
          <CardContent className='p-0'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Caller</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Purpose</TableHead>
                  <TableHead>Outcome</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Follow-up</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className='py-8 text-center'>
                      Loading calls...
                    </TableCell>
                  </TableRow>
                ) : calls.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className='text-muted-foreground py-8 text-center'
                    >
                      No calls found.
                    </TableCell>
                  </TableRow>
                ) : (
                  calls.map((call) => (
                    <TableRow key={call.id}>
                      <TableCell>
                        {format(new Date(call.created_at), 'MMM d, yyyy HH:mm')}
                      </TableCell>
                      <TableCell className='font-medium'>
                        {call.caller_name ?? call.caller}
                      </TableCell>
                      <TableCell>
                        <Badge variant='outline'>
                          {call.call_type === 'OUTBOUND'
                            ? 'Outbound'
                            : 'Inbound'}
                        </Badge>
                      </TableCell>
                      <TableCell>{purposeLabel(call.purpose)}</TableCell>
                      <TableCell>
                        <Badge
                          variant={outcomeVariant[call.outcome] ?? 'secondary'}
                        >
                          {outcomeLabel(call.outcome)}
                        </Badge>
                      </TableCell>
                      <TableCell>{call.duration_minutes} min</TableCell>
                      <TableCell>
                        {call.follow_up_date
                          ? format(new Date(call.follow_up_date), 'MMM d')
                          : '—'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Log Call Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className='max-w-md'>
          <DialogHeader>
            <DialogTitle>Log Sales Call</DialogTitle>
          </DialogHeader>
          <div className='space-y-4'>
            <div className='grid grid-cols-2 gap-3'>
              <div>
                <Label>Call Type</Label>
                <Select
                  value={form.call_type}
                  onValueChange={(val) =>
                    setForm((f) => ({ ...f, call_type: val as CallType }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='OUTBOUND'>Outbound</SelectItem>
                    <SelectItem value='INBOUND'>Inbound</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Duration (min)</Label>
                <Input
                  type='number'
                  min={1}
                  value={form.duration_minutes}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      duration_minutes: parseInt(e.target.value) || 0
                    }))
                  }
                />
              </div>
            </div>
            <div className='grid grid-cols-2 gap-3'>
              <div>
                <Label>Purpose</Label>
                <Select
                  value={form.purpose}
                  onValueChange={(val) =>
                    setForm((f) => ({ ...f, purpose: val as CallPurpose }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CALL_PURPOSE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Outcome</Label>
                <Select
                  value={form.outcome}
                  onValueChange={(val) =>
                    setForm((f) => ({ ...f, outcome: val as CallOutcome }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CALL_OUTCOME_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
            <div className='flex items-center gap-3'>
              <Switch
                checked={form.follow_up_required}
                onCheckedChange={(checked) =>
                  setForm((f) => ({ ...f, follow_up_required: checked }))
                }
              />
              <Label>Follow-up Required</Label>
            </div>
            {form.follow_up_required && (
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
            )}
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => createCall.mutate(form)}
              disabled={createCall.isPending}
            >
              {createCall.isPending ? 'Saving...' : 'Log Call'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
