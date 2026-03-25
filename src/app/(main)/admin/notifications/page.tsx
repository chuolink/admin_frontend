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
  Send,
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle,
  Info,
  AlertTriangle,
  Trash2,
  Mail,
  Users,
  User,
  Bell,
  BellRing
} from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow, parseISO, format } from 'date-fns';

interface Notification {
  id: number;
  title: string;
  message: string;
  email_body: string | null;
  is_sent: boolean;
  to: 'all' | 'single';
  channel: 'notification' | 'email' | 'both';
  category: string;
  type: 'danger' | 'warning' | 'info' | 'success';
  data_type: string | null;
  recipient_count: number;
  recipient_name: string;
  when: string | null;
  created_at: string;
  updated_at: string;
  user: string | null;
  student: string | null;
}

const TYPE_CONFIG: Record<
  string,
  { color: string; icon: React.ElementType; label: string }
> = {
  info: { color: 'text-blue-600', icon: Info, label: 'Info' },
  success: { color: 'text-green-600', icon: CheckCircle2, label: 'Success' },
  warning: { color: 'text-amber-600', icon: AlertTriangle, label: 'Warning' },
  danger: { color: 'text-destructive', icon: AlertCircle, label: 'Danger' }
};

const CATEGORY_LABELS: Record<string, string> = {
  general: 'General',
  application: 'Application',
  course: 'Course',
  university: 'University',
  scholarship: 'Scholarship',
  career: 'Career',
  country: 'Country'
};

export default function NotificationsPage() {
  const { api } = useClientApi();
  const queryClient = useQueryClient();
  const [sentFilter, setSentFilter] = useState<string>('ALL');
  const [createOpen, setCreateOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-notifications', sentFilter],
    queryFn: async () => {
      const params: Record<string, string> = { order_by: '-created_at' };
      if (sentFilter === 'SENT') params.is_sent = 'true';
      if (sentFilter === 'UNSENT') params.is_sent = 'false';
      const response = await api!.get('/admin/notifications/', { params });
      return response.data;
    },
    enabled: !!api
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await api!.delete(`/admin/notifications/${id}/`);
    },
    onSuccess: () => {
      toast.success('Notification deleted');
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
    },
    onError: () => toast.error('Failed to delete')
  });

  const notifications: Notification[] = data?.results || data || [];
  const sentCount = notifications.filter((n) => n.is_sent).length;
  const scheduledCount = notifications.filter(
    (n) => !n.is_sent && n.when
  ).length;

  return (
    <PageContainer className='w-full'>
      <div className='w-full space-y-6'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>Notifications</h1>
            <p className='text-muted-foreground'>
              Send push notifications and announcements to students
            </p>
          </div>
          <CreateNotificationDialog
            open={createOpen}
            onOpenChange={setCreateOpen}
          />
        </div>

        {/* Stats */}
        <div className='grid grid-cols-2 gap-4 lg:grid-cols-4'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Total</CardTitle>
              <Mail className='text-muted-foreground h-4 w-4' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{notifications.length}</div>
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
              <CardTitle className='text-sm font-medium'>Scheduled</CardTitle>
              <Clock className='h-4 w-4 text-amber-500' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-amber-600'>
                {scheduledCount}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Draft</CardTitle>
              <Send className='text-muted-foreground h-4 w-4' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {notifications.length - sentCount - scheduledCount}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className='flex flex-wrap gap-2'>
          <Select value={sentFilter} onValueChange={setSentFilter}>
            <SelectTrigger className='w-[150px]'>
              <SelectValue placeholder='Status' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='ALL'>All</SelectItem>
              <SelectItem value='SENT'>Sent</SelectItem>
              <SelectItem value='UNSENT'>Not Sent</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Notifications list */}
        {isLoading ? (
          <div className='space-y-3'>
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className='h-24 rounded-lg' />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <Card>
            <CardContent className='flex flex-col items-center py-12'>
              <Mail className='text-muted-foreground mb-3 h-8 w-8' />
              <p className='text-muted-foreground text-sm'>
                No notifications found.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className='space-y-2'>
            {notifications.map((notification) => {
              const typeConfig =
                TYPE_CONFIG[notification.type] || TYPE_CONFIG.info;
              const TypeIcon = typeConfig.icon;
              return (
                <Card key={notification.id}>
                  <CardContent className='flex items-start gap-4 py-4'>
                    <div className={`mt-0.5 shrink-0 ${typeConfig.color}`}>
                      <TypeIcon className='h-5 w-5' />
                    </div>
                    <div className='min-w-0 flex-1'>
                      <div className='flex items-center gap-2'>
                        <p className='truncate text-sm font-medium'>
                          {notification.title}
                        </p>
                        <Badge
                          variant='outline'
                          className='shrink-0 text-[10px]'
                        >
                          {CATEGORY_LABELS[notification.category] ||
                            notification.category}
                        </Badge>
                        <Badge
                          variant={
                            notification.type === 'danger'
                              ? 'destructive'
                              : 'secondary'
                          }
                          className='shrink-0 text-[10px]'
                        >
                          {typeConfig.label}
                        </Badge>
                        {notification.is_sent ? (
                          <Badge className='shrink-0 gap-1 border-green-500/20 bg-green-500/10 text-[10px] text-green-600'>
                            <CheckCircle2 className='h-2.5 w-2.5' />
                            Sent
                          </Badge>
                        ) : (
                          <Badge
                            variant='outline'
                            className='shrink-0 gap-1 text-[10px] text-amber-600'
                          >
                            <Clock className='h-2.5 w-2.5' />
                            Pending
                          </Badge>
                        )}
                      </div>
                      <p className='text-muted-foreground mt-1 line-clamp-2 text-xs'>
                        {notification.message}
                      </p>
                      <div className='text-muted-foreground mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px]'>
                        <span className='flex items-center gap-1'>
                          {notification.to === 'all' ? (
                            <>
                              <Users className='h-2.5 w-2.5' /> All students
                            </>
                          ) : (
                            <>
                              <User className='h-2.5 w-2.5' />{' '}
                              {notification.recipient_name || 'Single student'}
                            </>
                          )}
                        </span>
                        <span className='flex items-center gap-1'>
                          {notification.channel === 'email' ? (
                            <>
                              <Mail className='h-2.5 w-2.5' /> Email
                            </>
                          ) : notification.channel === 'both' ? (
                            <>
                              <BellRing className='h-2.5 w-2.5' /> Push + Email
                            </>
                          ) : (
                            <>
                              <Bell className='h-2.5 w-2.5' /> Push Notification
                            </>
                          )}
                        </span>
                        {notification.is_sent && (
                          <span className='text-green-600'>
                            {notification.recipient_count} recipient
                            {notification.recipient_count !== 1 ? 's' : ''}
                          </span>
                        )}
                        <span>
                          Created{' '}
                          {formatDistanceToNow(
                            parseISO(notification.created_at),
                            {
                              addSuffix: true
                            }
                          )}
                        </span>
                        {notification.when && !notification.is_sent && (
                          <span className='text-amber-600'>
                            Scheduled:{' '}
                            {format(parseISO(notification.when), 'PP p')}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className='flex shrink-0 gap-1'>
                      <Button
                        size='sm'
                        variant='ghost'
                        className='text-destructive'
                        onClick={() => deleteMutation.mutate(notification.id)}
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

function CreateNotificationDialog({
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
    email_body: '',
    to: 'all' as 'all' | 'single',
    channel: 'notification' as 'notification' | 'email' | 'both',
    category: 'general',
    type: 'info',
    student: ''
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const payload: Record<string, unknown> = {
        title: form.title,
        message: form.message,
        to: form.to,
        channel: form.channel,
        category: form.category,
        type: form.type
      };
      if (form.channel !== 'notification' && form.email_body) {
        payload.email_body = form.email_body;
      }
      if (form.to === 'single' && form.student) {
        payload.student = form.student;
      }
      await api!.post('/admin/notifications/', payload);
    },
    onSuccess: () => {
      toast.success('Notification created');
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
      onOpenChange(false);
      setForm({
        title: '',
        message: '',
        email_body: '',
        to: 'all',
        channel: 'notification',
        category: 'general',
        type: 'info',
        student: ''
      });
    },
    onError: () => toast.error('Failed to create notification')
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button size='sm'>
          <Plus className='mr-1.5 h-4 w-4' />
          New Notification
        </Button>
      </DialogTrigger>
      <DialogContent className='max-w-lg'>
        <DialogHeader>
          <DialogTitle>Create Notification</DialogTitle>
        </DialogHeader>
        <div className='space-y-4'>
          {/* Delivery Channel */}
          <div>
            <label className='text-muted-foreground mb-1.5 block text-xs font-medium'>
              Delivery Channel
            </label>
            <div className='grid grid-cols-3 gap-2'>
              {[
                {
                  value: 'notification' as const,
                  label: 'Push Only',
                  icon: Bell
                },
                { value: 'email' as const, label: 'Email Only', icon: Mail },
                { value: 'both' as const, label: 'Both', icon: BellRing }
              ].map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type='button'
                  onClick={() => setForm({ ...form, channel: value })}
                  className={`flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
                    form.channel === value
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'hover:bg-accent text-muted-foreground'
                  }`}
                >
                  <Icon className='h-4 w-4' />
                  {label}
                </button>
              ))}
            </div>
          </div>

          <Input
            placeholder='Title'
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <Input
            placeholder='Short message (push notification text)'
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
          />

          {/* Email body shown when email or both is selected */}
          {form.channel !== 'notification' && (
            <Textarea
              placeholder='Email body (supports markdown formatting)'
              value={form.email_body}
              onChange={(e) => setForm({ ...form, email_body: e.target.value })}
              rows={4}
            />
          )}

          <div className='grid grid-cols-2 gap-2'>
            <Select
              value={form.to}
              onValueChange={(v) =>
                setForm({ ...form, to: v as 'all' | 'single' })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder='Recipients' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Students</SelectItem>
                <SelectItem value='single'>Single Student</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={form.category}
              onValueChange={(v) => setForm({ ...form, category: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder='Category' />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Select
            value={form.type}
            onValueChange={(v) => setForm({ ...form, type: v })}
          >
            <SelectTrigger>
              <SelectValue placeholder='Type' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='info'>Info</SelectItem>
              <SelectItem value='success'>Success</SelectItem>
              <SelectItem value='warning'>Warning</SelectItem>
              <SelectItem value='danger'>Danger</SelectItem>
            </SelectContent>
          </Select>
          {form.to === 'single' && (
            <Input
              placeholder='Student ID (e.g. student_xxx)'
              value={form.student}
              onChange={(e) => setForm({ ...form, student: e.target.value })}
            />
          )}
          <Button
            className='w-full'
            onClick={() => createMutation.mutate()}
            disabled={!form.title || !form.message || createMutation.isPending}
          >
            <Send className='mr-1.5 h-4 w-4' />
            {createMutation.isPending ? 'Creating...' : 'Create & Send'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
