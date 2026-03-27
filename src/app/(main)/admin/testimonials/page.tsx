'use client';

import { useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useClientApi from '@/lib/axios/clientSide';
import PageContainer from '@/components/layout/page-container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
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
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Plus,
  Star,
  Trash2,
  Eye,
  EyeOff,
  Upload,
  Play,
  ChevronDown,
  ChevronUp,
  Film,
  Image as ImageIcon
} from 'lucide-react';
import { toast } from 'sonner';

type TestimonialType = 'PARENT' | 'STUDENT' | 'SUCCESS_STORY';

interface TestimonialMedia {
  id: string;
  testimonial: string;
  file: string;
  file_url: string;
  media_type: 'VIDEO' | 'IMAGE';
  display_order: number;
}

interface Testimonial {
  id: string;
  testimonial_type: TestimonialType;
  person_name: string;
  relationship: string;
  video_url: string;
  quote: string;
  is_featured: boolean;
  is_active: boolean;
  display_order: number;
  created_at: string;
  media: TestimonialMedia[];
}

const TYPE_LABELS: Record<TestimonialType, string> = {
  PARENT: 'Parent',
  STUDENT: 'Student',
  SUCCESS_STORY: 'Success Story'
};

const TYPE_COLORS: Record<TestimonialType, string> = {
  PARENT: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  STUDENT: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  SUCCESS_STORY: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
};

// ---------------------------------------------------------------------------
// Create Dialog
// ---------------------------------------------------------------------------

function CreateTestimonialDialog({ onSuccess }: { onSuccess: () => void }) {
  const { api } = useClientApi();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    person_name: '',
    quote: '',
    testimonial_type: 'STUDENT' as TestimonialType
  });

  const resetForm = () =>
    setForm({ person_name: '', quote: '', testimonial_type: 'STUDENT' });

  const createMutation = useMutation({
    mutationFn: async () => {
      const response = await api!.post('/admin/testimonials/', form);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Testimonial created');
      setOpen(false);
      resetForm();
      onSuccess();
    },
    onError: () => toast.error('Failed to create testimonial')
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) resetForm();
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <Plus className='mr-2 h-4 w-4' />
          Add Testimonial
        </Button>
      </DialogTrigger>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle>Create Testimonial</DialogTitle>
        </DialogHeader>
        <div className='space-y-4'>
          <div>
            <Label>Person Name *</Label>
            <Input
              value={form.person_name}
              onChange={(e) =>
                setForm({ ...form, person_name: e.target.value })
              }
              placeholder='John Doe'
            />
          </div>
          <div>
            <Label>Quote *</Label>
            <Textarea
              value={form.quote}
              onChange={(e) => setForm({ ...form, quote: e.target.value })}
              placeholder='Short testimonial excerpt...'
              rows={3}
            />
          </div>
          <div>
            <Label>Type</Label>
            <Select
              value={form.testimonial_type}
              onValueChange={(v) =>
                setForm({ ...form, testimonial_type: v as TestimonialType })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(TYPE_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>
                    {v}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant='outline' onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => createMutation.mutate()}
            disabled={
              createMutation.isPending ||
              !form.person_name.trim() ||
              !form.quote.trim()
            }
          >
            {createMutation.isPending ? 'Creating...' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Media Management (inline expanded section — videos + images)
// ---------------------------------------------------------------------------

function MediaManager({
  testimonialId,
  api
}: {
  testimonialId: string;
  api: any;
}) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const { data: mediaData, isLoading: mediaLoading } = useQuery({
    queryKey: ['testimonial-media', testimonialId],
    queryFn: async () => {
      const response = await api.get('/admin/testimonial-media/', {
        params: { testimonial: testimonialId }
      });
      return response.data;
    },
    enabled: !!api
  });

  const mediaItems: TestimonialMedia[] = mediaData?.results || mediaData || [];

  const deleteMediaMutation = useMutation({
    mutationFn: async (mediaId: string) => {
      await api.delete(`/admin/testimonial-media/${mediaId}/`);
    },
    onSuccess: () => {
      toast.success('Media deleted');
      queryClient.invalidateQueries({
        queryKey: ['testimonial-media', testimonialId]
      });
      queryClient.invalidateQueries({ queryKey: ['testimonials'] });
    },
    onError: () => toast.error('Failed to delete')
  });

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append('testimonial', testimonialId);
        formData.append('file', files[i]);
        formData.append('display_order', String(mediaItems.length + i));
        await api.post('/admin/testimonial-media/', formData);
      }
      toast.success(
        files.length === 1 ? 'File uploaded' : `${files.length} files uploaded`
      );
      queryClient.invalidateQueries({
        queryKey: ['testimonial-media', testimonialId]
      });
      queryClient.invalidateQueries({ queryKey: ['testimonials'] });
    } catch {
      toast.error('Failed to upload');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className='space-y-4'>
      {/* Upload area */}
      <div
        className='border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 transition-colors'
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className='text-muted-foreground h-8 w-8' />
        <p className='text-muted-foreground text-sm'>
          {uploading ? 'Uploading...' : 'Click to upload images or videos'}
        </p>
        <p className='text-muted-foreground text-xs'>
          Accepts images (JPG, PNG) and videos (MP4, MOV)
        </p>
        <input
          ref={fileInputRef}
          type='file'
          accept='image/*,video/*'
          multiple
          className='hidden'
          onChange={(e) => handleFileUpload(e.target.files)}
          disabled={uploading}
        />
      </div>

      {/* Media list */}
      {mediaLoading ? (
        <div className='text-muted-foreground text-center text-sm'>
          Loading media...
        </div>
      ) : mediaItems.length === 0 ? (
        <p className='text-muted-foreground text-center text-sm'>
          No media yet. Upload images or videos above.
        </p>
      ) : (
        <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3'>
          {mediaItems.map((item) => (
            <div
              key={item.id}
              className='bg-muted/30 group relative overflow-hidden rounded-lg border'
            >
              {item.media_type === 'VIDEO' ? (
                <video
                  src={item.file_url || item.file}
                  className='aspect-video w-full object-cover'
                  controls
                  preload='metadata'
                />
              ) : (
                <img
                  src={item.file_url || item.file}
                  alt='Testimonial'
                  className='aspect-video w-full object-cover'
                />
              )}
              <div className='flex items-center justify-between p-2'>
                <Badge variant='outline' className='text-xs'>
                  {item.media_type === 'VIDEO' ? (
                    <>
                      <Film className='mr-1 h-3 w-3' /> Video
                    </>
                  ) : (
                    <>
                      <ImageIcon className='mr-1 h-3 w-3' /> Image
                    </>
                  )}
                </Badge>
                <Button
                  variant='ghost'
                  size='icon'
                  className='text-destructive hover:text-destructive h-7 w-7'
                  onClick={() => {
                    if (confirm('Delete this media?')) {
                      deleteMediaMutation.mutate(item.id);
                    }
                  }}
                >
                  <Trash2 className='h-3.5 w-3.5' />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Testimonial Card
// ---------------------------------------------------------------------------

function TestimonialCard({
  testimonial,
  api
}: {
  testimonial: Testimonial;
  api: any;
}) {
  const queryClient = useQueryClient();
  const [expanded, setExpanded] = useState(false);
  const t = testimonial;

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await api.delete(`/admin/testimonials/${t.id}/`);
    },
    onSuccess: () => {
      toast.success('Testimonial deleted');
      queryClient.invalidateQueries({ queryKey: ['testimonials'] });
    },
    onError: () => toast.error('Failed to delete testimonial')
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ field, value }: { field: string; value: boolean }) => {
      await api.patch(`/admin/testimonials/${t.id}/`, { [field]: value });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testimonials'] });
    },
    onError: () => toast.error('Failed to update testimonial')
  });

  const mediaCount = t.media?.length || 0;

  return (
    <Card className={!t.is_active ? 'opacity-60' : ''}>
      <CardContent className='p-0'>
        {/* Main row */}
        <div className='flex items-start gap-4 p-4'>
          {/* Icon */}
          <div className='bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-full'>
            {mediaCount > 0 ? (
              <Play className='h-5 w-5' />
            ) : (
              <Star className='h-5 w-5' />
            )}
          </div>

          {/* Content */}
          <div className='min-w-0 flex-1'>
            <div className='flex flex-wrap items-center gap-2'>
              <p className='font-medium'>{t.person_name}</p>
              <Badge
                variant='outline'
                className={TYPE_COLORS[t.testimonial_type]}
              >
                {TYPE_LABELS[t.testimonial_type]}
              </Badge>
              {mediaCount > 0 && (
                <Badge
                  variant='outline'
                  className='border-sky-500/20 bg-sky-500/10 text-sky-600'
                >
                  <Film className='mr-1 h-3 w-3' />
                  {mediaCount} media
                </Badge>
              )}
            </div>
            {t.quote && (
              <p className='text-muted-foreground mt-1.5 line-clamp-2 text-sm italic'>
                &ldquo;{t.quote}&rdquo;
              </p>
            )}

            {/* Always-visible media action row */}
            <div className='mt-3 flex items-center gap-2'>
              <Button
                variant={mediaCount > 0 ? 'outline' : 'default'}
                size='sm'
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? (
                  <ChevronUp className='mr-1.5 h-3.5 w-3.5' />
                ) : (
                  <Upload className='mr-1.5 h-3.5 w-3.5' />
                )}
                {mediaCount === 0
                  ? 'Upload Media'
                  : expanded
                    ? 'Hide Media'
                    : `Manage Media (${mediaCount})`}
              </Button>

              {/* Featured toggle */}
              <div className='ml-auto flex items-center gap-1.5'>
                <Switch
                  checked={t.is_featured}
                  onCheckedChange={(v) =>
                    toggleMutation.mutate({ field: 'is_featured', value: v })
                  }
                />
                <span className='text-muted-foreground text-xs'>Featured</span>
              </div>

              {/* Active toggle */}
              <div className='flex items-center gap-1.5'>
                <Switch
                  checked={t.is_active}
                  onCheckedChange={(v) =>
                    toggleMutation.mutate({ field: 'is_active', value: v })
                  }
                />
                <span className='text-muted-foreground text-xs'>Active</span>
              </div>

              {/* Delete */}
              <Button
                variant='ghost'
                size='icon'
                className='text-destructive hover:text-destructive h-8 w-8'
                onClick={() => {
                  if (confirm('Delete this testimonial?')) {
                    deleteMutation.mutate();
                  }
                }}
              >
                <Trash2 className='h-3.5 w-3.5' />
              </Button>
            </div>
          </div>
        </div>

        {/* Expanded media management */}
        {expanded && (
          <div className='border-t px-4 pt-3 pb-4'>
            <h4 className='mb-3 flex items-center gap-2 text-sm font-medium'>
              <Film className='h-4 w-4' />
              Media
            </h4>
            <MediaManager testimonialId={t.id} api={api} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function TestimonialsPage() {
  const { api } = useClientApi();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['testimonials'],
    queryFn: async () => {
      const response = await api!.get('/admin/testimonials/', {
        params: { page_size: 100, ordering: 'display_order' }
      });
      return response.data;
    },
    enabled: !!api
  });

  const testimonials: Testimonial[] = data?.results || [];

  const totalCount = testimonials.length;
  const featuredCount = testimonials.filter((t) => t.is_featured).length;
  const activeCount = testimonials.filter((t) => t.is_active).length;

  return (
    <PageContainer className='w-full'>
      <div className='w-full space-y-6'>
        {/* Header */}
        <div className='flex w-full items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>Testimonials</h1>
            <p className='text-muted-foreground'>
              Manage testimonials displayed to students and parents
            </p>
          </div>
          <CreateTestimonialDialog
            onSuccess={() =>
              queryClient.invalidateQueries({ queryKey: ['testimonials'] })
            }
          />
        </div>

        {/* Stats */}
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Total</CardTitle>
              <Star className='text-muted-foreground h-4 w-4' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{totalCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Featured</CardTitle>
              <Star className='h-4 w-4 text-yellow-500' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-yellow-600'>
                {featuredCount}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Active</CardTitle>
              <Eye className='h-4 w-4 text-green-500' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-green-600'>
                {activeCount}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Testimonial list */}
        {isLoading ? (
          <div className='space-y-3'>
            {[1, 2, 3].map((i) => (
              <div key={i} className='bg-muted h-24 animate-pulse rounded-lg' />
            ))}
          </div>
        ) : testimonials.length === 0 ? (
          <Card>
            <CardContent className='py-12 text-center'>
              <Star className='text-muted-foreground mx-auto mb-3 h-8 w-8' />
              <p className='text-muted-foreground'>
                No testimonials yet. Click &quot;Add Testimonial&quot; to get
                started.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className='space-y-3'>
            {testimonials
              .sort((a, b) => a.display_order - b.display_order)
              .map((t) => (
                <TestimonialCard key={t.id} testimonial={t} api={api} />
              ))}
          </div>
        )}
      </div>
    </PageContainer>
  );
}
