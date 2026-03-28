'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import {
  Loader2,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Trash2,
  Upload,
  X
} from 'lucide-react';
import { FileUploadField, MediaThumbnail } from './FileUploadField';
import { toast } from 'sonner';
import useClientApi from '@/lib/axios/clientSide';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
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
import { EntityPicker } from './EntityPicker';
import { DataSheet } from './DataSheet';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';
import { TableFilters, type FilterDef } from './TableFilters';
import { BulkImportExport } from './BulkImportExport';
import { ServerPagination } from './ServerPagination';
import { useFilterState } from '../hooks/use-filter-state';

/* ═══════════════════════════════════════════════
   Column definition
   ═══════════════════════════════════════════════ */

export interface ColumnDef {
  /** Field key from API response */
  key: string;
  /** Header label */
  header: string;
  /** Column type for rendering */
  type?:
    | 'text'
    | 'badge'
    | 'date'
    | 'number'
    | 'boolean'
    | 'image'
    | 'link'
    | 'truncate';
  /** For badge type: color mapping */
  badgeColors?: Record<string, string>;
  /** Max width for truncate */
  maxWidth?: number;
  /** Hidden by default */
  hidden?: boolean;
}

/* ═══════════════════════════════════════════════
   Form field definition
   ═══════════════════════════════════════════════ */

export interface FormFieldDef {
  /** Field name (sent to API) */
  name: string;
  /** Display label */
  label: string;
  /** Input type */
  type:
    | 'text'
    | 'textarea'
    | 'number'
    | 'select'
    | 'boolean'
    | 'date'
    | 'entity'
    | 'url'
    | 'email'
    | 'image'
    | 'video'
    | 'file';
  /** Required field */
  required?: boolean;
  /** Placeholder */
  placeholder?: string;
  /** For select: static options */
  options?: { value: string; label: string }[];
  /** For entity picker: API endpoint */
  endpoint?: string;
  /** For entity picker: query key */
  queryKey?: string;
  /** For entity picker: map function */
  mapItem?: (item: Record<string, unknown>) => { id: string; name: string };
  /** Default value */
  defaultValue?: unknown;
  /** Help text */
  help?: string;
}

/* ═══════════════════════════════════════════════
   GenericDataTable Props
   ═══════════════════════════════════════════════ */

interface GenericDataTableProps {
  /** API endpoint (e.g., '/data-admin/experts/') */
  endpoint: string;
  /** React Query key */
  queryKey: string;
  /** Table columns */
  columns: ColumnDef[];
  /** Form fields for create/edit */
  formFields: FormFieldDef[];
  /** Display name (e.g., 'Expert') */
  entityName: string;
  /** Filter definitions */
  filters?: FilterDef[];
  /** Sheet size */
  sheetSize?: 'md' | 'lg' | 'xl';
  /** Extra query params (e.g., fixed filters from parent) */
  extraParams?: Record<string, string>;
  /** Hide create button */
  hideCreate?: boolean;
  /** Search placeholder */
  searchPlaceholder?: string;
  /** Enable bulk import/export */
  bulkEnabled?: boolean;
}

/* ═══════════════════════════════════════════════
   Component
   ═══════════════════════════════════════════════ */

export function GenericDataTable({
  endpoint,
  queryKey,
  columns,
  formFields,
  entityName,
  filters = [],
  sheetSize = 'lg',
  extraParams = {},
  hideCreate = false,
  searchPlaceholder,
  bulkEnabled = false
}: GenericDataTableProps) {
  const { api } = useClientApi();
  const qc = useQueryClient();

  // State — filters persist in URL via nuqs
  const [search, setSearch] = useState('');
  const filterKeys = filters.map((f) => f.key);
  const [filterValues, setFilter] = useFilterState(filterKeys);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Record<string, any> | null>(
    null
  );
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Record<string, any> | null>(
    null
  );

  // Build query params
  const params: Record<string, string> = { ...extraParams };
  if (search) params.search = search;
  Object.entries(filterValues).forEach(([k, v]) => {
    if (v) params[k] = v;
  });
  params.page = String(page);
  params.page_size = String(pageSize);

  // Fetch data
  const { data, isLoading } = useQuery({
    queryKey: [queryKey, params],
    queryFn: () => api!.get(endpoint, { params }).then((r) => r.data),
    enabled: !!api
  });

  const items = data?.results ?? (Array.isArray(data) ? data : []);
  const totalCount = data?.count ?? items.length;

  // Helper: convert payload to FormData if it contains File objects
  const FILE_FIELD_TYPES = new Set(['image', 'video', 'file']);
  const fileFieldNames = new Set(
    formFields.filter((f) => FILE_FIELD_TYPES.has(f.type)).map((f) => f.name)
  );

  const preparePayload = (
    payload: Record<string, any>
  ): Record<string, any> | FormData => {
    const hasFiles = Object.entries(payload).some(
      ([key, val]) => val instanceof File && fileFieldNames.has(key)
    );
    if (!hasFiles) return payload;

    const formData = new FormData();
    for (const [key, val] of Object.entries(payload)) {
      if (val === null || val === undefined) continue;
      if (val instanceof File) {
        formData.append(key, val);
      } else if (typeof val === 'boolean') {
        formData.append(key, val ? 'true' : 'false');
      } else {
        formData.append(key, String(val));
      }
    }
    return formData;
  };

  // Mutations
  const createMutation = useMutation({
    mutationFn: (payload: Record<string, any>) => {
      const prepared = preparePayload(payload);
      const config =
        prepared instanceof FormData
          ? { headers: { 'Content-Type': 'multipart/form-data' } }
          : {};
      return api!.post(endpoint, prepared, config);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [queryKey] });
      toast.success(`${entityName} created`);
      setSheetOpen(false);
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.detail ||
        Object.values(err?.response?.data || {})
          .flat()
          .join(', ') ||
        `Failed to create ${entityName}`;
      toast.error(String(msg));
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data: payload
    }: {
      id: string;
      data: Record<string, any>;
    }) => {
      const prepared = preparePayload(payload);
      const config =
        prepared instanceof FormData
          ? { headers: { 'Content-Type': 'multipart/form-data' } }
          : {};
      return api!.patch(`${endpoint}${id}/`, prepared, config);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [queryKey] });
      toast.success(`${entityName} updated`);
      setSheetOpen(false);
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.detail ||
        Object.values(err?.response?.data || {})
          .flat()
          .join(', ') ||
        `Failed to update ${entityName}`;
      toast.error(String(msg));
    }
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

  // Handlers
  const handleAdd = () => {
    setEditingItem(null);
    const defaults: Record<string, any> = {};
    formFields.forEach((f) => {
      if (f.defaultValue !== undefined) {
        defaults[f.name] = f.defaultValue;
      } else if (f.type === 'number') {
        defaults[f.name] = 0;
      } else if (f.type === 'boolean') {
        defaults[f.name] = false;
      } else {
        defaults[f.name] = '';
      }
    });
    // Pre-fill from active filters
    Object.entries(filterValues).forEach(([k, v]) => {
      if (v && formFields.some((f) => f.name === k)) {
        defaults[k] = v;
      }
    });
    setFormData(defaults);
    setSheetOpen(true);
  };

  const handleEdit = (item: Record<string, any>) => {
    setEditingItem(item);
    const vals: Record<string, any> = {};
    formFields.forEach((f) => {
      vals[f.name] =
        item[f.name] ??
        (f.type === 'number' ? 0 : f.type === 'boolean' ? false : '');
    });
    setFormData(vals);
    setSheetOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...formData };
    // Clean up empty strings for optional fields
    formFields.forEach((f) => {
      if (!f.required && payload[f.name] === '') {
        payload[f.name] = null;
      }
      // For file fields: if value is a URL string (unchanged), don't send it
      // Only send if it's a new File object or null (to clear)
      if (
        FILE_FIELD_TYPES.has(f.type) &&
        typeof payload[f.name] === 'string' &&
        payload[f.name]
      ) {
        delete payload[f.name]; // Don't override existing file with its own URL
      }
    });

    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;
  const visibleColumns = columns.filter((c) => !c.hidden);

  // Loading state
  if (isLoading) {
    return (
      <div className='space-y-3'>
        <div className='flex gap-2'>
          <Skeleton className='h-8 w-[250px]' />
          <Skeleton className='h-8 w-[150px]' />
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className='h-12 w-full' />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className='space-y-3'>
        {/* Toolbar: search + filters + add */}
        <div className='flex flex-wrap items-center gap-2'>
          <div className='relative max-w-xs min-w-[200px] flex-1'>
            <Search className='text-muted-foreground absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2' />
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder={
                searchPlaceholder || `Search ${entityName.toLowerCase()}s...`
              }
              className='h-8 pl-8 text-xs'
            />
          </div>

          {filters.length > 0 && (
            <TableFilters
              filters={filters}
              values={filterValues}
              onChange={(key, val) => {
                setFilter(key, val);
                setPage(1);
              }}
            />
          )}

          <div className='ml-auto flex items-center gap-2'>
            {bulkEnabled && (
              <BulkImportExport
                endpoint={endpoint}
                entityName={entityName}
                queryKey={queryKey}
              />
            )}
            {!hideCreate && (
              <Button size='sm' className='h-8 text-xs' onClick={handleAdd}>
                <Plus className='mr-1.5 h-3.5 w-3.5' />
                Add {entityName}
              </Button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className='overflow-x-auto rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                {visibleColumns.map((col) => (
                  <TableHead key={col.key} className='text-xs'>
                    {col.header}
                  </TableHead>
                ))}
                <TableHead className='w-[50px]' />
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length > 0 ? (
                items.map((item: Record<string, any>) => (
                  <TableRow
                    key={item.id}
                    className='hover:bg-muted/50 cursor-pointer'
                    onClick={() => handleEdit(item)}
                  >
                    {visibleColumns.map((col) => (
                      <TableCell key={col.key} className='text-xs'>
                        <CellRenderer column={col} value={item[col.key]} />
                      </TableCell>
                    ))}
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant='ghost' className='h-7 w-7 p-0'>
                            <MoreHorizontal className='h-3.5 w-3.5' />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end'>
                          <DropdownMenuItem onClick={() => handleEdit(item)}>
                            <Pencil className='mr-2 h-3.5 w-3.5' /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className='text-destructive focus:text-destructive'
                            onClick={() => {
                              setItemToDelete(item);
                              setDeleteOpen(true);
                            }}
                          >
                            <Trash2 className='mr-2 h-3.5 w-3.5' /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={visibleColumns.length + 1}
                    className='text-muted-foreground h-24 text-center text-sm'
                  >
                    No {entityName.toLowerCase()}s found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <ServerPagination
          totalCount={totalCount}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
        />
      </div>

      {/* Add/Edit Sheet */}
      <DataSheet
        open={sheetOpen}
        onOpenChange={(open) => {
          if (!open) setSheetOpen(false);
        }}
        title={editingItem ? `Edit ${entityName}` : `Add ${entityName}`}
        size={sheetSize}
      >
        <form onSubmit={handleSubmit} className='space-y-4'>
          {formFields.map((field) => (
            <FormFieldRenderer
              key={field.name}
              field={field}
              value={formData[field.name]}
              onChange={(val) =>
                setFormData((prev) => ({ ...prev, [field.name]: val }))
              }
            />
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
        description={`Are you sure you want to delete "${itemToDelete?.name || itemToDelete?.title || itemToDelete?.email || itemToDelete?.id || ''}"? This action cannot be undone.`}
        onConfirm={() => itemToDelete && deleteMutation.mutate(itemToDelete.id)}
        isPending={deleteMutation.isPending}
      />
    </>
  );
}

/* ═══════════════════════════════════════════════
   Cell Renderer — renders table cell based on type
   ═══════════════════════════════════════════════ */

function CellRenderer({
  column,
  value
}: {
  column: ColumnDef;
  value: unknown;
}) {
  if (value === null || value === undefined)
    return <span className='text-muted-foreground'>—</span>;

  switch (column.type) {
    case 'badge': {
      const colorClass = column.badgeColors?.[String(value)] || '';
      return (
        <Badge variant='outline' className={`text-[10px] ${colorClass}`}>
          {String(value)}
        </Badge>
      );
    }
    case 'boolean':
      return (
        <Badge
          variant='outline'
          className={`text-[10px] ${value ? 'border-green-500/30 text-green-500' : 'border-red-500/30 text-red-500'}`}
        >
          {value ? 'Yes' : 'No'}
        </Badge>
      );
    case 'date':
      try {
        return <span>{format(new Date(String(value)), 'MMM d, yyyy')}</span>;
      } catch {
        return <span>{String(value)}</span>;
      }
    case 'number':
      return <span>{Number(value).toLocaleString()}</span>;
    case 'image':
      return <MediaThumbnail url={value ? String(value) : null} type='image' />;
    case 'video':
      return <MediaThumbnail url={value ? String(value) : null} type='video' />;
    case 'file':
      return <MediaThumbnail url={value ? String(value) : null} type='file' />;
    case 'link':
      return value ? (
        <a
          href={String(value)}
          target='_blank'
          rel='noopener noreferrer'
          className='text-primary truncate text-xs hover:underline'
        >
          Link
        </a>
      ) : (
        <span className='text-muted-foreground'>—</span>
      );
    case 'truncate':
      return (
        <div className='max-w-[200px] truncate' title={String(value)}>
          {String(value)}
        </div>
      );
    default:
      return <span className='truncate'>{String(value)}</span>;
  }
}

/* ═══════════════════════════════════════════════
   Form Field Renderer — renders form input based on type
   ═══════════════════════════════════════════════ */

function FormFieldRenderer({
  field,
  value,
  onChange
}: {
  field: FormFieldDef;
  value: any;
  onChange: (val: any) => void;
}) {
  return (
    <div className='space-y-1.5'>
      <Label className='text-sm'>
        {field.label}
        {field.required && <span className='text-destructive ml-0.5'>*</span>}
      </Label>

      {field.type === 'textarea' && (
        <Textarea
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder || field.label}
          rows={3}
          required={field.required}
        />
      )}

      {field.type === 'text' && (
        <Input
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder || field.label}
          required={field.required}
        />
      )}

      {field.type === 'url' && (
        <Input
          type='url'
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder || 'https://...'}
        />
      )}

      {field.type === 'email' && (
        <Input
          type='email'
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder || 'email@example.com'}
        />
      )}

      {field.type === 'number' && (
        <Input
          type='number'
          value={value ?? ''}
          onChange={(e) => onChange(Number(e.target.value))}
          placeholder={field.placeholder || '0'}
          required={field.required}
        />
      )}

      {field.type === 'date' && (
        <Input
          type='date'
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          className='[color-scheme:dark]'
          required={field.required}
        />
      )}

      {field.type === 'boolean' && (
        <div className='flex items-center gap-2'>
          <Checkbox
            checked={!!value}
            onCheckedChange={(checked) => onChange(!!checked)}
          />
          <span className='text-muted-foreground text-xs'>
            {field.help || field.label}
          </span>
        </div>
      )}

      {field.type === 'select' && (
        <Select value={String(value ?? '')} onValueChange={onChange}>
          <SelectTrigger>
            <SelectValue
              placeholder={
                field.placeholder || `Select ${field.label.toLowerCase()}`
              }
            />
          </SelectTrigger>
          <SelectContent>
            {(field.options || []).map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {field.type === 'entity' && field.endpoint && (
        <EntityPicker
          endpoint={field.endpoint}
          queryKey={field.queryKey || field.endpoint}
          mapItem={
            field.mapItem ||
            ((item) => ({
              id: item.id as string,
              name: (item.name || item.title || item.email || item.id) as string
            }))
          }
          value={value || null}
          onChange={(id) => onChange(id ?? '')}
          placeholder={
            field.placeholder || `Select ${field.label.toLowerCase()}...`
          }
        />
      )}

      {(field.type === 'image' ||
        field.type === 'video' ||
        field.type === 'file') && (
        <FileUploadField
          value={value || null}
          onChange={(val) => onChange(val as any)}
          type={field.type as 'image' | 'video' | 'file'}
          placeholder={
            field.placeholder || `Upload ${field.label.toLowerCase()}`
          }
        />
      )}

      {field.help && field.type !== 'boolean' && (
        <p className='text-muted-foreground text-[11px]'>{field.help}</p>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Image Field — shows thumbnail + upload button
   ═══════════════════════════════════════════════ */

/* ImageField removed — replaced by FileUploadField from ./FileUploadField.tsx */
