'use client';

import { DataTable } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import { IconSend, IconEye } from '@tabler/icons-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import useClientApi from '@/lib/axios/clientSide';

const columns = [
  {
    header: 'ID',
    accessorKey: 'id'
  },
  {
    header: 'Subject',
    accessorKey: 'subject'
  },
  {
    header: 'Recipients',
    accessorKey: 'recipient_count'
  },
  {
    header: 'Status',
    accessorKey: 'status',
    cell: ({ row }) => {
      const status = row.original.status;
      return (
        <Badge
          variant={
            status === 'sent'
              ? 'success'
              : status === 'sending'
                ? 'warning'
                : status === 'failed'
                  ? 'destructive'
                  : 'default'
          }
        >
          {status}
        </Badge>
      );
    }
  },
  {
    header: 'Sent Date',
    accessorKey: 'sent_at',
    cell: ({ row }) => formatDate(row.original.sent_at)
  },
  {
    header: 'Actions',
    cell: ({ row }) => (
      <div className='flex space-x-2'>
        <Dialog>
          <DialogTrigger asChild>
            <Button size='sm' variant='outline'>
              <IconEye className='h-4 w-4' />
            </Button>
          </DialogTrigger>
          <DialogContent className='max-w-3xl'>
            <DialogHeader>
              <DialogTitle>Email Details</DialogTitle>
            </DialogHeader>
            <EmailDetails email={row.original} />
          </DialogContent>
        </Dialog>
      </div>
    )
  }
];

function EmailDetails({ email }) {
  return (
    <div className='space-y-4'>
      <div className='grid grid-cols-2 gap-4'>
        <div>
          <h3 className='font-semibold'>Email Information</h3>
          <p>Subject: {email.subject}</p>
          <p>Status: {email.status}</p>
          <p>Sent: {formatDate(email.sent_at)}</p>
        </div>
        <div>
          <h3 className='font-semibold'>Recipients</h3>
          <p>Total Recipients: {email.recipient_count}</p>
          <p>Successful: {email.successful_deliveries}</p>
          <p>Failed: {email.failed_deliveries}</p>
        </div>
      </div>
      <div>
        <h3 className='font-semibold'>Content</h3>
        <div className='bg-muted mt-2 rounded-md p-4'>
          <p className='whitespace-pre-wrap'>{email.content}</p>
        </div>
      </div>
      {email.error && (
        <div>
          <h3 className='text-destructive font-semibold'>Error</h3>
          <p className='text-destructive'>{email.error}</p>
        </div>
      )}
    </div>
  );
}

function SendEmailForm({ onSuccess }) {
  const [formData, setFormData] = useState({
    subject: '',
    content: '',
    recipient_type: 'all',
    recipient_ids: '',
    template: 'default'
  });

  const { api } = useClientApi();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!api) {
      toast.error('Not authenticated');
      return;
    }
    try {
      await api.post('/api/v1/admin/emails/', formData);
      toast.success('Email sent successfully');
      onSuccess?.();
    } catch (error) {
      toast.error('Failed to send email');
      console.error('Error sending email:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <div className='space-y-2'>
        <Label htmlFor='template'>Email Template</Label>
        <select
          id='template'
          value={formData.template}
          onChange={(e) =>
            setFormData({ ...formData, template: e.target.value })
          }
          className='border-input bg-background w-full rounded-md border px-3 py-2'
        >
          <option value='default'>Default Template</option>
          <option value='welcome'>Welcome Email</option>
          <option value='payment'>Payment Confirmation</option>
          <option value='withdrawal'>Withdrawal Update</option>
          <option value='application'>Application Status</option>
        </select>
      </div>
      <div className='space-y-2'>
        <Label htmlFor='subject'>Subject</Label>
        <Input
          id='subject'
          value={formData.subject}
          onChange={(e) =>
            setFormData({ ...formData, subject: e.target.value })
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
            setFormData({ ...formData, content: e.target.value })
          }
          required
          rows={6}
        />
      </div>
      <div className='space-y-2'>
        <Label htmlFor='recipient_type'>Recipient Type</Label>
        <select
          id='recipient_type'
          value={formData.recipient_type}
          onChange={(e) =>
            setFormData({ ...formData, recipient_type: e.target.value })
          }
          className='border-input bg-background w-full rounded-md border px-3 py-2'
        >
          <option value='all'>All Students</option>
          <option value='specific'>Specific Students</option>
          <option value='group'>Student Group</option>
        </select>
      </div>
      {formData.recipient_type !== 'all' && (
        <div className='space-y-2'>
          <Label htmlFor='recipient_ids'>
            {formData.recipient_type === 'specific'
              ? 'Student IDs (comma-separated)'
              : 'Group ID'}
          </Label>
          <Input
            id='recipient_ids'
            value={formData.recipient_ids}
            onChange={(e) =>
              setFormData({ ...formData, recipient_ids: e.target.value })
            }
            required
          />
        </div>
      )}
      <Button type='submit' className='w-full'>
        Send Email
      </Button>
    </form>
  );
}

export default function EmailsPage() {
  const { api } = useClientApi();
  const [emails, setEmails] = useState([]);
  const [stats, setStats] = useState({
    total_emails: 0,
    successful_deliveries: 0,
    failed_deliveries: 0,
    delivery_rate: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!api) return;
    try {
      const [emailsRes, statsRes] = await Promise.all([
        api.get('/api/v1/admin/emails/'),
        api.get('/api/v1/admin/emails/stats/')
      ]);
      setEmails(emailsRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
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
        <h1 className='text-3xl font-bold'>Email Management</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <IconSend className='mr-2 h-4 w-4' />
              Send New Email
            </Button>
          </DialogTrigger>
          <DialogContent className='max-w-3xl'>
            <DialogHeader>
              <DialogTitle>Send New Email</DialogTitle>
            </DialogHeader>
            <SendEmailForm onSuccess={fetchData} />
          </DialogContent>
        </Dialog>
      </div>

      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Emails</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.total_emails}</div>
            <p className='text-muted-foreground text-xs'>
              All time emails sent
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
              Successfully delivered emails
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
              Failed email deliveries
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
              Email delivery success rate
            </p>
          </CardContent>
        </Card>
      </div>

      <DataTable
        columns={columns.map((col) => {
          if (col.header === 'Actions') {
            return {
              ...col,
              cell: ({ row }) => (
                <div className='flex space-x-2'>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size='sm' variant='outline'>
                        <IconEye className='h-4 w-4' />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className='max-w-3xl'>
                      <DialogHeader>
                        <DialogTitle>Email Details</DialogTitle>
                      </DialogHeader>
                      <EmailDetails email={row.original} />
                    </DialogContent>
                  </Dialog>
                </div>
              )
            };
          }
          return col;
        })}
        data={emails}
        searchKey='subject'
      />
    </div>
  );
}
