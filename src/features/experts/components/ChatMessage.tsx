// @ts-nocheck
'use client';

import { cn } from '@/lib/utils';
import { Paperclip } from 'lucide-react';

interface ChatMessageProps {
  message: {
    id?: string;
    content: string;
    sender_role: 'admin' | 'expert' | 'system';
    sender_name?: string;
    created_at: string;
    file?: string;
    message_type?: string;
  };
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isAdmin = message.sender_role === 'admin';
  const isSystem = message.sender_role === 'system';

  if (isSystem) {
    return (
      <div className='flex justify-center py-2'>
        <span className='text-muted-foreground bg-muted/50 rounded-full px-3 py-1 text-xs'>
          {message.content}
        </span>
      </div>
    );
  }

  return (
    <div className={cn('mb-3 flex', isAdmin ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[70%] rounded-2xl px-4 py-2',
          isAdmin
            ? 'bg-primary text-primary-foreground rounded-br-md'
            : 'bg-muted rounded-bl-md'
        )}
      >
        <p className='mb-0.5 text-xs font-medium'>
          {message.sender_name || (isAdmin ? 'Admin' : 'Expert')}
        </p>
        <p className='text-sm whitespace-pre-wrap'>{message.content}</p>
        {message.file && (
          <a
            href={message.file}
            target='_blank'
            rel='noopener noreferrer'
            className='mt-1 flex items-center gap-1 text-xs underline'
          >
            <Paperclip className='h-3 w-3' />
            Attachment
          </a>
        )}
        <p className='mt-1 text-[10px] opacity-60'>
          {new Date(message.created_at).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>
      </div>
    </div>
  );
}
