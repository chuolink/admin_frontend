// @ts-nocheck
'use client';

import { useRef, useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useClientApi from '@/lib/axios/clientSide';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Send, Paperclip, X } from 'lucide-react';
import { ChatMessage } from './ChatMessage';
import { toast } from 'sonner';

interface ChatInterfaceProps {
  threadId: string | null;
  threadType: 'verification' | 'support';
  /** If no threadId yet, pass expertId to search for thread */
  expertId?: string;
}

export function ChatInterface({
  threadId,
  threadType,
  expertId
}: ChatInterfaceProps) {
  const { api } = useClientApi();
  const queryClient = useQueryClient();
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const basePath =
    threadType === 'verification'
      ? '/admin/expert-verification-threads'
      : '/admin/expert-support-threads';

  // If we don't have a threadId but have an expertId, find the thread
  const { data: threads } = useQuery({
    queryKey: [threadType + '-threads', expertId],
    queryFn: async () => {
      if (!api) throw new Error('API not initialized');
      const res = await api.get(`${basePath}/`, {
        params: { expert: expertId }
      });
      return res.data?.results || res.data || [];
    },
    enabled: !!api && !threadId && !!expertId
  });

  const resolvedThreadId = threadId || threads?.[0]?.id;

  // Fetch thread detail with messages
  const { data: thread, isLoading } = useQuery({
    queryKey: [threadType + '-thread', resolvedThreadId],
    queryFn: async () => {
      if (!api) throw new Error('API not initialized');
      const res = await api.get(`${basePath}/${resolvedThreadId}/`);
      return res.data;
    },
    enabled: !!api && !!resolvedThreadId,
    refetchInterval: 10000 // poll every 10s
  });

  // Mark as read
  useEffect(() => {
    if (api && resolvedThreadId && thread) {
      api.post(`${basePath}/${resolvedThreadId}/mark_read/`).catch(() => {});
    }
  }, [api, resolvedThreadId, thread, basePath]);

  // Auto-scroll to bottom
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
          `${basePath}/${resolvedThreadId}/send_message/`,
          formData,
          {
            headers: { 'Content-Type': 'multipart/form-data' }
          }
        );
      }

      return api.post(`${basePath}/${resolvedThreadId}/send_message/`, {
        content,
        sender_role: 'admin',
        message_type: 'text'
      });
    },
    onSuccess: () => {
      setMessage('');
      setSelectedFile(null);
      queryClient.invalidateQueries({
        queryKey: [threadType + '-thread', resolvedThreadId]
      });
    },
    onError: () => {
      toast.error('Failed to send message');
    }
  });

  const handleSend = () => {
    const trimmed = message.trim();
    if ((!trimmed && !selectedFile) || !resolvedThreadId) return;
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
      // Limit to 10MB
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be under 10MB');
        return;
      }
      setSelectedFile(file);
    }
    // Reset the input so the same file can be re-selected
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (!resolvedThreadId) {
    return (
      <div className='text-muted-foreground flex h-64 items-center justify-center text-sm'>
        No {threadType} thread found for this expert.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className='flex h-64 items-center justify-center'>
        <Loader2 className='text-muted-foreground h-6 w-6 animate-spin' />
      </div>
    );
  }

  const messages = thread?.messages || [];

  return (
    <div className='flex h-[500px] flex-col'>
      {/* Messages area */}
      <div ref={scrollRef} className='flex-1 overflow-y-auto p-4'>
        {messages.length === 0 ? (
          <div className='text-muted-foreground flex h-full items-center justify-center text-sm'>
            No messages yet. Start the conversation.
          </div>
        ) : (
          messages.map((msg: any, index: number) => (
            <ChatMessage key={msg.id || index} message={msg} />
          ))
        )}
      </div>

      {/* Input area */}
      <div className='border-t p-4'>
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
            className='shrink-0'
            onClick={() => fileInputRef.current?.click()}
            title='Attach file'
          >
            <Paperclip className='h-4 w-4' />
          </Button>
          <Textarea
            placeholder='Type a message...'
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            className='min-h-[40px] resize-none'
            rows={1}
          />
          <Button
            size='icon'
            onClick={handleSend}
            disabled={
              (!message.trim() && !selectedFile) || sendMutation.isPending
            }
          >
            {sendMutation.isPending ? (
              <Loader2 className='h-4 w-4 animate-spin' />
            ) : (
              <Send className='h-4 w-4' />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
