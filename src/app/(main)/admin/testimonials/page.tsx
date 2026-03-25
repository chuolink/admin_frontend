'use client';

import { useState } from 'react';
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
import { Plus, Star, Video, Trash2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

type TestimonialType = 'PARENT' | 'STUDENT' | 'SUCCESS_STORY';

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
}

const TYPE_LABELS: Record<TestimonialType, string> = {
  PARENT: 'Parent',
  STUDENT: 'Student',
  SUCCESS_STORY: 'Success Story'
};

function CreateTestimonialDialog({ onSuccess }: { onSuccess: () => void }) {
  const { api } = useClientApi();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    testimonial_type: 'STUDENT' as TestimonialType,
    person_name: '',
    relationship: '',
    video_url: '',
    quote: '',
    is_featured: false,
    is_active: true,
    display_order: 1
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const response = await api!.post('/admin/testimonials/', form);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Testimonial created');
      setOpen(false);
      onSuccess();
    },
    onError: () => toast.error('Failed to create testimonial')
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className='mr-2 h-4 w-4' />
          Add Testimonial
        </Button>
      </DialogTrigger>
      <DialogContent className='max-w-lg'>
        <DialogHeader>
          <DialogTitle>Create Testimonial</DialogTitle>
        </DialogHeader>
        <div className='space-y-4'>
          <div className='grid grid-cols-2 gap-4'>
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
            <div>
              <Label>Display Order</Label>
              <Input
                type='number'
                value={form.display_order}
                onChange={(e) =>
                  setForm({
                    ...form,
                    display_order: parseInt(e.target.value) || 1
                  })
                }
                min={1}
              />
            </div>
          </div>
          <div>
            <Label required>Person Name</Label>
            <Input
              value={form.person_name}
              onChange={(e) =>
                setForm({ ...form, person_name: e.target.value })
              }
              placeholder='John Doe'
            />
          </div>
          <div>
            <Label>Relationship</Label>
            <Input
              value={form.relationship}
              onChange={(e) =>
                setForm({ ...form, relationship: e.target.value })
              }
              placeholder='e.g. Parent of Amina, studying in India'
            />
          </div>
          <div>
            <Label>Video URL</Label>
            <Input
              value={form.video_url}
              onChange={(e) => setForm({ ...form, video_url: e.target.value })}
              placeholder='https://youtube.com/watch?v=...'
            />
          </div>
          <div>
            <Label required>Quote</Label>
            <Textarea
              value={form.quote}
              onChange={(e) => setForm({ ...form, quote: e.target.value })}
              placeholder='Short testimonial excerpt...'
              rows={3}
            />
          </div>
          <div className='flex items-center gap-6'>
            <div className='flex items-center gap-2'>
              <Switch
                checked={form.is_featured}
                onCheckedChange={(v) => setForm({ ...form, is_featured: v })}
              />
              <Label>Featured</Label>
            </div>
            <div className='flex items-center gap-2'>
              <Switch
                checked={form.is_active}
                onCheckedChange={(v) => setForm({ ...form, is_active: v })}
              />
              <Label>Active</Label>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant='outline' onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => createMutation.mutate()}
            disabled={
              createMutation.isPending || !form.person_name || !form.quote
            }
          >
            {createMutation.isPending ? 'Creating...' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

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

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api!.delete(`/admin/testimonials/${id}/`);
    },
    onSuccess: () => {
      toast.success('Testimonial deleted');
      queryClient.invalidateQueries({ queryKey: ['testimonials'] });
    }
  });

  const toggleMutation = useMutation({
    mutationFn: async ({
      id,
      field,
      value
    }: {
      id: string;
      field: string;
      value: boolean;
    }) => {
      await api!.patch(`/admin/testimonials/${id}/`, { [field]: value });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testimonials'] });
    }
  });

  const testimonials: Testimonial[] = data?.results || [];

  return (
    <PageContainer className='w-full'>
      <div className='w-full space-y-6'>
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
        <div className='grid grid-cols-3 gap-4'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Total</CardTitle>
              <Star className='text-muted-foreground h-4 w-4' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{testimonials.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Featured</CardTitle>
              <Star className='h-4 w-4 text-yellow-500' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-yellow-600'>
                {testimonials.filter((t) => t.is_featured).length}
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
                {testimonials.filter((t) => t.is_active).length}
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
              <p className='text-muted-foreground'>No testimonials yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className='space-y-3'>
            {testimonials
              .sort((a, b) => a.display_order - b.display_order)
              .map((t) => (
                <Card key={t.id} className={!t.is_active ? 'opacity-60' : ''}>
                  <CardContent className='flex items-start gap-4 py-4'>
                    <div className='bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-full'>
                      {t.video_url ? (
                        <Video className='h-5 w-5' />
                      ) : (
                        <Star className='h-5 w-5' />
                      )}
                    </div>
                    <div className='min-w-0 flex-1'>
                      <div className='flex flex-wrap items-center gap-2'>
                        <p className='text-sm font-medium'>{t.person_name}</p>
                        <Badge variant='outline' className='text-xs'>
                          {TYPE_LABELS[t.testimonial_type]}
                        </Badge>
                        {t.is_featured && (
                          <Badge className='border-yellow-500/20 bg-yellow-500/10 text-xs text-yellow-600'>
                            Featured
                          </Badge>
                        )}
                      </div>
                      {t.relationship && (
                        <p className='text-muted-foreground mt-0.5 text-xs'>
                          {t.relationship}
                        </p>
                      )}
                      {t.quote && (
                        <p className='text-muted-foreground mt-2 line-clamp-2 text-sm italic'>
                          &ldquo;{t.quote}&rdquo;
                        </p>
                      )}
                    </div>
                    <div className='flex shrink-0 items-center gap-2'>
                      <Button
                        variant='ghost'
                        size='icon'
                        className='h-8 w-8'
                        onClick={() =>
                          toggleMutation.mutate({
                            id: t.id,
                            field: 'is_active',
                            value: !t.is_active
                          })
                        }
                        title={t.is_active ? 'Deactivate' : 'Activate'}
                      >
                        {t.is_active ? (
                          <Eye className='h-3.5 w-3.5' />
                        ) : (
                          <EyeOff className='h-3.5 w-3.5' />
                        )}
                      </Button>
                      <Button
                        variant='ghost'
                        size='icon'
                        className='text-destructive hover:text-destructive h-8 w-8'
                        onClick={() => {
                          if (confirm('Delete this testimonial?')) {
                            deleteMutation.mutate(t.id);
                          }
                        }}
                      >
                        <Trash2 className='h-3.5 w-3.5' />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        )}
      </div>
    </PageContainer>
  );
}
