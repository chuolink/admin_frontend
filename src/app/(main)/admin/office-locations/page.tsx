'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useClientApi from '@/lib/axios/clientSide';
import PageContainer from '@/components/layout/page-container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  MapPin,
  Trash2,
  Pencil,
  Phone,
  Mail,
  Eye,
  EyeOff,
  Building
} from 'lucide-react';

interface OfficeLocation {
  id: number;
  name: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  phones: string[];
  emails: string[];
  is_active: boolean;
}

type OfficeLocationForm = Omit<OfficeLocation, 'id'>;

const DEFAULT_LOCATION: OfficeLocationForm = {
  name: 'Dar es Salaam Head Office',
  address:
    'Regent Estate; Opp. Victoria Petrol Station, Victoria House, New Bagamoyo road, Dar es Salaam',
  latitude: -6.7924,
  longitude: 39.2783,
  phones: ['+255 737 449 937'],
  emails: ['info@chuolink.com'],
  is_active: true
};

const EMPTY_FORM: OfficeLocationForm = {
  name: '',
  address: '',
  latitude: null,
  longitude: null,
  phones: [''],
  emails: [''],
  is_active: true
};

export default function OfficeLocationsPage() {
  const { api } = useClientApi();
  const queryClient = useQueryClient();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<OfficeLocationForm>(EMPTY_FORM);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const { data: locations = [], isLoading } = useQuery<OfficeLocation[]>({
    queryKey: ['office-locations'],
    queryFn: async () => {
      const res = await api!.get('/admin/office-locations/', {
        params: { page_size: 50 }
      });
      return res.data?.results ?? res.data ?? [];
    },
    enabled: !!api
  });

  const createMutation = useMutation({
    mutationFn: async (data: OfficeLocationForm) => {
      await api!.post('/admin/office-locations/', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['office-locations'] });
      toast.success('Office location created');
      closeDialog();
    },
    onError: () => {
      toast.error('Failed to create office location');
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      data
    }: {
      id: number;
      data: Partial<OfficeLocationForm>;
    }) => {
      await api!.patch(`/admin/office-locations/${id}/`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['office-locations'] });
      toast.success('Office location updated');
      closeDialog();
    },
    onError: () => {
      toast.error('Failed to update office location');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await api!.delete(`/admin/office-locations/${id}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['office-locations'] });
      toast.success('Office location deleted');
      setDeleteConfirmId(null);
    },
    onError: () => {
      toast.error('Failed to delete office location');
    }
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({
      id,
      is_active
    }: {
      id: number;
      is_active: boolean;
    }) => {
      await api!.patch(`/admin/office-locations/${id}/`, { is_active });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['office-locations'] });
      toast.success('Status updated');
    },
    onError: () => {
      toast.error('Failed to update status');
    }
  });

  function closeDialog() {
    setDialogOpen(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  }

  function openCreate(prefill?: OfficeLocationForm) {
    setEditingId(null);
    setForm(prefill ?? EMPTY_FORM);
    setDialogOpen(true);
  }

  function openEdit(location: OfficeLocation) {
    setEditingId(location.id);
    setForm({
      name: location.name,
      address: location.address,
      latitude: location.latitude,
      longitude: location.longitude,
      phones: location.phones?.length ? location.phones : [''],
      emails: location.emails?.length ? location.emails : [''],
      is_active: location.is_active
    });
    setDialogOpen(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.address.trim()) {
      toast.error('Name and address are required');
      return;
    }
    if (editingId !== null) {
      updateMutation.mutate({ id: editingId, data: form });
    } else {
      createMutation.mutate(form);
    }
  }

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <PageContainer>
      <div className='space-y-6'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>
              Office Locations
            </h1>
            <p className='text-muted-foreground'>
              Manage your organization&apos;s physical office locations.
            </p>
          </div>
          <Dialog
            open={dialogOpen}
            onOpenChange={(open) => !open && closeDialog()}
          >
            <DialogTrigger asChild>
              <Button onClick={() => openCreate()}>
                <Plus className='mr-2 h-4 w-4' />
                Add Location
              </Button>
            </DialogTrigger>
            <DialogContent className='sm:max-w-[500px]'>
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>
                    {editingId !== null ? 'Edit Location' : 'Add Location'}
                  </DialogTitle>
                </DialogHeader>
                <div className='grid gap-4 py-4'>
                  <div className='grid gap-2'>
                    <Label htmlFor='name'>
                      Name <span className='text-destructive'>*</span>
                    </Label>
                    <Input
                      id='name'
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                      placeholder='e.g. Dar es Salaam Head Office'
                      required
                    />
                  </div>
                  <div className='grid gap-2'>
                    <Label htmlFor='address'>
                      Address <span className='text-destructive'>*</span>
                    </Label>
                    <Textarea
                      id='address'
                      value={form.address}
                      onChange={(e) =>
                        setForm({ ...form, address: e.target.value })
                      }
                      placeholder='Full street address'
                      rows={3}
                      required
                    />
                  </div>
                  <div className='grid grid-cols-2 gap-4'>
                    <div className='grid gap-2'>
                      <Label htmlFor='latitude'>Latitude</Label>
                      <Input
                        id='latitude'
                        type='number'
                        step={0.000001}
                        value={form.latitude ?? ''}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            latitude: e.target.value
                              ? parseFloat(e.target.value)
                              : null
                          })
                        }
                        placeholder='-6.7924'
                      />
                    </div>
                    <div className='grid gap-2'>
                      <Label htmlFor='longitude'>Longitude</Label>
                      <Input
                        id='longitude'
                        type='number'
                        step={0.000001}
                        value={form.longitude ?? ''}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            longitude: e.target.value
                              ? parseFloat(e.target.value)
                              : null
                          })
                        }
                        placeholder='39.2783'
                      />
                    </div>
                  </div>
                  <div className='grid gap-2'>
                    <Label>Phone Numbers</Label>
                    {form.phones.map((ph, i) => (
                      <div key={i} className='flex gap-2'>
                        <Input
                          value={ph}
                          onChange={(e) => {
                            const updated = [...form.phones];
                            updated[i] = e.target.value;
                            setForm({ ...form, phones: updated });
                          }}
                          placeholder='+255 xxx xxx xxx'
                        />
                        {form.phones.length > 1 && (
                          <Button
                            type='button'
                            variant='ghost'
                            size='icon'
                            className='text-destructive shrink-0'
                            onClick={() =>
                              setForm({
                                ...form,
                                phones: form.phones.filter((_, j) => j !== i)
                              })
                            }
                          >
                            <Trash2 className='h-3.5 w-3.5' />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      type='button'
                      variant='outline'
                      size='sm'
                      className='w-fit'
                      onClick={() =>
                        setForm({ ...form, phones: [...form.phones, ''] })
                      }
                    >
                      <Plus className='mr-1.5 h-3.5 w-3.5' />
                      Add Phone
                    </Button>
                  </div>
                  <div className='grid gap-2'>
                    <Label>Email Addresses</Label>
                    {form.emails.map((em, i) => (
                      <div key={i} className='flex gap-2'>
                        <Input
                          type='email'
                          value={em}
                          onChange={(e) => {
                            const updated = [...form.emails];
                            updated[i] = e.target.value;
                            setForm({ ...form, emails: updated });
                          }}
                          placeholder='office@example.com'
                        />
                        {form.emails.length > 1 && (
                          <Button
                            type='button'
                            variant='ghost'
                            size='icon'
                            className='text-destructive shrink-0'
                            onClick={() =>
                              setForm({
                                ...form,
                                emails: form.emails.filter((_, j) => j !== i)
                              })
                            }
                          >
                            <Trash2 className='h-3.5 w-3.5' />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      type='button'
                      variant='outline'
                      size='sm'
                      className='w-fit'
                      onClick={() =>
                        setForm({ ...form, emails: [...form.emails, ''] })
                      }
                    >
                      <Plus className='mr-1.5 h-3.5 w-3.5' />
                      Add Email
                    </Button>
                  </div>
                  <div className='flex items-center gap-3'>
                    <Switch
                      id='is_active'
                      checked={form.is_active}
                      onCheckedChange={(checked) =>
                        setForm({ ...form, is_active: checked })
                      }
                    />
                    <Label htmlFor='is_active'>Active</Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button type='button' variant='outline' onClick={closeDialog}>
                    Cancel
                  </Button>
                  <Button type='submit' disabled={isSaving}>
                    {isSaving
                      ? 'Saving...'
                      : editingId !== null
                        ? 'Update'
                        : 'Create'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className='text-muted-foreground flex items-center justify-center py-12'>
            Loading office locations...
          </div>
        )}

        {/* Empty state */}
        {!isLoading && locations.length === 0 && (
          <Card className='border-dashed'>
            <CardContent className='flex flex-col items-center justify-center py-12 text-center'>
              <Building className='text-muted-foreground/50 mb-4 h-12 w-12' />
              <h3 className='mb-2 text-lg font-semibold'>
                No office locations yet
              </h3>
              <p className='text-muted-foreground mb-6 max-w-sm text-sm'>
                Get started by adding your first office location. We can
                pre-fill with the Dar es Salaam head office details.
              </p>
              <div className='flex gap-3'>
                <Button variant='outline' onClick={() => openCreate()}>
                  <Plus className='mr-2 h-4 w-4' />
                  Add Blank
                </Button>
                <Button onClick={() => openCreate(DEFAULT_LOCATION)}>
                  <MapPin className='mr-2 h-4 w-4' />
                  Add Dar es Salaam Office
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Location cards */}
        <div className='grid gap-4 md:grid-cols-2'>
          {locations.map((location) => (
            <Card
              key={location.id}
              className={!location.is_active ? 'opacity-60' : ''}
            >
              <CardHeader className='flex flex-row items-start justify-between space-y-0 pb-3'>
                <div className='space-y-1'>
                  <CardTitle className='flex items-center gap-2 text-base'>
                    <Building className='text-muted-foreground h-4 w-4' />
                    {location.name}
                  </CardTitle>
                  <div className='text-muted-foreground flex items-center gap-1.5 text-xs'>
                    {location.is_active ? (
                      <>
                        <Eye className='h-3 w-3' />
                        Active
                      </>
                    ) : (
                      <>
                        <EyeOff className='h-3 w-3' />
                        Inactive
                      </>
                    )}
                  </div>
                </div>
                <div className='flex items-center gap-1'>
                  <Switch
                    checked={location.is_active}
                    onCheckedChange={(checked) =>
                      toggleActiveMutation.mutate({
                        id: location.id,
                        is_active: checked
                      })
                    }
                    aria-label='Toggle active status'
                  />
                </div>
              </CardHeader>
              <CardContent className='space-y-3 text-sm'>
                <div className='flex items-start gap-2'>
                  <MapPin className='text-muted-foreground mt-0.5 h-4 w-4 shrink-0' />
                  <span>{location.address}</span>
                </div>

                {(location.latitude != null || location.longitude != null) && (
                  <div className='text-muted-foreground text-xs'>
                    Lat: {location.latitude ?? '---'}, Lng:{' '}
                    {location.longitude ?? '---'}
                  </div>
                )}

                {location.phones?.filter(Boolean).map((ph, i) => (
                  <div key={`ph-${i}`} className='flex items-center gap-2'>
                    <Phone className='text-muted-foreground h-4 w-4' />
                    <span>{ph}</span>
                  </div>
                ))}

                {location.emails?.filter(Boolean).map((em, i) => (
                  <div key={`em-${i}`} className='flex items-center gap-2'>
                    <Mail className='text-muted-foreground h-4 w-4' />
                    <span>{em}</span>
                  </div>
                ))}

                <div className='flex items-center gap-2 pt-2'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => openEdit(location)}
                  >
                    <Pencil className='mr-1.5 h-3.5 w-3.5' />
                    Edit
                  </Button>
                  {deleteConfirmId === location.id ? (
                    <div className='flex items-center gap-2'>
                      <Button
                        variant='destructive'
                        size='sm'
                        onClick={() => deleteMutation.mutate(location.id)}
                        disabled={deleteMutation.isPending}
                      >
                        {deleteMutation.isPending ? 'Deleting...' : 'Confirm'}
                      </Button>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => setDeleteConfirmId(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant='outline'
                      size='sm'
                      className='text-destructive hover:text-destructive'
                      onClick={() => setDeleteConfirmId(location.id)}
                    >
                      <Trash2 className='mr-1.5 h-3.5 w-3.5' />
                      Delete
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </PageContainer>
  );
}
