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
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { EntityPicker } from '@/features/data-admin/components/EntityPicker';
import {
  Plus,
  Globe,
  MapPin,
  CreditCard,
  FileText,
  Calendar,
  Info,
  ShieldCheck,
  Trash2,
  ChevronDown,
  ChevronUp,
  GripVertical,
  FileUp,
  Clock,
  Image,
  Images,
  Hash,
  ListOrdered,
  AlignLeft,
  Type,
  Files,
  X,
  type LucideIcon
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type FlowType = 'LOCAL' | 'ABROAD';
type StageType =
  | 'PAYMENT'
  | 'DOCUMENT_UPLOAD'
  | 'SCHEDULE'
  | 'INFO'
  | 'PHYSICAL_VISIT'
  | 'APPROVAL';
type ResponseType =
  | 'DOCUMENT'
  | 'MULTI_FILE'
  | 'IMAGE'
  | 'MULTI_IMAGE'
  | 'TEXT'
  | 'TEXTAREA'
  | 'NUMBER'
  | 'DATE'
  | 'SELECT'
  | 'SCHEDULE'
  | 'INFO';
type QuestionScope = 'application' | 'student';
type AnswerMode = 'list' | 'wizard';

type DocumentType =
  | 'PASSPORT'
  | 'PASSPORT_PHOTO'
  | 'BLUE_BG_PHOTO'
  | 'BIRTH_CERT'
  | 'NIDA'
  | 'FORM_FOUR_CERT'
  | 'FORM_SIX_CERT'
  | 'FORM_SIX_LEAVING_CERT'
  | 'RECOMMENDATION_LETTER'
  | 'PARENT_ID'
  | 'PARENT_BIRTH_CERT'
  | 'LOCAL_GOV_LETTER'
  | 'AFFIDAVIT'
  | 'OTHER';

interface SelectOption {
  value: string;
  label: string;
}

interface LinkedFee {
  fee_type: string; // expense name or iname
  amount: string; // auto-filled from expense
  currency: string; // auto-filled from expense
  description?: string; // auto-filled from expense
  source?: string; // 'general' | 'country' | 'university' | 'custom'
  expense_id?: string; // link to the actual expense record
}

interface RequirementConfig {
  response_type: ResponseType;
  title: string;
  description?: string;
  is_required: boolean;
  requires_review: boolean;
  accepted_file_types?: string[];
  order?: number;
  scope?: QuestionScope;
  document_type?: DocumentType;
  owner?: string;
  options?: SelectOption[];
}

interface StageTemplate {
  id: string;
  flow_type: FlowType;
  country: string | null;
  country_name: string;
  stage_order: number;
  stage_name: string;
  stage_type: StageType;
  description: string;
  is_required: boolean;
  payment_amount: string | null;
  payment_currency: string;
  auto_notify: boolean;
  requirements_config: RequirementConfig[];
  answer_mode?: AnswerMode;
  linked_fees?: LinkedFee[];
  payment_required_to_progress?: boolean;
  created_by_name: string;
  created_at: string;
}

const STAGE_TYPE_ICONS: Record<StageType, React.ReactNode> = {
  PAYMENT: <CreditCard className='h-4 w-4' />,
  DOCUMENT_UPLOAD: <FileText className='h-4 w-4' />,
  SCHEDULE: <Calendar className='h-4 w-4' />,
  INFO: <Info className='h-4 w-4' />,
  PHYSICAL_VISIT: <MapPin className='h-4 w-4' />,
  APPROVAL: <ShieldCheck className='h-4 w-4' />
};

const STAGE_TYPE_LABELS: Record<StageType, string> = {
  PAYMENT: 'Payment',
  DOCUMENT_UPLOAD: 'Document Upload',
  SCHEDULE: 'Schedule',
  INFO: 'Information',
  PHYSICAL_VISIT: 'Physical Visit',
  APPROVAL: 'Approval'
};

const RESPONSE_TYPE_ICONS: Record<ResponseType, React.ReactNode> = {
  DOCUMENT: <FileUp className='h-3 w-3' />,
  MULTI_FILE: <Files className='h-3 w-3' />,
  IMAGE: <Image className='h-3 w-3' />,
  MULTI_IMAGE: <Images className='h-3 w-3' />,
  TEXT: <Type className='h-3 w-3' />,
  TEXTAREA: <AlignLeft className='h-3 w-3' />,
  NUMBER: <Hash className='h-3 w-3' />,
  DATE: <Calendar className='h-3 w-3' />,
  SELECT: <ListOrdered className='h-3 w-3' />,
  SCHEDULE: <Clock className='h-3 w-3' />,
  INFO: <Info className='h-3 w-3' />
};

const RESPONSE_TYPE_LABELS: Record<ResponseType, string> = {
  DOCUMENT: 'Single file upload',
  MULTI_FILE: 'Multiple files',
  IMAGE: 'Single image',
  MULTI_IMAGE: 'Multiple images',
  TEXT: 'Short text',
  TEXTAREA: 'Long text',
  NUMBER: 'Number input',
  DATE: 'Date picker',
  SELECT: 'Dropdown selection',
  SCHEDULE: 'Appointment',
  INFO: 'Highlight / Info (read-only)'
};

const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  PASSPORT: 'Passport',
  PASSPORT_PHOTO: 'Passport Photo',
  BLUE_BG_PHOTO: 'Blue Background Photo',
  BIRTH_CERT: 'Birth Certificate',
  NIDA: 'NIDA',
  FORM_FOUR_CERT: 'Form Four Certificate',
  FORM_SIX_CERT: 'Form Six Certificate',
  FORM_SIX_LEAVING_CERT: 'Form Six Leaving Certificate',
  RECOMMENDATION_LETTER: 'Recommendation Letter',
  PARENT_ID: 'Parent ID',
  PARENT_BIRTH_CERT: 'Parent Birth Certificate',
  LOCAL_GOV_LETTER: 'Local Government Letter',
  AFFIDAVIT: 'Affidavit',
  OTHER: 'Other'
};

const FILE_RESPONSE_TYPES: ResponseType[] = [
  'DOCUMENT',
  'MULTI_FILE',
  'IMAGE',
  'MULTI_IMAGE'
];

/* ── Create Stage Dialog ── */

function CreateStageDialog({ onSuccess }: { onSuccess: () => void }) {
  const { api } = useClientApi();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    flow_type: 'ABROAD' as FlowType,
    country: null as string | null,
    stage_name: '',
    stage_type: 'INFO' as StageType,
    stage_order: 1,
    description: '',
    is_required: true,
    payment_amount: '',
    payment_currency: 'TZS',
    auto_notify: true
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const payload: Record<string, unknown> = { ...form };
      if (!payload.payment_amount) delete payload.payment_amount;
      if (!payload.country) payload.country = null;
      return (await api!.post('/admin/stage-templates/', payload)).data;
    },
    onSuccess: () => {
      toast.success('Stage template created');
      setOpen(false);
      setForm({
        flow_type: 'ABROAD',
        country: null,
        stage_name: '',
        stage_type: 'INFO',
        stage_order: 1,
        description: '',
        is_required: true,
        payment_amount: '',
        payment_currency: 'TZS',
        auto_notify: true
      });
      onSuccess();
    },
    onError: () => toast.error('Failed to create stage template')
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className='mr-2 h-4 w-4' /> Add Stage
        </Button>
      </DialogTrigger>
      <DialogContent className='max-w-lg'>
        <DialogHeader>
          <DialogTitle>Create Stage Template</DialogTitle>
        </DialogHeader>
        <div className='space-y-4'>
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <Label required>Flow Type</Label>
              <Select
                value={form.flow_type}
                onValueChange={(v) =>
                  setForm({ ...form, flow_type: v as FlowType })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='LOCAL'>Local</SelectItem>
                  <SelectItem value='ABROAD'>Abroad</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Country (optional)</Label>
              <EntityPicker
                endpoint='/data-admin/countries/'
                queryKey='data-admin-countries'
                mapItem={(item) => ({
                  id: item.id as string,
                  name: item.name as string
                })}
                value={form.country}
                onChange={(id) => setForm({ ...form, country: id ?? null })}
                placeholder='Default (all countries)'
              />
              <p className='text-muted-foreground mt-1 text-[10px]'>
                Leave empty for default flow, or pick a country for a custom
                flow
              </p>
            </div>
          </div>
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <Label required>Stage Type</Label>
              <Select
                value={form.stage_type}
                onValueChange={(v) =>
                  setForm({ ...form, stage_type: v as StageType })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(STAGE_TYPE_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>
                      {v}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label required>Stage Name</Label>
            <Input
              value={form.stage_name}
              onChange={(e) => setForm({ ...form, stage_name: e.target.value })}
              placeholder='e.g. Document Collection'
            />
          </div>
          <div>
            <Label required>Order</Label>
            <Input
              type='number'
              value={form.stage_order}
              onChange={(e) =>
                setForm({ ...form, stage_order: parseInt(e.target.value) || 1 })
              }
              min={1}
            />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder='Instructions for the student...'
              rows={2}
            />
          </div>
          {form.stage_type === 'PAYMENT' && (
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <Label>Payment Amount</Label>
                <Input
                  type='number'
                  value={form.payment_amount}
                  onChange={(e) =>
                    setForm({ ...form, payment_amount: e.target.value })
                  }
                  placeholder='500000'
                />
              </div>
              <div>
                <Label>Currency</Label>
                <Input
                  value={form.payment_currency}
                  onChange={(e) =>
                    setForm({ ...form, payment_currency: e.target.value })
                  }
                />
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant='outline' onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => createMutation.mutate()}
            disabled={createMutation.isPending || !form.stage_name}
          >
            {createMutation.isPending ? 'Creating...' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ── Options Editor (for SELECT response type) ── */

function OptionsEditor({
  options,
  onChange
}: {
  options: SelectOption[];
  onChange: (options: SelectOption[]) => void;
}) {
  const addOption = () => {
    onChange([...options, { value: '', label: '' }]);
  };

  const updateOption = (idx: number, field: 'value' | 'label', val: string) => {
    const updated = options.map((opt, i) =>
      i === idx ? { ...opt, [field]: val } : opt
    );
    onChange(updated);
  };

  const removeOption = (idx: number) => {
    onChange(options.filter((_, i) => i !== idx));
  };

  return (
    <div className='space-y-2'>
      <Label>Options</Label>
      {options.length === 0 && (
        <p className='text-muted-foreground text-xs italic'>
          No options yet. Add at least one.
        </p>
      )}
      {options.map((opt, idx) => (
        <div key={idx} className='flex items-center gap-2'>
          <Input
            value={opt.value}
            onChange={(e) => updateOption(idx, 'value', e.target.value)}
            placeholder='Value (e.g. male)'
            className='h-8 flex-1 text-xs'
          />
          <Input
            value={opt.label}
            onChange={(e) => updateOption(idx, 'label', e.target.value)}
            placeholder='Label (e.g. Male)'
            className='h-8 flex-1 text-xs'
          />
          <Button
            variant='ghost'
            size='icon'
            className='text-destructive hover:text-destructive h-7 w-7 shrink-0'
            onClick={() => removeOption(idx)}
          >
            <X className='h-3 w-3' />
          </Button>
        </div>
      ))}
      <Button
        variant='outline'
        size='sm'
        className='h-7 text-xs'
        onClick={addOption}
      >
        <Plus className='mr-1 h-3 w-3' /> Add option
      </Button>
    </div>
  );
}

/* ── Add Question Dialog ── */

function AddQuestionDialog({
  onAdd
}: {
  onAdd: (q: RequirementConfig) => void;
}) {
  const [open, setOpen] = useState(false);

  const defaultForm: RequirementConfig & { scope: QuestionScope } = {
    response_type: 'TEXT',
    title: '',
    description: '',
    is_required: true,
    requires_review: false,
    accepted_file_types: ['.pdf', '.jpg', '.png'],
    scope: 'application',
    document_type: undefined,
    owner: 'STUDENT',
    options: []
  };

  const [form, setForm] = useState<
    RequirementConfig & { scope: QuestionScope }
  >(defaultForm);

  const isFileType = FILE_RESPONSE_TYPES.includes(form.response_type);
  const showDocumentType = form.scope === 'student' && isFileType;
  const showAcceptedFileTypes = isFileType;
  const showOptions = form.response_type === 'SELECT';

  const handleAdd = () => {
    if (!form.title.trim()) return;

    const question: RequirementConfig = {
      response_type: form.response_type,
      title: form.title,
      description: form.description || undefined,
      is_required: form.is_required,
      requires_review: form.requires_review,
      scope: form.scope,
      owner: form.owner
    };

    if (showAcceptedFileTypes) {
      question.accepted_file_types = form.accepted_file_types;
    }

    if (showDocumentType && form.document_type) {
      question.document_type = form.document_type;
    }

    if (showOptions && form.options && form.options.length > 0) {
      question.options = form.options.filter(
        (o) => o.value.trim() && o.label.trim()
      );
    }

    onAdd(question);
    setForm({ ...defaultForm });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant='outline' size='sm' className='h-7 text-xs'>
          <Plus className='mr-1 h-3 w-3' /> Add Question
        </Button>
      </DialogTrigger>
      <DialogContent className='max-h-[85vh] max-w-lg overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Add Question</DialogTitle>
        </DialogHeader>
        <div className='space-y-4'>
          {/* Response Type */}
          <div>
            <Label required>Response type</Label>
            <Select
              value={form.response_type}
              onValueChange={(v) =>
                setForm({ ...form, response_type: v as ResponseType })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(RESPONSE_TYPE_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>
                    <span className='flex items-center gap-2'>
                      {RESPONSE_TYPE_ICONS[k as ResponseType]}
                      {v}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Title */}
          <div>
            <Label required>Title</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder='e.g. Form 4 Certificate'
            />
          </div>

          {/* Description */}
          <div>
            <Label>Description / Instructions</Label>
            <Textarea
              value={form.description || ''}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder='Instructions shown to the student...'
              rows={2}
            />
          </div>

          {/* Owner — who provides the answer */}
          <div>
            <Label>Who provides this?</Label>
            <RadioGroup
              value={form.owner || 'student'}
              onValueChange={(v) => setForm({ ...form, owner: v })}
              className='mt-1 flex gap-4'
            >
              <div className='flex items-center gap-2'>
                <RadioGroupItem value='student' id='owner-student' />
                <Label
                  htmlFor='owner-student'
                  className='cursor-pointer text-xs font-normal'
                >
                  Student fills this in
                </Label>
              </div>
              <div className='flex items-center gap-2'>
                <RadioGroupItem value='staff' id='owner-staff' />
                <Label
                  htmlFor='owner-staff'
                  className='cursor-pointer text-xs font-normal'
                >
                  Admin/Staff fills this in
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Scope */}
          <div>
            <Label>Scope</Label>
            <RadioGroup
              value={form.scope}
              onValueChange={(v) =>
                setForm({ ...form, scope: v as QuestionScope })
              }
              className='mt-1 flex gap-4'
            >
              <div className='flex items-center gap-2'>
                <RadioGroupItem value='application' id='scope-application' />
                <Label
                  htmlFor='scope-application'
                  className='cursor-pointer text-xs font-normal'
                >
                  Application-specific
                </Label>
              </div>
              <div className='flex items-center gap-2'>
                <RadioGroupItem value='student' id='scope-student' />
                <Label
                  htmlFor='scope-student'
                  className='cursor-pointer text-xs font-normal'
                >
                  Reusable across applications
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Document Type (conditional) */}
          {showDocumentType && (
            <div>
              <Label>Document type</Label>
              <Select
                value={form.document_type || ''}
                onValueChange={(v) =>
                  setForm({ ...form, document_type: v as DocumentType })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder='Select document type...' />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(DOCUMENT_TYPE_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>
                      {v}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className='text-muted-foreground mt-1 text-[10px]'>
                Links this question to a reusable student document slot
              </p>
            </div>
          )}

          {/* Accepted file types (conditional) */}
          {showAcceptedFileTypes && (
            <div>
              <Label>Accepted file types</Label>
              <Input
                value={form.accepted_file_types?.join(', ') || ''}
                onChange={(e) =>
                  setForm({
                    ...form,
                    accepted_file_types: e.target.value
                      .split(',')
                      .map((s) => s.trim())
                      .filter(Boolean)
                  })
                }
                placeholder='.pdf, .jpg, .png'
              />
            </div>
          )}

          {/* Options editor (conditional for SELECT) */}
          {showOptions && (
            <OptionsEditor
              options={form.options || []}
              onChange={(options) => setForm({ ...form, options })}
            />
          )}

          {/* Owner */}
          <div>
            <Label>Owner</Label>
            <Select
              value={form.owner || 'STUDENT'}
              onValueChange={(v) => setForm({ ...form, owner: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='STUDENT'>Student</SelectItem>
                <SelectItem value='STAFF'>Staff</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Required */}
          <div className='flex items-center justify-between'>
            <Label className='mb-0'>Required</Label>
            <Switch
              checked={form.is_required}
              onCheckedChange={(v) => setForm({ ...form, is_required: v })}
            />
          </div>

          {/* Requires review */}
          <div className='flex items-center justify-between'>
            <div>
              <Label className='mb-0'>Requires admin review</Label>
              <p className='text-muted-foreground text-[10px]'>
                If off, student answers are auto-approved
              </p>
            </div>
            <Switch
              checked={form.requires_review}
              onCheckedChange={(v) => setForm({ ...form, requires_review: v })}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant='outline' onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleAdd} disabled={!form.title.trim()}>
            Add
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ── Linked Fees Editor ── */

function LinkedFeesEditor({
  fees,
  onChange,
  flowType,
  countryId
}: {
  fees: LinkedFee[];
  onChange: (fees: LinkedFee[]) => void;
  flowType?: string;
  countryId?: string | null;
}) {
  const { api } = useClientApi();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [search, setSearch] = useState('');

  // Fetch available expenses from all sources
  const { data: generalExpenses } = useQuery({
    queryKey: ['expenses-general'],
    queryFn: () =>
      api!
        .get('/data-admin/general-expenses/', { params: { page_size: 100 } })
        .then((r) => r.data?.results || []),
    enabled: !!api && pickerOpen
  });

  const { data: countryExpenses } = useQuery({
    queryKey: ['expenses-country', countryId],
    queryFn: () =>
      api!
        .get('/data-admin/country-expenses/', {
          params: {
            page_size: 100,
            ...(countryId ? { country: countryId } : {})
          }
        })
        .then((r) => r.data?.results || []),
    enabled: !!api && pickerOpen
  });

  const { data: uniExpenses } = useQuery({
    queryKey: ['expenses-university'],
    queryFn: () =>
      api!
        .get('/data-admin/university-expenses/', { params: { page_size: 50 } })
        .then((r) => r.data?.results || []),
    enabled: !!api && pickerOpen
  });

  // Build grouped options
  type ExpenseOption = {
    id: string;
    name: string;
    amount: number;
    currency: string;
    source: string;
    group: string;
    iname?: string;
    linked_stage?: string;
  };
  const allExpenses: ExpenseOption[] = [];

  if (generalExpenses) {
    for (const e of generalExpenses) {
      allExpenses.push({
        id: e.id,
        name: e.name,
        amount: e.start_amount || 0,
        currency: e.currency || 'TZS',
        source: 'general',
        group: 'General Fees',
        iname: e.iname,
        linked_stage: e.linked_stage
      });
    }
  }
  if (countryExpenses) {
    for (const e of countryExpenses) {
      allExpenses.push({
        id: e.id,
        name: `${e.name}${e.country_name ? ` (${e.country_name})` : ''}`,
        amount: e.start_amount || 0,
        currency: e.currency || 'TZS',
        source: 'country',
        group: 'Country Fees',
        iname: e.iname,
        linked_stage: e.linked_stage
      });
    }
  }
  if (uniExpenses) {
    for (const e of uniExpenses) {
      allExpenses.push({
        id: e.id,
        name: `${e.name}${e.university_name ? ` (${e.university_name})` : ''}`,
        amount: e.start_amount || 0,
        currency: e.currency || 'TZS',
        source: 'university',
        group: 'University Fees',
        iname: e.iname,
        linked_stage: e.linked_stage
      });
    }
  }

  const filtered = search
    ? allExpenses.filter((e) =>
        e.name.toLowerCase().includes(search.toLowerCase())
      )
    : allExpenses;

  const grouped = filtered.reduce<Record<string, ExpenseOption[]>>((acc, e) => {
    (acc[e.group] ??= []).push(e);
    return acc;
  }, {});

  const selectExpense = (expense: ExpenseOption) => {
    // Don't add duplicate
    if (fees.some((f) => f.expense_id === expense.id)) return;
    onChange([
      ...fees,
      {
        fee_type: expense.iname || expense.name,
        amount: String(expense.amount),
        currency: expense.currency,
        description: expense.name,
        source: expense.source,
        expense_id: expense.id
      }
    ]);
    setPickerOpen(false);
    setSearch('');
  };

  const addCustomFee = () => {
    onChange([
      ...fees,
      {
        fee_type: '',
        amount: '',
        currency: 'TZS',
        description: '',
        source: 'custom'
      }
    ]);
  };

  const updateFee = (idx: number, field: keyof LinkedFee, val: string) => {
    const updated = fees.map((f, i) =>
      i === idx ? { ...f, [field]: val } : f
    );
    onChange(updated);
  };

  const removeFee = (idx: number) => {
    onChange(fees.filter((_, i) => i !== idx));
  };

  const SOURCE_COLORS: Record<string, string> = {
    general: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    country: 'bg-green-500/10 text-green-500 border-green-500/20',
    university: 'bg-violet-500/10 text-violet-500 border-violet-500/20',
    custom: 'bg-amber-500/10 text-amber-500 border-amber-500/20'
  };

  return (
    <div className='space-y-2'>
      <div className='flex items-center justify-between'>
        <Label className='text-muted-foreground mb-0 text-xs font-medium'>
          Linked Fees
        </Label>
        <div className='flex gap-1'>
          <Button
            variant='outline'
            size='sm'
            className='h-7 text-xs'
            onClick={() => setPickerOpen(true)}
          >
            <CreditCard className='mr-1 h-3 w-3' /> Pick from Expenses
          </Button>
          <Button
            variant='ghost'
            size='sm'
            className='h-7 text-xs'
            onClick={addCustomFee}
          >
            <Plus className='mr-1 h-3 w-3' /> Custom
          </Button>
        </div>
      </div>

      {fees.length === 0 && (
        <p className='text-muted-foreground text-xs italic'>
          No linked fees. Pick from expense catalog or add custom fee.
        </p>
      )}

      {fees.map((fee, idx) => (
        <div
          key={idx}
          className='bg-muted/30 space-y-1.5 rounded-md border p-2'
        >
          <div className='flex items-center gap-2'>
            {fee.source && fee.source !== 'custom' && (
              <span
                className={`rounded-full border px-1.5 py-0.5 text-[9px] ${SOURCE_COLORS[fee.source] || ''}`}
              >
                {fee.source}
              </span>
            )}
            <span className='flex-1 truncate text-xs font-medium'>
              {fee.description || fee.fee_type || 'Custom fee'}
            </span>
            <span className='text-muted-foreground text-xs'>
              {fee.currency} {Number(fee.amount || 0).toLocaleString()}
            </span>
            <Button
              variant='ghost'
              size='icon'
              className='text-destructive hover:text-destructive h-6 w-6 shrink-0'
              onClick={() => removeFee(idx)}
            >
              <X className='h-3 w-3' />
            </Button>
          </div>
          {/* Custom fee: show editable fields */}
          {fee.source === 'custom' && (
            <div className='flex items-center gap-1.5 pt-1'>
              <Input
                value={fee.fee_type}
                onChange={(e) => updateFee(idx, 'fee_type', e.target.value)}
                placeholder='Fee name'
                className='h-6 flex-1 text-[11px]'
              />
              <Input
                type='number'
                value={fee.amount}
                onChange={(e) => updateFee(idx, 'amount', e.target.value)}
                placeholder='Amount'
                className='h-6 w-20 text-[11px]'
              />
              <select
                value={fee.currency}
                onChange={(e) => updateFee(idx, 'currency', e.target.value)}
                className='h-6 rounded border bg-transparent px-1 text-[11px]'
              >
                <option value='TZS'>TZS</option>
                <option value='USD'>USD</option>
              </select>
            </div>
          )}
        </div>
      ))}

      {/* Expense Picker Dialog */}
      <Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
        <DialogContent className='flex max-h-[70vh] max-w-lg flex-col overflow-hidden'>
          <DialogHeader>
            <DialogTitle>Pick Fee from Expense Catalog</DialogTitle>
            <DialogDescription>
              Select an expense to link to this stage. Amounts are auto-filled.
            </DialogDescription>
          </DialogHeader>
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder='Search expenses...'
            className='my-2'
            autoFocus
          />
          <div className='max-h-[50vh] flex-1 space-y-3 overflow-y-auto'>
            {Object.entries(grouped).map(([group, items]) => (
              <div key={group}>
                <p className='text-muted-foreground mb-1 text-xs font-semibold tracking-wider uppercase'>
                  {group}
                </p>
                <div className='space-y-1'>
                  {items.map((expense) => {
                    const alreadyAdded = fees.some(
                      (f) => f.expense_id === expense.id
                    );
                    return (
                      <button
                        key={expense.id}
                        onClick={() => !alreadyAdded && selectExpense(expense)}
                        disabled={alreadyAdded}
                        className={`w-full rounded-md border px-3 py-2 text-left text-xs transition-colors ${
                          alreadyAdded
                            ? 'bg-muted/20 cursor-not-allowed opacity-40'
                            : 'hover:border-primary/30 hover:bg-primary/5 cursor-pointer'
                        }`}
                      >
                        <div className='flex items-center justify-between'>
                          <span className='font-medium'>{expense.name}</span>
                          <span className='text-muted-foreground'>
                            {expense.currency} {expense.amount.toLocaleString()}
                          </span>
                        </div>
                        {expense.linked_stage && (
                          <p className='text-muted-foreground mt-0.5 text-[10px]'>
                            Stage: {expense.linked_stage}
                          </p>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
            {Object.keys(grouped).length === 0 && (
              <p className='text-muted-foreground py-8 text-center text-sm'>
                {search
                  ? 'No expenses match your search.'
                  : 'No expenses found in the catalog.'}
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ── Stage Row with expandable questions ── */

function StageRow({
  stage,
  onDelete,
  onUpdateQuestions,
  onUpdateStage
}: {
  stage: StageTemplate;
  onDelete: () => void;
  onUpdateQuestions: (questions: RequirementConfig[]) => void;
  onUpdateStage: (patch: Partial<StageTemplate>) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const questions = stage.requirements_config || [];
  const answerMode = stage.answer_mode || 'list';
  const linkedFees = stage.linked_fees || [];

  const handleAddQuestion = (q: RequirementConfig) => {
    const updated = [...questions, { ...q, order: questions.length }];
    onUpdateQuestions(updated);
  };

  const handleRemoveQuestion = (idx: number) => {
    const updated = questions.filter((_, i) => i !== idx);
    onUpdateQuestions(updated);
  };

  return (
    <div className='hover:border-foreground/10 rounded-lg border transition-colors'>
      {/* Stage header */}
      <div className='flex items-center gap-3 p-3'>
        <div className='text-muted-foreground'>
          <GripVertical className='h-4 w-4' />
        </div>
        <div className='bg-primary/10 text-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-sm font-bold'>
          {stage.stage_order}
        </div>
        <div className='min-w-0 flex-1'>
          <div className='flex items-center gap-2'>
            <p className='text-sm font-medium'>{stage.stage_name}</p>
            <Badge variant='outline' className='gap-1 text-xs'>
              {STAGE_TYPE_ICONS[stage.stage_type]}
              <span>{STAGE_TYPE_LABELS[stage.stage_type]}</span>
            </Badge>
            {stage.is_required && (
              <Badge variant='secondary' className='text-[10px]'>
                Required
              </Badge>
            )}
            {answerMode === 'wizard' && (
              <Badge
                variant='outline'
                className='border-violet-300 text-[10px] text-violet-600'
              >
                Wizard
              </Badge>
            )}
          </div>
          {stage.description && (
            <p className='text-muted-foreground mt-0.5 truncate text-xs'>
              {stage.description}
            </p>
          )}
        </div>
        {questions.length > 0 && (
          <Badge variant='secondary' className='shrink-0 text-[10px]'>
            {questions.length} question{questions.length !== 1 ? 's' : ''}
          </Badge>
        )}
        {linkedFees.length > 0 && (
          <Badge variant='outline' className='shrink-0 text-[10px]'>
            {linkedFees.length} fee{linkedFees.length !== 1 ? 's' : ''}
          </Badge>
        )}
        {stage.payment_amount && (
          <Badge variant='outline'>
            {stage.payment_currency}{' '}
            {Number(stage.payment_amount).toLocaleString()}
          </Badge>
        )}
        <Button
          variant='ghost'
          size='icon'
          className='h-8 w-8 shrink-0'
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? (
            <ChevronUp className='h-4 w-4' />
          ) : (
            <ChevronDown className='h-4 w-4' />
          )}
        </Button>
        <Button
          variant='ghost'
          size='icon'
          className='text-destructive hover:text-destructive h-8 w-8 shrink-0'
          onClick={() => {
            if (confirm('Delete this stage template?')) onDelete();
          }}
        >
          <Trash2 className='h-3.5 w-3.5' />
        </Button>
      </div>

      {/* Expanded: stage settings + questions list */}
      {expanded && (
        <div className='space-y-4 border-t px-3 pt-2 pb-3'>
          {/* Stage-level settings */}
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <Label className='text-xs'>Answer mode</Label>
              <Select
                value={answerMode}
                onValueChange={(v) =>
                  onUpdateStage({ answer_mode: v as AnswerMode })
                }
              >
                <SelectTrigger className='h-8 text-xs'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='list'>
                    List mode (questions as list)
                  </SelectItem>
                  <SelectItem value='wizard'>
                    Wizard mode (one at a time)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Linked Fees */}
          <LinkedFeesEditor
            fees={linkedFees}
            onChange={(fees) => onUpdateStage({ linked_fees: fees })}
            flowType={stage.flow_type}
            countryId={stage.country}
          />

          {/* Payment Required to Progress */}
          {linkedFees.length > 0 && (
            <label className='flex items-center gap-2 text-xs'>
              <input
                type='checkbox'
                checked={stage.payment_required_to_progress ?? false}
                onChange={(e) =>
                  onUpdateStage({
                    payment_required_to_progress: e.target.checked
                  })
                }
                className='border-muted-foreground/30 h-3.5 w-3.5 rounded'
              />
              <span className='text-muted-foreground'>
                Require linked fees to be paid before student can progress past
                this stage
              </span>
            </label>
          )}

          {/* Questions */}
          <div>
            <div className='mb-2 flex items-center justify-between'>
              <p className='text-muted-foreground text-xs font-medium'>
                Questions asked in this stage
              </p>
              <AddQuestionDialog onAdd={handleAddQuestion} />
            </div>

            {questions.length === 0 ? (
              <p className='text-muted-foreground py-3 text-center text-xs italic'>
                No questions configured. Students will just see the stage with
                no fields to fill.
              </p>
            ) : (
              <div className='space-y-1.5'>
                {questions.map((q, idx) => (
                  <div
                    key={idx}
                    className='bg-muted/30 flex items-center gap-2.5 rounded-md border px-2.5 py-2'
                  >
                    <span className='text-muted-foreground'>
                      {RESPONSE_TYPE_ICONS[q.response_type]}
                    </span>
                    <div className='min-w-0 flex-1'>
                      <div className='flex flex-wrap items-center gap-1.5'>
                        <span className='truncate text-xs font-medium'>
                          {q.title}
                        </span>
                        {q.is_required && (
                          <span className='text-[10px] text-red-500'>*</span>
                        )}
                        <Badge
                          variant='outline'
                          className='px-1 py-0 text-[9px]'
                        >
                          {RESPONSE_TYPE_LABELS[q.response_type]}
                        </Badge>
                        {q.requires_review && (
                          <Badge
                            variant='outline'
                            className='border-amber-300 px-1 py-0 text-[9px] text-amber-600'
                          >
                            Review
                          </Badge>
                        )}
                        {q.scope === 'student' && (
                          <Badge
                            variant='outline'
                            className='border-blue-300 px-1 py-0 text-[9px] text-blue-600'
                          >
                            Reusable
                          </Badge>
                        )}
                        {q.document_type && (
                          <Badge
                            variant='outline'
                            className='border-green-300 px-1 py-0 text-[9px] text-green-600'
                          >
                            {DOCUMENT_TYPE_LABELS[q.document_type]}
                          </Badge>
                        )}
                        {q.owner === 'STAFF' && (
                          <Badge
                            variant='outline'
                            className='border-purple-300 px-1 py-0 text-[9px] text-purple-600'
                          >
                            Staff
                          </Badge>
                        )}
                        {q.options && q.options.length > 0 && (
                          <Badge
                            variant='outline'
                            className='px-1 py-0 text-[9px]'
                          >
                            {q.options.length} option
                            {q.options.length !== 1 ? 's' : ''}
                          </Badge>
                        )}
                      </div>
                      {q.description && (
                        <p className='text-muted-foreground truncate text-[10px]'>
                          {q.description}
                        </p>
                      )}
                    </div>
                    <Button
                      variant='ghost'
                      size='icon'
                      className='text-destructive hover:text-destructive h-6 w-6 shrink-0'
                      onClick={() => {
                        if (confirm(`Remove "${q.title}"?`))
                          handleRemoveQuestion(idx);
                      }}
                    >
                      <Trash2 className='h-3 w-3' />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Main Page ── */

export default function ApplicationFlowsPage() {
  const { api } = useClientApi();
  const queryClient = useQueryClient();
  const [filterFlow, setFilterFlow] = useState<string>('ALL');

  const { data, isLoading } = useQuery({
    queryKey: ['stage-templates'],
    queryFn: async () => {
      const response = await api!.get('/admin/stage-templates/', {
        params: { page_size: 100, ordering: 'flow_type,stage_order' }
      });
      return response.data;
    },
    enabled: !!api
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api!.delete(`/admin/stage-templates/${id}/`);
    },
    onSuccess: () => {
      toast.success('Stage deleted');
      queryClient.invalidateQueries({ queryKey: ['stage-templates'] });
    },
    onError: () => toast.error('Failed to delete')
  });

  const updateQuestionsMutation = useMutation({
    mutationFn: async ({
      id,
      requirements_config
    }: {
      id: string;
      requirements_config: RequirementConfig[];
    }) => {
      return (
        await api!.patch(`/admin/stage-templates/${id}/`, {
          requirements_config
        })
      ).data;
    },
    onSuccess: () => {
      toast.success('Questions updated');
      queryClient.invalidateQueries({ queryKey: ['stage-templates'] });
    },
    onError: () => toast.error('Failed to update questions')
  });

  const updateStageMutation = useMutation({
    mutationFn: async ({
      id,
      patch
    }: {
      id: string;
      patch: Partial<StageTemplate>;
    }) => {
      return (await api!.patch(`/admin/stage-templates/${id}/`, patch)).data;
    },
    onSuccess: () => {
      toast.success('Stage updated');
      queryClient.invalidateQueries({ queryKey: ['stage-templates'] });
    },
    onError: () => toast.error('Failed to update stage')
  });

  const templates: StageTemplate[] = data?.results || [];
  const filtered =
    filterFlow === 'ALL'
      ? templates
      : templates.filter((t) => t.flow_type === filterFlow);

  // Group by flow_type + country
  const defaultLocal = filtered.filter(
    (t) => t.flow_type === 'LOCAL' && !t.country
  );
  const defaultAbroad = filtered.filter(
    (t) => t.flow_type === 'ABROAD' && !t.country
  );

  // Country-specific flows
  const countryFlows = new Map<
    string,
    { country_name: string; flow_type: string; stages: StageTemplate[] }
  >();
  filtered
    .filter((t) => t.country)
    .forEach((t) => {
      const key = `${t.flow_type}-${t.country}`;
      if (!countryFlows.has(key)) {
        countryFlows.set(key, {
          country_name: t.country_name || t.country || 'Unknown',
          flow_type: t.flow_type,
          stages: []
        });
      }
      countryFlows.get(key)!.stages.push(t);
    });

  // Keep backward compat
  const localTemplates = defaultLocal;
  const abroadTemplates = defaultAbroad;

  const renderStageList = (
    stages: StageTemplate[],
    title: string,
    icon: React.ReactNode
  ) => (
    <Card>
      <CardHeader className='flex flex-row items-center justify-between'>
        <div className='flex items-center gap-2'>
          {icon}
          <CardTitle className='text-base'>{title}</CardTitle>
          <Badge variant='secondary'>{stages.length} stages</Badge>
        </div>
      </CardHeader>
      <CardContent>
        {stages.length === 0 ? (
          <p className='text-muted-foreground py-6 text-center text-sm'>
            No stage templates for this flow.
          </p>
        ) : (
          <div className='space-y-2'>
            {stages
              .sort((a, b) => a.stage_order - b.stage_order)
              .map((stage) => (
                <StageRow
                  key={stage.id}
                  stage={stage}
                  onDelete={() => deleteMutation.mutate(stage.id)}
                  onUpdateQuestions={(questions) =>
                    updateQuestionsMutation.mutate({
                      id: stage.id,
                      requirements_config: questions
                    })
                  }
                  onUpdateStage={(patch) =>
                    updateStageMutation.mutate({ id: stage.id, patch })
                  }
                />
              ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <PageContainer className='w-full'>
      <div className='w-full space-y-6'>
        <div className='flex w-full items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>
              Application Flows
            </h1>
            <p className='text-muted-foreground'>
              Configure stages and questions for local and abroad application
              journeys
            </p>
          </div>
          <div className='flex items-center gap-3'>
            <Select value={filterFlow} onValueChange={setFilterFlow}>
              <SelectTrigger className='w-[140px]'>
                <SelectValue placeholder='Filter' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='ALL'>All Flows</SelectItem>
                <SelectItem value='LOCAL'>Local</SelectItem>
                <SelectItem value='ABROAD'>Abroad</SelectItem>
              </SelectContent>
            </Select>
            <CreateStageDialog
              onSuccess={() =>
                queryClient.invalidateQueries({ queryKey: ['stage-templates'] })
              }
            />
          </div>
        </div>

        {isLoading ? (
          <div className='space-y-4'>
            {[1, 2].map((i) => (
              <Card key={i}>
                <CardContent className='py-12'>
                  <div className='bg-muted mx-auto h-6 w-32 animate-pulse rounded' />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className='space-y-6'>
            {/* Default flows (no country) */}
            {(filterFlow === 'ALL' || filterFlow === 'LOCAL') &&
              renderStageList(
                localTemplates,
                'Local Flow (Default)',
                <MapPin className='h-5 w-5 text-blue-500' />
              )}
            {(filterFlow === 'ALL' || filterFlow === 'ABROAD') &&
              renderStageList(
                abroadTemplates,
                'Abroad Flow (Default)',
                <Globe className='h-5 w-5 text-green-500' />
              )}

            {/* Country-specific flows */}
            {countryFlows.size > 0 && (
              <>
                <div className='border-t pt-4'>
                  <h3 className='text-muted-foreground mb-4 text-xs font-semibold tracking-wider uppercase'>
                    Country-Specific Flows
                  </h3>
                </div>
                {Array.from(countryFlows.values()).map(
                  ({ country_name, flow_type, stages }) =>
                    renderStageList(
                      stages,
                      `${country_name} (${flow_type})`,
                      <Globe className='h-5 w-5 text-purple-500' />
                    )
                )}
              </>
            )}
          </div>
        )}
      </div>
    </PageContainer>
  );
}
