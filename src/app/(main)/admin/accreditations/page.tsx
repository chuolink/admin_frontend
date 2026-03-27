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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  Plus,
  Shield,
  Trash2,
  ExternalLink,
  Eye,
  EyeOff,
  Upload,
  Image,
  Pencil
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Accreditation {
  id: string;
  name: string;
  link: string;
  description: string;
  logo: string | null;
  logo_url: string | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Create / Edit Dialog
// ---------------------------------------------------------------------------

function AccreditationDialog({
  mode,
  accreditation,
  onSuccess,
  trigger
}: {
  mode: 'create' | 'edit';
  accreditation?: Accreditation;
  onSuccess: () => void;
  trigger: React.ReactNode;
}) {
  const { api } = useClientApi();
  const [open, setOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    link: '',
    description: ''
  });

  const resetForm = () => {
    setForm({ name: '', link: '', description: '' });
    setLogoFile(null);
    setLogoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const populateForm = () => {
    if (mode === 'edit' && accreditation) {
      setForm({
        name: accreditation.name || '',
        link: accreditation.link || '',
        description: accreditation.description || ''
      });
      setLogoPreview(accreditation.logo_url || accreditation.logo || null);
    } else {
      resetForm();
    }
  };

  const handleFileChange = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const mutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append('name', form.name);
      if (form.link) formData.append('link', form.link);
      if (form.description) formData.append('description', form.description);
      if (logoFile) formData.append('logo', logoFile);

      if (mode === 'create') {
        formData.append('is_active', 'true');
        formData.append('display_order', '0');
        const response = await api!.post('/admin/accreditations/', formData);
        return response.data;
      } else {
        const response = await api!.patch(
          `/admin/accreditations/${accreditation!.id}/`,
          formData
        );
        return response.data;
      }
    },
    onSuccess: () => {
      toast.success(
        mode === 'create' ? 'Accreditation created' : 'Accreditation updated'
      );
      setOpen(false);
      resetForm();
      onSuccess();
    },
    onError: () =>
      toast.error(
        mode === 'create'
          ? 'Failed to create accreditation'
          : 'Failed to update accreditation'
      )
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (v) populateForm();
        if (!v) resetForm();
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Add Accreditation' : 'Edit Accreditation'}
          </DialogTitle>
        </DialogHeader>
        <div className='space-y-4'>
          {/* Name */}
          <div>
            <Label>Name *</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder='e.g. TCU Registered Agency'
            />
          </div>

          {/* Link */}
          <div>
            <Label>Link</Label>
            <Input
              type='url'
              value={form.link}
              onChange={(e) => setForm({ ...form, link: e.target.value })}
              placeholder='https://tcu.go.tz/...'
            />
          </div>

          {/* Description */}
          <div>
            <Label>Description</Label>
            <Textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder='Brief description of this accreditation...'
              rows={3}
            />
          </div>

          {/* Logo upload */}
          <div>
            <Label>Logo</Label>
            <div className='mt-1 space-y-2'>
              {logoPreview && (
                <div className='bg-muted/30 flex items-center justify-center rounded-lg border p-3'>
                  <img
                    src={logoPreview}
                    alt='Logo preview'
                    className='max-h-20 max-w-full object-contain'
                  />
                </div>
              )}
              <div
                className='border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50 flex cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed p-4 transition-colors'
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className='text-muted-foreground h-5 w-5' />
                <p className='text-muted-foreground text-xs'>
                  Click to upload logo image
                </p>
                <input
                  ref={fileInputRef}
                  type='file'
                  accept='image/*'
                  className='hidden'
                  onChange={(e) => handleFileChange(e.target.files)}
                />
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant='outline' onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending || !form.name.trim()}
          >
            {mutation.isPending
              ? mode === 'create'
                ? 'Creating...'
                : 'Saving...'
              : mode === 'create'
                ? 'Create'
                : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Accreditation Card
// ---------------------------------------------------------------------------

function AccreditationCard({
  accreditation,
  api,
  onRefresh
}: {
  accreditation: Accreditation;
  api: any;
  onRefresh: () => void;
}) {
  const queryClient = useQueryClient();
  const a = accreditation;

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await api.delete(`/admin/accreditations/${a.id}/`);
    },
    onSuccess: () => {
      toast.success('Accreditation deleted');
      queryClient.invalidateQueries({ queryKey: ['accreditations'] });
    },
    onError: () => toast.error('Failed to delete accreditation')
  });

  const toggleMutation = useMutation({
    mutationFn: async (value: boolean) => {
      await api.patch(`/admin/accreditations/${a.id}/`, { is_active: value });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accreditations'] });
    },
    onError: () => toast.error('Failed to update accreditation')
  });

  const logoSrc = a.logo_url || a.logo;

  return (
    <Card className={!a.is_active ? 'opacity-60' : ''}>
      <CardContent className='p-0'>
        <div className='flex items-start gap-4 p-4'>
          {/* Logo / placeholder */}
          <div className='bg-muted/30 flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border'>
            {logoSrc ? (
              <img
                src={logoSrc}
                alt={a.name}
                className='h-full w-full object-contain p-1'
              />
            ) : (
              <Image className='text-muted-foreground h-6 w-6' />
            )}
          </div>

          {/* Content */}
          <div className='min-w-0 flex-1'>
            <div className='flex flex-wrap items-center gap-2'>
              <p className='font-medium'>{a.name}</p>
              <Badge
                variant='outline'
                className={
                  a.is_active
                    ? 'border-green-500/20 bg-green-500/10 text-green-600'
                    : 'border-red-500/20 bg-red-500/10 text-red-600'
                }
              >
                {a.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            {a.link && (
              <a
                href={a.link}
                target='_blank'
                rel='noopener noreferrer'
                className='text-primary mt-1 inline-flex items-center gap-1 text-sm hover:underline'
              >
                <ExternalLink className='h-3 w-3' />
                {a.link.length > 50 ? a.link.slice(0, 50) + '...' : a.link}
              </a>
            )}
            {a.description && (
              <p className='text-muted-foreground mt-1 line-clamp-2 text-sm'>
                {a.description}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className='flex shrink-0 items-center gap-3'>
            {/* Active toggle */}
            <div className='flex flex-col items-center gap-0.5'>
              <Switch
                checked={a.is_active}
                onCheckedChange={(v) => toggleMutation.mutate(v)}
              />
              <span className='text-muted-foreground text-[10px]'>
                {a.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>

            {/* Edit */}
            <AccreditationDialog
              mode='edit'
              accreditation={a}
              onSuccess={onRefresh}
              trigger={
                <Button variant='ghost' size='icon' className='h-8 w-8'>
                  <Pencil className='h-3.5 w-3.5' />
                </Button>
              }
            />

            {/* Delete */}
            <Button
              variant='ghost'
              size='icon'
              className='text-destructive hover:text-destructive h-8 w-8'
              onClick={() => {
                if (
                  confirm('Delete this accreditation? This cannot be undone.')
                ) {
                  deleteMutation.mutate();
                }
              }}
            >
              <Trash2 className='h-3.5 w-3.5' />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function AccreditationsPage() {
  const { api } = useClientApi();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['accreditations'],
    queryFn: async () => {
      const response = await api!.get('/admin/accreditations/', {
        params: { page_size: 50 }
      });
      return response.data;
    },
    enabled: !!api
  });

  const accreditations: Accreditation[] = data?.results || [];

  const totalCount = accreditations.length;
  const activeCount = accreditations.filter((a) => a.is_active).length;

  const handleRefresh = () =>
    queryClient.invalidateQueries({ queryKey: ['accreditations'] });

  return (
    <PageContainer className='w-full'>
      <div className='w-full space-y-6'>
        {/* Header */}
        <div className='flex w-full items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>
              Accreditations
            </h1>
            <p className='text-muted-foreground'>
              Manage accreditation badges (TCU registration, etc.)
            </p>
          </div>
          <AccreditationDialog
            mode='create'
            onSuccess={handleRefresh}
            trigger={
              <Button>
                <Plus className='mr-2 h-4 w-4' />
                Add Accreditation
              </Button>
            }
          />
        </div>

        {/* Stats */}
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Total</CardTitle>
              <Shield className='text-muted-foreground h-4 w-4' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{totalCount}</div>
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

        {/* Accreditation list */}
        {isLoading ? (
          <div className='space-y-3'>
            {[1, 2, 3].map((i) => (
              <div key={i} className='bg-muted h-24 animate-pulse rounded-lg' />
            ))}
          </div>
        ) : accreditations.length === 0 ? (
          <Card>
            <CardContent className='py-12 text-center'>
              <Shield className='text-muted-foreground mx-auto mb-3 h-8 w-8' />
              <p className='text-muted-foreground'>
                No accreditations yet. Click &quot;Add Accreditation&quot; to
                get started.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className='space-y-3'>
            {accreditations
              .sort((a, b) => a.display_order - b.display_order)
              .map((a) => (
                <AccreditationCard
                  key={a.id}
                  accreditation={a}
                  api={api}
                  onRefresh={handleRefresh}
                />
              ))}
          </div>
        )}
      </div>
    </PageContainer>
  );
}
