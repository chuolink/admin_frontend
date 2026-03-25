'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, MoreHorizontal, Pencil, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import useClientApi from '@/lib/axios/clientSide';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { EntityPicker } from '@/features/data-admin/components/EntityPicker';
import { DataSheet } from '@/features/data-admin/components/DataSheet';
import { DeleteConfirmDialog } from '@/features/data-admin/components/DeleteConfirmDialog';

interface ColumnDef {
  key: string;
  label: string;
  truncate?: boolean;
}

interface FormFieldDef {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'number';
  required?: boolean;
}

interface CountrySubTableProps {
  endpoint: string;
  queryKey: string;
  columns: ColumnDef[];
  formFields: FormFieldDef[];
  entityName: string;
}

export function CountrySubTable({
  endpoint,
  queryKey,
  columns,
  formFields,
  entityName
}: CountrySubTableProps) {
  const { api } = useClientApi();
  const qc = useQueryClient();

  const [countryFilter, setCountryFilter] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Record<string, any> | null>(
    null
  );
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Record<string, any> | null>(
    null
  );

  const params: Record<string, string> = {};
  if (countryFilter) params.country = countryFilter;

  const { data, isLoading } = useQuery({
    queryKey: [queryKey, params],
    queryFn: () => api!.get(endpoint, { params }).then((r) => r.data),
    enabled: !!api
  });

  const createMutation = useMutation({
    mutationFn: (payload: Record<string, any>) => api!.post(endpoint, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [queryKey] });
      toast.success(`${entityName} created`);
      setSheetOpen(false);
    },
    onError: () => toast.error(`Failed to create ${entityName}`)
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data: payload
    }: {
      id: string;
      data: Record<string, any>;
    }) => api!.patch(`${endpoint}${id}/`, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [queryKey] });
      toast.success(`${entityName} updated`);
      setSheetOpen(false);
    },
    onError: () => toast.error(`Failed to update ${entityName}`)
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api!.delete(`${endpoint}${id}/`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [queryKey] });
      toast.success(`${entityName} deleted`);
      setDeleteOpen(false);
    },
    onError: () => toast.error(`Failed to delete ${entityName}`)
  });

  const handleAdd = () => {
    setEditingItem(null);
    const defaults: Record<string, any> = {};
    formFields.forEach((f) => {
      defaults[f.name] = f.type === 'number' ? 0 : '';
    });
    if (countryFilter) defaults.country = countryFilter;
    setFormData(defaults);
    setSheetOpen(true);
  };

  const handleEdit = (item: Record<string, any>) => {
    setEditingItem(item);
    const vals: Record<string, any> = { country: item.country };
    formFields.forEach((f) => {
      vals[f.name] = item[f.name] ?? (f.type === 'number' ? 0 : '');
    });
    setFormData(vals);
    setSheetOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...formData };
    if (!payload.country && countryFilter) payload.country = countryFilter;

    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const items = data?.results ?? (Array.isArray(data) ? data : []);
  const isPending = createMutation.isPending || updateMutation.isPending;

  if (isLoading) {
    return (
      <div className='space-y-3'>
        <Skeleton className='h-10 w-[250px]' />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className='h-12 w-full' />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className='space-y-4'>
        <div className='flex items-center gap-4'>
          <div className='w-64'>
            <EntityPicker
              endpoint='/data-admin/countries/'
              queryKey='data-admin-countries'
              mapItem={(item) => ({
                id: item.id as string,
                name: item.name as string
              })}
              value={countryFilter}
              onChange={setCountryFilter}
              placeholder='Filter by country...'
            />
          </div>
          <Button size='sm' onClick={handleAdd}>
            <Plus className='mr-2 h-4 w-4' />
            Add {entityName}
          </Button>
        </div>

        <div className='overflow-x-auto rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Country</TableHead>
                {columns.map((col) => (
                  <TableHead key={col.key}>{col.label}</TableHead>
                ))}
                <TableHead className='w-[60px]' />
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length > 0 ? (
                items.map((item: Record<string, any>) => (
                  <TableRow key={item.id}>
                    <TableCell className='font-medium'>
                      {item.country_name ?? '—'}
                    </TableCell>
                    {columns.map((col) => (
                      <TableCell key={col.key}>
                        {col.truncate ? (
                          <div
                            className='max-w-[200px] truncate text-sm'
                            title={String(item[col.key] ?? '')}
                          >
                            {item[col.key] ?? '—'}
                          </div>
                        ) : (
                          <span className='text-sm'>
                            {item[col.key] ?? '—'}
                          </span>
                        )}
                      </TableCell>
                    ))}
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant='ghost' className='h-8 w-8 p-0'>
                            <MoreHorizontal className='h-4 w-4' />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end'>
                          <DropdownMenuItem onClick={() => handleEdit(item)}>
                            <Pencil className='mr-2 h-4 w-4' /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className='text-destructive focus:text-destructive'
                            onClick={() => {
                              setItemToDelete(item);
                              setDeleteOpen(true);
                            }}
                          >
                            <Trash2 className='mr-2 h-4 w-4' /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length + 2}
                    className='text-muted-foreground h-24 text-center'
                  >
                    No {entityName.toLowerCase()}s found.
                    {countryFilter ? ' Try clearing the filter.' : ''}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Add/Edit Sheet */}
      <DataSheet
        open={sheetOpen}
        onOpenChange={(open) => {
          if (!open) setSheetOpen(false);
        }}
        title={editingItem ? `Edit ${entityName}` : `Add ${entityName}`}
        size='md'
      >
        <form onSubmit={handleSubmit} className='space-y-4'>
          {/* Country picker */}
          <div className='space-y-2'>
            <Label>Country *</Label>
            <EntityPicker
              endpoint='/data-admin/countries/'
              queryKey='data-admin-countries'
              mapItem={(item) => ({
                id: item.id as string,
                name: item.name as string
              })}
              value={formData.country || null}
              onChange={(id) =>
                setFormData((prev) => ({ ...prev, country: id ?? '' }))
              }
              placeholder='Select country...'
            />
          </div>

          {formFields.map((field) => (
            <div key={field.name} className='space-y-2'>
              <Label>
                {field.label}
                {field.required ? ' *' : ''}
              </Label>
              {field.type === 'textarea' ? (
                <Textarea
                  value={formData[field.name] ?? ''}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      [field.name]: e.target.value
                    }))
                  }
                  placeholder={field.label}
                  rows={3}
                  required={field.required}
                />
              ) : (
                <Input
                  type={field.type}
                  value={formData[field.name] ?? ''}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      [field.name]:
                        field.type === 'number'
                          ? Number(e.target.value)
                          : e.target.value
                    }))
                  }
                  placeholder={field.label}
                  required={field.required}
                />
              )}
            </div>
          ))}

          <div className='flex justify-end gap-2 border-t pt-4'>
            <Button
              type='button'
              variant='outline'
              onClick={() => setSheetOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type='submit' disabled={isPending}>
              {isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
              {editingItem ? 'Save Changes' : `Create ${entityName}`}
            </Button>
          </div>
        </form>
      </DataSheet>

      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={`Delete ${entityName}`}
        description={`Are you sure? This cannot be undone.`}
        onConfirm={() => itemToDelete && deleteMutation.mutate(itemToDelete.id)}
        isPending={deleteMutation.isPending}
      />
    </>
  );
}
