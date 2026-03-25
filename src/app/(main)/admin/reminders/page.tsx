'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import useClientApi from '@/lib/axios/clientSide';
import PageContainer from '@/components/layout/page-container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
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
  DialogTrigger
} from '@/components/ui/dialog';
import {
  Bell,
  Plus,
  Send,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Filter,
  Trash2,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow, parseISO, format } from 'date-fns';

interface Reminder {
  id: string;
  recipient_type: string;
  student_name: string;
  application_name: string;
  reminder_type: string;
  priority: string;
  title: string;
  message: string;
  scheduled_for: string | null;
  sent_at: string | null;
  read_at: string | null;
  action_url: string;
  auto_generated: boolean;
  created_at: string;
}

const PRIORITY_CONFIG: Record<
  string,
  { color: string; icon: React.ElementType }
> = {
  LOW: { color: 'text-muted-foreground', icon: Clock },
  NORMAL: { color: 'text-blue-600', icon: Bell },
  HIGH: { color: 'text-amber-600', icon: AlertTriangle },
  URGENT: { color: 'text-destructive', icon: Zap }
};

const REMINDER_TYPE_LABELS: Record<string, string> = {
  PAYMENT_DUE: 'Payment Due',
  PAYMENT_OVERDUE: 'Payment Overdue',
  DOCUMENT_NEEDED: 'Document Needed',
  SCHEDULE_UPCOMING: 'Schedule Upcoming',
  STAGE_ACTION: 'Stage Action',
  GENERAL: 'General'
};

export default function RemindersPage() {
  const { api } = useClientApi();
  const queryClient = useQueryClient();
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [createOpen, setCreateOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['reminders', typeFilter, priorityFilter],
    queryFn: async () => {
      const params: Record<string, string> = {
        page_size: '100',
        ordering: '-created_at'
      };
      if (typeFilter !== 'ALL') params.reminder_type = typeFilter;
      if (priorityFilter !== 'ALL') params.priority = priorityFilter;
      const response = await api!.get('/admin/reminders/', { params });
      return response.data;
    },
    enabled: !!api
  });

  const sendNowMutation = useMutation({
    mutationFn: async (id: string) => {
      await api!.post(`/admin/reminders/${id}/send_now/`);
    },
    onSuccess: () => {
      toast.success('Reminder sent');
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
    },
    onError: () => toast.error('Failed to send reminder')
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api!.delete(`/admin/reminders/${id}/`);
    },
    onSuccess: () => {
      toast.success('Reminder deleted');
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
    },
    onError: () => toast.error('Failed to delete')
  });

  const reminders: Reminder[] = data?.results || [];
  const sentCount = reminders.filter((r) => r.sent_at).length;
  const urgentCount = reminders.filter(
    (r) => (r.priority === 'URGENT' || r.priority === 'HIGH') && !r.sent_at
  ).length;

  return (
    <PageContainer className='w-full'>
      <div className='w-full space-y-6'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>Reminders</h1>
            <p className='text-muted-foreground'>
              Manage and send reminders to students and parents
            </p>
          </div>
          <CreateReminderDialog
            open={createOpen}
            onOpenChange={setCreateOpen}
          />
        </div>

        {/* Stats */}
        <div className='grid grid-cols-2 gap-4 lg:grid-cols-4'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Total</CardTitle>
              <Bell className='text-muted-foreground h-4 w-4' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{reminders.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Sent</CardTitle>
              <CheckCircle2 className='h-4 w-4 text-green-500' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-green-600'>
                {sentCount}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Pending</CardTitle>
              <Clock className='h-4 w-4 text-amber-500' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-amber-600'>
                {reminders.length - sentCount}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Urgent</CardTitle>
              <Zap className='text-destructive h-4 w-4' />
            </CardHeader>
            <CardContent>
              <div className='text-destructive text-2xl font-bold'>
                {urgentCount}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className='flex flex-wrap gap-2'>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className='w-[180px]'>
              <Filter className='mr-2 h-3.5 w-3.5' />
              <SelectValue placeholder='Type' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='ALL'>All Types</SelectItem>
              {Object.entries(REMINDER_TYPE_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className='w-[150px]'>
              <SelectValue placeholder='Priority' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='ALL'>All Priorities</SelectItem>
              <SelectItem value='LOW'>Low</SelectItem>
              <SelectItem value='NORMAL'>Normal</SelectItem>
              <SelectItem value='HIGH'>High</SelectItem>
              <SelectItem value='URGENT'>Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Reminders list */}
        {isLoading ? (
          <div className='space-y-3'>
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className='h-24 rounded-lg' />
            ))}
          </div>
        ) : reminders.length === 0 ? (
          <Card>
            <CardContent className='flex flex-col items-center py-12'>
              <Bell className='text-muted-foreground mb-3 h-8 w-8' />
              <p className='text-muted-foreground text-sm'>
                No reminders found.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className='space-y-2'>
            {reminders.map((reminder) => {
              const priorityConfig =
                PRIORITY_CONFIG[reminder.priority] || PRIORITY_CONFIG.NORMAL;
              const PriorityIcon = priorityConfig.icon;
              return (
                <Card key={reminder.id}>
                  <CardContent className='flex items-start gap-4 py-4'>
                    <div className={`mt-0.5 shrink-0 ${priorityConfig.color}`}>
                      <PriorityIcon className='h-5 w-5' />
                    </div>
                    <div className='min-w-0 flex-1'>
                      <div className='flex items-center gap-2'>
                        <p className='truncate text-sm font-medium'>
                          {reminder.title}
                        </p>
                        <Badge
                          variant='outline'
                          className='shrink-0 text-[10px]'
                        >
                          {REMINDER_TYPE_LABELS[reminder.reminder_type] ||
                            reminder.reminder_type}
                        </Badge>
                        <Badge
                          variant={
                            reminder.priority === 'URGENT'
                              ? 'destructive'
                              : 'secondary'
                          }
                          className='shrink-0 text-[10px]'
                        >
                          {reminder.priority}
                        </Badge>
                        {reminder.auto_generated && (
                          <Badge
                            variant='outline'
                            className='shrink-0 text-[10px]'
                          >
                            Auto
                          </Badge>
                        )}
                      </div>
                      <p className='text-muted-foreground mt-1 line-clamp-2 text-xs'>
                        {reminder.message}
                      </p>
                      <div className='text-muted-foreground mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px]'>
                        {reminder.student_name && (
                          <span>Student: {reminder.student_name}</span>
                        )}
                        <span>To: {reminder.recipient_type}</span>
                        <span>
                          Created{' '}
                          {formatDistanceToNow(parseISO(reminder.created_at), {
                            addSuffix: true
                          })}
                        </span>
                        {reminder.sent_at && (
                          <span className='text-green-600'>
                            Sent {format(parseISO(reminder.sent_at), 'PP p')}
                          </span>
                        )}
                        {reminder.scheduled_for && !reminder.sent_at && (
                          <span className='text-amber-600'>
                            Scheduled:{' '}
                            {format(parseISO(reminder.scheduled_for), 'PP p')}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className='flex shrink-0 gap-1'>
                      {!reminder.sent_at && (
                        <Button
                          size='sm'
                          variant='outline'
                          onClick={() => sendNowMutation.mutate(reminder.id)}
                          disabled={sendNowMutation.isPending}
                        >
                          <Send className='mr-1 h-3 w-3' />
                          Send
                        </Button>
                      )}
                      <Button
                        size='sm'
                        variant='ghost'
                        className='text-destructive'
                        onClick={() => deleteMutation.mutate(reminder.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className='h-3.5 w-3.5' />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </PageContainer>
  );
}

function CreateReminderDialog({
  open,
  onOpenChange
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { api } = useClientApi();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    title: '',
    message: '',
    recipient_type: 'STUDENT',
    reminder_type: 'GENERAL',
    priority: 'NORMAL'
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      await api!.post('/admin/reminders/', form);
    },
    onSuccess: () => {
      toast.success('Reminder created');
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      onOpenChange(false);
      setForm({
        title: '',
        message: '',
        recipient_type: 'STUDENT',
        reminder_type: 'GENERAL',
        priority: 'NORMAL'
      });
    },
    onError: () => toast.error('Failed to create reminder')
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button size='sm'>
          <Plus className='mr-1.5 h-4 w-4' />
          New Reminder
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Reminder</DialogTitle>
        </DialogHeader>
        <div className='space-y-4'>
          <Input
            placeholder='Reminder title'
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <Textarea
            placeholder='Message...'
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            rows={3}
          />
          <div className='grid grid-cols-3 gap-2'>
            <Select
              value={form.recipient_type}
              onValueChange={(v) => setForm({ ...form, recipient_type: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='STUDENT'>Student</SelectItem>
                <SelectItem value='PARENT'>Parent</SelectItem>
                <SelectItem value='BOTH'>Both</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={form.reminder_type}
              onValueChange={(v) => setForm({ ...form, reminder_type: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(REMINDER_TYPE_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={form.priority}
              onValueChange={(v) => setForm({ ...form, priority: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='LOW'>Low</SelectItem>
                <SelectItem value='NORMAL'>Normal</SelectItem>
                <SelectItem value='HIGH'>High</SelectItem>
                <SelectItem value='URGENT'>Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            className='w-full'
            onClick={() => createMutation.mutate()}
            disabled={!form.title || !form.message || createMutation.isPending}
          >
            {createMutation.isPending ? 'Creating...' : 'Create Reminder'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
