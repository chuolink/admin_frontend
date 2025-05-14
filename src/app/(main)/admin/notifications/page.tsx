'use client';

import { DataTable } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import { IconEye, IconPlus, IconFilter } from '@tabler/icons-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import useClientApi from '@/lib/axios/clientSide';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { DateRangePicker } from '@/components/ui/date-range-picker';

const columns = [
  {
    header: 'ID',
    accessorKey: 'id'
  },
  {
    header: 'Title',
    accessorKey: 'title'
  },
  {
    header: 'Type',
    accessorKey: 'type',
    cell: ({ row }) => (
      <Badge
        variant={
          row.original.type === 'email'
            ? 'default'
            : row.original.type === 'sms'
              ? 'secondary'
              : 'outline'
        }
      >
        {row.original.type}
      </Badge>
    )
  },
  {
    header: 'Status',
    accessorKey: 'status',
    cell: ({ row }) => (
      <Badge
        variant={
          row.original.status === 'sent'
            ? 'success'
            : row.original.status === 'sending'
              ? 'warning'
              : 'destructive'
        }
      >
        {row.original.status}
      </Badge>
    )
  },
  {
    header: 'Sent Date',
    accessorKey: 'sent_at',
    cell: ({ row }) => formatDate(row.original.sent_at)
  },
  {
    header: 'Actions',
    cell: ({ row }) => (
      <Dialog>
        <DialogTrigger asChild>
          <Button size='sm' variant='outline'>
            <IconEye className='h-4 w-4' />
          </Button>
        </DialogTrigger>
        <DialogContent className='max-w-3xl'>
          <DialogHeader>
            <DialogTitle>Notification Details</DialogTitle>
          </DialogHeader>
          <NotificationDetails notification={row.original} />
        </DialogContent>
      </Dialog>
    )
  }
];

function NotificationDetails({ notification }) {
  return (
    <div className='space-y-4'>
      <div className='grid grid-cols-2 gap-4'>
        <div>
          <h3 className='font-semibold'>Notification Information</h3>
          <p>Title: {notification.title}</p>
          <p>Type: {notification.type}</p>
          <p>Status: {notification.status}</p>
          <p>Sent: {formatDate(notification.sent_at)}</p>
        </div>
        <div>
          <h3 className='font-semibold'>Recipients</h3>
          <p>Total: {notification.recipient_count}</p>
          <p>Successful: {notification.successful_deliveries}</p>
          <p>Failed: {notification.failed_deliveries}</p>
        </div>
      </div>
      <div>
        <h3 className='font-semibold'>Content</h3>
        <p className='whitespace-pre-wrap'>{notification.content}</p>
      </div>
      {notification.error && (
        <div>
          <h3 className='text-destructive font-semibold'>Error</h3>
          <p className='text-destructive'>{notification.error}</p>
        </div>
      )}
    </div>
  );
}

function NotificationFilters({ onFilterChange }) {
  const [filters, setFilters] = useState({
    type: '',
    dateRange: null,
    status: '',
    recipientType: ''
  });

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className='mb-6 grid grid-cols-1 gap-4 md:grid-cols-4'>
      <div className='space-y-2'>
        <Label>Type</Label>
        <Select
          value={filters.type}
          onValueChange={(value) => handleFilterChange('type', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder='All Types' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value=''>All Types</SelectItem>
            <SelectItem value='email'>Email</SelectItem>
            <SelectItem value='sms'>SMS</SelectItem>
            <SelectItem value='push'>Push</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className='space-y-2'>
        <Label>Status</Label>
        <Select
          value={filters.status}
          onValueChange={(value) => handleFilterChange('status', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder='All Statuses' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value=''>All Statuses</SelectItem>
            <SelectItem value='sent'>Sent</SelectItem>
            <SelectItem value='failed'>Failed</SelectItem>
            <SelectItem value='pending'>Pending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className='space-y-2'>
        <Label>Recipient Type</Label>
        <Select
          value={filters.recipientType}
          onValueChange={(value) => handleFilterChange('recipientType', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder='All Recipients' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value=''>All Recipients</SelectItem>
            <SelectItem value='all'>All Users</SelectItem>
            <SelectItem value='specific'>Specific Users</SelectItem>
            <SelectItem value='group'>User Group</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className='space-y-2'>
        <Label>Date Range</Label>
        <DateRangePicker
          value={filters.dateRange}
          onChange={(value) => handleFilterChange('dateRange', value)}
        />
      </div>
    </div>
  );
}

function SendNotificationForm({ onSuccess }) {
  const { api } = useClientApi();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'email',
    recipient_type: 'all'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!api) {
      toast.error('Not authenticated');
      return;
    }
    setLoading(true);
    try {
      await api.post('/api/v1/admin/notifications/', formData);
      toast.success('Notification sent successfully');
      setFormData({
        title: '',
        content: '',
        type: 'email',
        recipient_type: 'all'
      });
      onSuccess?.();
    } catch (error) {
      toast.error('Failed to send notification');
      console.error('Error sending notification:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <div className='space-y-2'>
        <Label htmlFor='title'>Title</Label>
        <Input
          id='title'
          value={formData.title}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, title: e.target.value }))
          }
          required
        />
      </div>

      <div className='space-y-2'>
        <Label htmlFor='content'>Content</Label>
        <Textarea
          id='content'
          value={formData.content}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, content: e.target.value }))
          }
          required
        />
      </div>

      <div className='grid grid-cols-2 gap-4'>
        <div className='space-y-2'>
          <Label htmlFor='type'>Type</Label>
          <Select
            value={formData.type}
            onValueChange={(value) =>
              setFormData((prev) => ({ ...prev, type: value }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='email'>Email</SelectItem>
              <SelectItem value='sms'>SMS</SelectItem>
              <SelectItem value='push'>Push</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className='space-y-2'>
          <Label htmlFor='recipient_type'>Recipients</Label>
          <Select
            value={formData.recipient_type}
            onValueChange={(value) =>
              setFormData((prev) => ({ ...prev, recipient_type: value }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Students</SelectItem>
              <SelectItem value='active'>Active Students</SelectItem>
              <SelectItem value='inactive'>Inactive Students</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button type='submit' disabled={loading}>
        {loading ? 'Sending...' : 'Send Notification'}
      </Button>
    </form>
  );
}

export default function NotificationsPage() {
  const { api } = useClientApi();
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [stats, setStats] = useState({
    total_notifications: 0,
    successful_deliveries: 0,
    failed_deliveries: 0,
    delivery_rate: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!api) return;
    try {
      const [notificationsRes, statsRes] = await Promise.all([
        api.get('/api/v1/admin/notifications/'),
        api.get('/api/v1/admin/notifications/stats/')
      ]);
      setNotifications(notificationsRes.data);
      setFilteredNotifications(notificationsRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filters) => {
    let filtered = [...notifications];

    if (filters.type) {
      filtered = filtered.filter((n) => n.type === filters.type);
    }

    if (filters.status) {
      filtered = filtered.filter((n) => n.status === filters.status);
    }

    if (filters.recipientType) {
      filtered = filtered.filter(
        (n) => n.recipient_type === filters.recipientType
      );
    }

    if (filters.dateRange) {
      const { from, to } = filters.dateRange;
      filtered = filtered.filter((n) => {
        const notificationDate = new Date(n.created_at);
        return notificationDate >= from && notificationDate <= to;
      });
    }

    setFilteredNotifications(filtered);
  };

  useEffect(() => {
    fetchData();
  }, [api]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-3xl font-bold'>Notifications Management</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <IconPlus className='mr-2 h-4 w-4' />
              Send New Notification
            </Button>
          </DialogTrigger>
          <DialogContent className='max-w-3xl'>
            <DialogHeader>
              <DialogTitle>Send New Notification</DialogTitle>
            </DialogHeader>
            <SendNotificationForm onSuccess={fetchData} />
          </DialogContent>
        </Dialog>
      </div>

      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Total Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {stats.total_notifications}
            </div>
            <p className='text-muted-foreground text-xs'>
              All time notifications
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Successful Deliveries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {stats.successful_deliveries}
            </div>
            <p className='text-muted-foreground text-xs'>
              Successfully delivered notifications
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Failed Deliveries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.failed_deliveries}</div>
            <p className='text-muted-foreground text-xs'>
              Failed notification deliveries
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Delivery Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.delivery_rate}%</div>
            <p className='text-muted-foreground text-xs'>
              Successful delivery rate
            </p>
          </CardContent>
        </Card>
      </div>

      <NotificationFilters onFilterChange={handleFilterChange} />

      <DataTable
        columns={columns}
        data={filteredNotifications}
        searchKey='title'
      />
    </div>
  );
}
