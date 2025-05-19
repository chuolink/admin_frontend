'use client';

import { useState, useId } from 'react';
import useClientApi from '@/lib/axios/clientSide';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { Upload, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  onUploadComplete: (name: string, url: string) => void;
  label?: string;
}

export function ImageUpload({
  onUploadComplete,
  label = 'Upload Image'
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [imageName, setImageName] = useState('');
  const [uploadStatus, setUploadStatus] = useState<
    'idle' | 'success' | 'error'
  >('idle');
  const { api } = useClientApi();
  const uniqueId = useId();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadStatus('idle');
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('name', imageName || file.name);

      const response = await api?.post('/shared/file_upload/', formData);
      onUploadComplete(response?.data.name, response?.data.file);
      setUploadStatus('success');
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadStatus('error');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className='space-y-2'>
      <Label>{label}</Label>
      <div className='flex gap-2'>
        <Input
          type='text'
          placeholder='Image name'
          value={imageName}
          onChange={(e) => setImageName(e.target.value)}
          className='flex-1'
        />
        <Input
          type='file'
          accept='image/*'
          onChange={handleFileChange}
          disabled={isUploading}
          className='hidden'
          id={`image-upload-${uniqueId}`}
        />
        <Button
          type='button'
          variant='outline'
          onClick={() =>
            document.getElementById(`image-upload-${uniqueId}`)?.click()
          }
          disabled={isUploading}
          className={cn(
            'relative',
            uploadStatus === 'success' &&
              'bg-green-50 text-green-600 hover:bg-green-100',
            uploadStatus === 'error' &&
              'bg-red-50 text-red-600 hover:bg-red-100'
          )}
        >
          {isUploading ? (
            <>
              <Upload className='mr-2 h-4 w-4 animate-pulse' />
              Uploading...
            </>
          ) : uploadStatus === 'success' ? (
            <>
              <CheckCircle2 className='mr-2 h-4 w-4' />
              Uploaded
            </>
          ) : uploadStatus === 'error' ? (
            <>
              <XCircle className='mr-2 h-4 w-4' />
              Failed
            </>
          ) : (
            <>
              <Upload className='mr-2 h-4 w-4' />
              Upload
            </>
          )}
        </Button>
      </div>
      {uploadStatus === 'error' && (
        <p className='text-sm text-red-600'>
          Failed to upload image. Please try again.
        </p>
      )}
    </div>
  );
}
