// @ts-nocheck
'use client';

import { useRef, useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useClientApi from '@/lib/axios/clientSide';
import { DataSheet } from '@/features/data-admin/components/DataSheet';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Loader2, Send, CheckCircle, X, Paperclip } from 'lucide-react';
import { ChatMessage } from './ChatMessage';
import { toast } from 'sonner';

interface SupportChatSheetProps {
  threadId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const statusColors: Record<string, string> = {
  open: 'bg-amber-100 text-amber-800 border-amber-200',
  in_progress: 'bg-blue-100 text-blue-800 border-blue-200',
  resolved: 'bg-green-100 text-green-800 border-green-200',
  closed: 'bg-gray-100 text-gray-800 border-gray-200'
};

const priorityColors: Record<string, string> = {
  low: 'border-gray-300',
  medium: 'border-blue-300',
  high: 'border-orange-300 bg-orange-50 text-orange-800',
  urgent: 'border-red-300 bg-red-50 text-red-800'
};

export function SupportChatSheet({
  threadId,
  open,
  onOpenChange
}: SupportChatSheetProps) {
  const { api } = useClientApi();
  const queryClient = useQueryClient();
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { data: thread, isLoading } = useQuery({
    queryKey: ['support-thread', threadId],
    queryFn: async () => {
      if (!api) throw new Error('API not initialized');
      const res = await api.get(`/admin/expert-support-threads/${threadId}/`);
      return res.data;
    },
    enabled: !!api && !!threadId && open,
    refetchInterval: open ? 10000 : false
  });

  // Mark as read when opened
  useEffect(() => {
    if (api && threadId && open) {
      api
        .post(`/admin/expert-support-threads/${threadId}/mark_read/`)
        .catch(() => {});
    }
  }, [api, threadId, open]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [thread?.messages]);

  const sendMutation = useMutation({
    mutationFn: async ({
      content,
      file
    }: {
      content: string;
      file: File | null;
    }) => {
      if (!api) throw new Error('API not initialized');

      if (file) {
        const formData = new FormData();
        formData.append('content', content);
        formData.append('sender_role', 'admin');
        formData.append('message_type', 'file');
        formData.append('file', file);
        return api.post(
          `/admin/expert-support-threads/${threadId}/send_message/`,
          formData,
          {
            headers: { 'Content-Type': 'multipart/form-data' }
          }
        );
      }

      return api.post(
        `/admin/expert-support-threads/${threadId}/send_message/`,
        {
          content,
          sender_role: 'admin',
          message_type: 'text'
        }
      );
    },
    onSuccess: () => {
      setMessage('');
      setSelectedFile(null);
      queryClient.invalidateQueries({ queryKey: ['support-thread', threadId] });
      queryClient.invalidateQueries({ queryKey: ['support-threads'] });
    },
    onError: () => {
      toast.error('Failed to send message');
    }
  });

  const resolveMutation = useMutation({
    mutationFn: async () => {
      if (!api) throw new Error('API not initialized');
      return api.post(`/admin/expert-support-threads/${threadId}/resolve/`);
    },
    onSuccess: () => {
      toast.success('Thread resolved');
      queryClient.invalidateQueries({ queryKey: ['support-thread', threadId] });
      queryClient.invalidateQueries({ queryKey: ['support-threads'] });
    },
    onError: () => {
      toast.error('Failed to resolve thread');
    }
  });

  const closeMutation = useMutation({
    mutationFn: async () => {
      if (!api) throw new Error('API not initialized');
      return api.post(`/admin/expert-support-threads/${threadId}/close/`);
    },
    onSuccess: () => {
      toast.success('Thread closed');
      queryClient.invalidateQueries({ queryKey: ['support-thread', threadId] });
      queryClient.invalidateQueries({ queryKey: ['support-threads'] });
    },
    onError: () => {
      toast.error('Failed to close thread');
    }
  });

  const handleSend = () => {
    const trimmed = message.trim();
    if (!trimmed && !selectedFile) return;
    sendMutation.mutate({ content: trimmed, file: selectedFile });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be under 10MB');
        return;
      }
      setSelectedFile(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const messages = thread?.messages || [];
  const status = thread?.status || 'open';
  const isClosedOrResolved = status === 'closed' || status === 'resolved';

  return (
    <DataSheet
      open={open}
      onOpenChange={onOpenChange}
      title={thread?.subject || 'Support Thread'}
      description={
        thread?.expert_name ? `From: ${thread.expert_name}` : undefined
      }
      size='xl'
      footer={
        !isClosedOrResolved ? (
          <div className='flex gap-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => resolveMutation.mutate()}
              disabled={resolveMutation.isPending}
            >
              <CheckCircle className='mr-1 h-4 w-4' />
              Resolve
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={() => closeMutation.mutate()}
              disabled={closeMutation.isPending}
            >
              <X className='mr-1 h-4 w-4' />
              Close
            </Button>
          </div>
        ) : undefined
      }
    >
      {isLoading ? (
        <div className='flex h-64 items-center justify-center'>
          <Loader2 className='text-muted-foreground h-6 w-6 animate-spin' />
        </div>
      ) : (
        <div className='flex h-[calc(100vh-220px)] flex-col'>
          {/* Thread info */}
          <div className='mb-3 flex items-center gap-2'>
            <Badge className={statusColors[status] || ''}>
              {status?.replace('_', ' ')}
            </Badge>
            {thread?.priority && (
              <Badge
                variant='outline'
                className={priorityColors[thread.priority] || ''}
              >
                {thread.priority}
              </Badge>
            )}
          </div>
          <Separator className='mb-3' />

          {/* Messages */}
          <div ref={scrollRef} className='flex-1 overflow-y-auto pr-2'>
            {messages.length === 0 ? (
              <div className='text-muted-foreground flex h-full items-center justify-center text-sm'>
                No messages yet.
              </div>
            ) : (
              messages.map((msg: any, index: number) => (
                <ChatMessage key={msg.id || index} message={msg} />
              ))
            )}
          </div>

          {/* Input */}
          {!isClosedOrResolved && (
            <div className='border-t pt-3'>
              {/* Selected file preview */}
              {selectedFile && (
                <div className='bg-muted/50 mb-2 flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm'>
                  <Paperclip className='text-muted-foreground h-3.5 w-3.5 shrink-0' />
                  <span className='truncate'>{selectedFile.name}</span>
                  <span className='text-muted-foreground shrink-0 text-xs'>
                    ({(selectedFile.size / 1024).toFixed(0)} KB)
                  </span>
                  <Button
                    variant='ghost'
                    size='icon'
                    className='ml-auto h-5 w-5'
                    onClick={() => setSelectedFile(null)}
                  >
                    <X className='h-3 w-3' />
                  </Button>
                </div>
              )}
              <div className='flex gap-2'>
                <input
                  ref={fileInputRef}
                  type='file'
                  className='hidden'
                  accept='image/*,.pdf,.doc,.docx,.txt'
                  onChange={handleFileSelect}
                />
                <Button
                  variant='ghost'
                  size='icon'
                  className='shrink-0 self-end'
                  onClick={() => fileInputRef.current?.click()}
                  title='Attach file'
                >
                  <Paperclip className='h-4 w-4' />
                </Button>
                <Textarea
                  placeholder='Type a reply...'
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className='min-h-[40px] resize-none'
                  rows={2}
                />
                <Button
                  size='icon'
                  onClick={handleSend}
                  disabled={
                    (!message.trim() && !selectedFile) || sendMutation.isPending
                  }
                  className='self-end'
                >
                  {sendMutation.isPending ? (
                    <Loader2 className='h-4 w-4 animate-spin' />
                  ) : (
                    <Send className='h-4 w-4' />
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </DataSheet>
  );
}
