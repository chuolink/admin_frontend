'use client';

import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import useClientApi from '@/lib/axios/clientSide';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import { Bell, Send } from 'lucide-react';
import { toast } from 'sonner';

interface SendNotificationDialogProps {
  studentId: string;
  studentName: string;
  applicationId?: string;
  trigger?: React.ReactNode;
}

export default function SendNotificationDialog({
  studentId,
  studentName,
  applicationId,
  trigger
}: SendNotificationDialogProps) {
  const { api } = useClientApi();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: '',
    message: '',
    type: 'info' as string,
    category: applicationId ? 'application' : 'general'
  });

  const notifyMutation = useMutation({
    mutationFn: async () => {
      await api!.post('/admin/notifications/', {
        title: form.title,
        message: form.message,
        type: form.type,
        category: form.category,
        to: 'single',
        student: studentId
      });
    },
    onSuccess: () => {
      toast.success(`Notification sent to ${studentName}`);
      setOpen(false);
      setForm({
        title: '',
        message: '',
        type: 'info',
        category: applicationId ? 'application' : 'general'
      });
    },
    onError: () => toast.error('Failed to send notification')
  });

  const reminderMutation = useMutation({
    mutationFn: async () => {
      await api!.post('/admin/reminders/', {
        title: form.title,
        message: form.message,
        priority:
          form.type === 'danger'
            ? 'URGENT'
            : form.type === 'warning'
              ? 'HIGH'
              : 'NORMAL',
        reminder_type: 'GENERAL',
        recipient_type: 'BOTH',
        student: studentId,
        application: applicationId || undefined
      });
    },
    onSuccess: () => {
      toast.success(`Reminder created for ${studentName}`);
      setOpen(false);
      setForm({
        title: '',
        message: '',
        type: 'info',
        category: applicationId ? 'application' : 'general'
      });
    },
    onError: () => toast.error('Failed to create reminder')
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant='outline' size='sm'>
            <Bell className='mr-1.5 h-4 w-4' />
            Notify
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send to {studentName}</DialogTitle>
        </DialogHeader>
        <div className='space-y-4'>
          <Input
            placeholder='Title'
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <Textarea
            placeholder='Message...'
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            rows={3}
          />
          <div className='grid grid-cols-2 gap-2'>
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
                <SelectItem value='danger'>Urgent</SelectItem>
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
                <SelectItem value='general'>General</SelectItem>
                <SelectItem value='application'>Application</SelectItem>
                <SelectItem value='university'>University</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className='flex gap-2'>
            <Button
              className='flex-1'
              onClick={() => notifyMutation.mutate()}
              disabled={
                !form.title ||
                !form.message ||
                notifyMutation.isPending ||
                reminderMutation.isPending
              }
            >
              <Send className='mr-1.5 h-4 w-4' />
              {notifyMutation.isPending ? 'Sending...' : 'Send Notification'}
            </Button>
            <Button
              variant='outline'
              className='flex-1'
              onClick={() => reminderMutation.mutate()}
              disabled={
                !form.title ||
                !form.message ||
                notifyMutation.isPending ||
                reminderMutation.isPending
              }
            >
              <Bell className='mr-1.5 h-4 w-4' />
              {reminderMutation.isPending ? 'Creating...' : 'Create Reminder'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
