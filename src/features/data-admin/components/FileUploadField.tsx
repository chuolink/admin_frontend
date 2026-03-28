'use client';

import { useState, useRef } from 'react';
import { Upload, X, FileText, Film, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FileUploadFieldProps {
  /** Current value — either a URL string (existing file) or a File object (new upload) */
  value: string | File | null;
  /** Called with File on new upload, null on clear, or string URL if unchanged */
  onChange: (value: File | string | null) => void;
  /** Accept filter for the file input */
  accept?: string;
  /** Type hint for display */
  type?: 'image' | 'video' | 'file';
  /** Placeholder text */
  placeholder?: string;
  /** Optional className */
  className?: string;
}

function isImageUrl(url: string): boolean {
  if (!url) return false;
  const lower = url.toLowerCase();
  return (
    lower.includes('/image/') ||
    lower.endsWith('.jpg') ||
    lower.endsWith('.jpeg') ||
    lower.endsWith('.png') ||
    lower.endsWith('.gif') ||
    lower.endsWith('.webp') ||
    lower.endsWith('.svg') ||
    (lower.includes('cloudinary') && lower.includes('/image/'))
  );
}

function isVideoUrl(url: string): boolean {
  if (!url) return false;
  const lower = url.toLowerCase();
  return (
    lower.endsWith('.mp4') ||
    lower.endsWith('.webm') ||
    lower.endsWith('.mov') ||
    lower.includes('/video/') ||
    (lower.includes('cloudinary') && lower.includes('/video/'))
  );
}

export function FileUploadField({
  value,
  onChange,
  accept,
  type = 'file',
  placeholder,
  className
}: FileUploadFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const defaultAccept =
    type === 'image'
      ? 'image/*'
      : type === 'video'
        ? 'video/*,.mp4,.webm,.mov'
        : '.pdf,.jpg,.png,.jpeg,.doc,.docx,.mp4';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onChange(file);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) onChange(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const isFile = value instanceof File;
  const isUrl = typeof value === 'string' && value.length > 0;
  const hasValue = isFile || isUrl;

  const url = isUrl ? value : isFile ? URL.createObjectURL(value) : '';
  const fileName = isFile
    ? value.name
    : isUrl
      ? value.split('/').pop() || 'File'
      : '';
  const fileSize = isFile ? `${(value.size / 1024).toFixed(0)} KB` : '';

  const showImagePreview =
    (type === 'image' || (isUrl && isImageUrl(value as string))) && url;
  const showVideoPreview =
    (type === 'video' || (isUrl && isVideoUrl(value as string))) && url;

  return (
    <div className={cn('space-y-2', className)}>
      <input
        ref={fileInputRef}
        type='file'
        className='hidden'
        accept={accept || defaultAccept}
        onChange={handleFileChange}
      />

      {hasValue ? (
        <div className='bg-muted/30 rounded-lg border p-3'>
          {/* Preview */}
          {showImagePreview && (
            <div className='mb-2 overflow-hidden rounded-md'>
              <img
                src={url}
                alt='Preview'
                className='h-32 w-full object-cover'
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          )}
          {showVideoPreview && (
            <div className='mb-2 overflow-hidden rounded-md'>
              <video
                src={url}
                className='h-32 w-full object-cover'
                controls={false}
                muted
              />
            </div>
          )}

          {/* File info + actions */}
          <div className='flex items-center gap-2'>
            {type === 'image' ? (
              <ImageIcon className='text-muted-foreground h-4 w-4 shrink-0' />
            ) : type === 'video' ? (
              <Film className='text-muted-foreground h-4 w-4 shrink-0' />
            ) : (
              <FileText className='text-muted-foreground h-4 w-4 shrink-0' />
            )}
            <div className='min-w-0 flex-1'>
              <p className='truncate text-xs font-medium'>{fileName}</p>
              {fileSize && (
                <p className='text-muted-foreground text-[10px]'>{fileSize}</p>
              )}
              {isUrl && !isFile && (
                <a
                  href={value as string}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-primary text-[10px] hover:underline'
                >
                  View current file
                </a>
              )}
            </div>
            <div className='flex shrink-0 gap-1'>
              <Button
                type='button'
                variant='outline'
                size='sm'
                className='h-7 text-xs'
                onClick={() => fileInputRef.current?.click()}
              >
                Replace
              </Button>
              <Button
                type='button'
                variant='ghost'
                size='icon'
                className='text-destructive hover:text-destructive h-7 w-7'
                onClick={() => onChange(null)}
              >
                <X className='h-3.5 w-3.5' />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <button
          type='button'
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={() => setDragOver(false)}
          className={cn(
            'flex w-full cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed px-4 py-6 text-center transition-colors',
            dragOver
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/20 hover:border-muted-foreground/40 hover:bg-muted/30'
          )}
        >
          <Upload className='text-muted-foreground h-5 w-5' />
          <div>
            <p className='text-muted-foreground text-xs font-medium'>
              {placeholder || `Click to upload ${type}`}
            </p>
            <p className='text-muted-foreground/60 text-[10px]'>
              {type === 'image'
                ? 'JPG, PNG, GIF, WebP'
                : type === 'video'
                  ? 'MP4, WebM, MOV'
                  : 'Any file type'}
            </p>
          </div>
        </button>
      )}
    </div>
  );
}

/**
 * Render an image/video thumbnail in a table cell.
 * Shows a small preview for images, icon for videos/files.
 */
export function MediaThumbnail({
  url,
  type = 'auto',
  size = 'sm'
}: {
  url: string | null | undefined;
  type?: 'image' | 'video' | 'file' | 'auto';
  size?: 'sm' | 'md';
}) {
  if (!url) return <span className='text-muted-foreground text-xs'>—</span>;

  const detectType =
    type === 'auto'
      ? isImageUrl(url)
        ? 'image'
        : isVideoUrl(url)
          ? 'video'
          : 'file'
      : type;

  const sizeClass = size === 'sm' ? 'h-8 w-8' : 'h-12 w-12';

  if (detectType === 'image') {
    return (
      <a href={url} target='_blank' rel='noopener noreferrer' className='block'>
        <img
          src={url}
          alt=''
          className={cn(
            sizeClass,
            'rounded border object-cover transition-opacity hover:opacity-80'
          )}
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
            (e.target as HTMLImageElement).parentElement!.innerHTML =
              '<span class="text-muted-foreground text-xs">🖼</span>';
          }}
        />
      </a>
    );
  }

  if (detectType === 'video') {
    return (
      <a
        href={url}
        target='_blank'
        rel='noopener noreferrer'
        className='text-primary flex items-center gap-1 text-xs hover:underline'
      >
        <Film className='h-3.5 w-3.5' />
        Video
      </a>
    );
  }

  return (
    <a
      href={url}
      target='_blank'
      rel='noopener noreferrer'
      className='text-primary flex items-center gap-1 text-xs hover:underline'
    >
      <FileText className='h-3.5 w-3.5' />
      File
    </a>
  );
}
