'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter, useParams } from 'next/navigation';
import useClientApi from '@/lib/axios/clientSide';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { format, parseISO } from 'date-fns';
import {
  AlertCircle,
  Loader2,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Upload,
  FilePlus,
  Calendar,
  Info,
  Trash2
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Application,
  ApplicationDocument,
  ApplicationInfo
} from '@/types/application';

interface Expense {
  id: string;
  name: string;
  type: 'general' | 'country' | 'university' | 'course';
  amount: number;
  description?: string;
  payment_exists?: boolean;
}

interface Fee {
  id: string;
  name: string;
  amount: number;
  status: string;
  exp_id?: string;
  created_at: string;
  description?: string;
}

const editApplicationSchema = z.object({
  status: z.string(),
  info: z.string().optional().nullable(),
  is_sent: z.boolean().default(false),
  when: z.string().optional().nullable(),
  progress_status: z.string().optional().nullable(),
  new_information: z.string().optional().nullable(),
  credentials: z
    .object({
      username: z.string().optional().nullable(),
      password: z.string().optional().nullable()
    })
    .optional(),
  linked_expenses: z.array(z.string()).optional()
});

type EditApplicationFormValues = z.infer<typeof editApplicationSchema>;

export default function EditApplicationPage() {
  const router = useRouter();
  const params = useParams();
  const { api } = useClientApi();
  const applicationId = params.id as string;
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState('basic');
  const [uploadingLetter, setUploadingLetter] = useState(false);
  const [uploadingDocuments, setUploadingDocuments] = useState(false);
  const [letterPreview, setLetterPreview] = useState<string | null>(null);

  // Expense management states
  const [searchingExpenses, setSearchingExpenses] = useState(false);
  const [expenseSearchQuery, setExpenseSearchQuery] = useState('');
  const [expenseSearchResults, setExpenseSearchResults] = useState<Expense[]>(
    []
  );
  const [creatingPayment, setCreatingPayment] = useState(false);
  const [creatingPaymentId, setCreatingPaymentId] = useState<string | null>(
    null
  );
  const [selectedExpenses, setSelectedExpenses] = useState<string[]>([]);
  const [expenseTab, setExpenseTab] = useState('search');

  // Check for tab parameter in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, []);

  const form = useForm<EditApplicationFormValues>({
    resolver: zodResolver(editApplicationSchema),
    defaultValues: {
      status: '',
      info: '',
      is_sent: false,
      when: null,
      progress_status: null,
      new_information: '',
      credentials: {
        username: '',
        password: ''
      }
    }
  });

  // Fetch application data
  const {
    data: application,
    isLoading,
    error
  } = useQuery<Application>({
    queryKey: ['application', applicationId],
    queryFn: async () => {
      if (!api) throw new Error('API not initialized');
      const response = await api.get(`/admin/applications/${applicationId}/`);
      return response.data;
    },
    enabled: !!applicationId
  });

  // Update application mutation
  const updateMutation = useMutation({
    mutationFn: async (values: EditApplicationFormValues) => {
      if (!api) throw new Error('API not initialized');
      return await api.patch(`/admin/applications/${applicationId}/`, values);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['application', applicationId]
      });
      toast.success('Application updated successfully');
      router.push(`/admin/applications/${applicationId}`);
    },
    onError: (error: Error) => {
      toast.error('Failed to update application');
      console.error(error);
    }
  });

  // Document upload mutation
  const uploadDocumentsMutation = useMutation({
    mutationFn: async (files: FileList) => {
      if (!api) throw new Error('API not initialized');
      const formData = new FormData();

      // Append each file
      Array.from(files).forEach((file) => {
        formData.append('new_documents', file);
      });

      return await api.patch(
        `/admin/applications/${applicationId}/`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['application', applicationId]
      });
      toast.success('Documents uploaded successfully');
      setUploadingDocuments(false);
    },
    onError: (error: Error) => {
      toast.error('Failed to upload documents');
      console.error(error);
      setUploadingDocuments(false);
    }
  });

  // Admission letter upload mutation
  const uploadLetterMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!api) throw new Error('API not initialized');
      const formData = new FormData();
      formData.append('admission_letter_file', file);

      return await api.patch(
        `/admin/applications/${applicationId}/`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['application', applicationId]
      });
      toast.success('Admission letter uploaded successfully');
      setUploadingLetter(false);
    },
    onError: (error: Error) => {
      toast.error('Failed to upload admission letter');
      console.error(error);
      setUploadingLetter(false);
    }
  });

  // Create payment mutation
  const createPaymentMutation = useMutation({
    mutationFn: async (expenseId: string) => {
      if (!api) throw new Error('API not initialized');
      return await api.post(
        `/admin/applications/${applicationId}/create_payment/`,
        {
          expense_id: expenseId
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['application', applicationId]
      });
      toast.success('Payment created successfully');
      setCreatingPayment(false);
      setCreatingPaymentId(null);

      // Update search results to reflect new payment
      if (creatingPaymentId) {
        setExpenseSearchResults(
          expenseSearchResults.map((expense) =>
            expense.id === creatingPaymentId
              ? { ...expense, payment_exists: true }
              : expense
          )
        );
      }
    },
    onError: (error: Error & { response?: { data?: { error?: string } } }) => {
      toast.error(error?.response?.data?.error || 'Failed to create payment');
      console.error(error);
      setCreatingPayment(false);
      setCreatingPaymentId(null);
    }
  });

  // Update the useEffect for setting form values
  useEffect(() => {
    if (application) {
      // Extract existing fees/expenses
      const existingExpenseIds =
        application.fees
          ?.filter((fee: Fee) => fee.exp_id)
          .map((fee: Fee) => fee.exp_id)
          .filter((id): id is string => id !== undefined) || [];

      setSelectedExpenses(existingExpenseIds);

      // Convert the date string to the format expected by datetime-local input
      const whenDate = application.when
        ? format(new Date(application.when), "yyyy-MM-dd'T'HH:mm")
        : '';

      form.reset({
        status: application.status || '',
        info: application.info || '',
        is_sent: application.is_sent || false,
        when: whenDate,
        progress_status: application.progress?.status || '',
        new_information: '',
        credentials: application.credentials_data || {
          username: '',
          password: ''
        }
      });
    }
  }, [application, form]);

  // Handle form submission
  const onSubmit = (values: EditApplicationFormValues) => {
    // Format the when date if it exists
    if (values.when) {
      values.when = new Date(values.when).toISOString();
    }

    // Add selected expenses
    if (selectedExpenses.length > 0) {
      values.linked_expenses = selectedExpenses;
    }

    updateMutation.mutate(values);
  };

  // Handle document upload
  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setUploadingDocuments(true);
      uploadDocumentsMutation.mutate(files);
    }
  };

  // Handle admission letter upload
  const handleLetterUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadingLetter(true);

      // Create preview for PDF files
      if (file.type === 'application/pdf') {
        setLetterPreview(URL.createObjectURL(file));
      } else {
        setLetterPreview(null);
      }

      uploadLetterMutation.mutate(file);
    }
  };

  // Handle expense search
  const handleSearchExpenses = async () => {
    if (!expenseSearchQuery.trim() || !api) return;

    setSearchingExpenses(true);
    try {
      const response = await api.get<Expense[]>(
        `/admin/applications/${applicationId}/search_expenses/?query=${encodeURIComponent(expenseSearchQuery)}`
      );
      setExpenseSearchResults(response.data);
    } catch (error) {
      console.error('Error searching expenses:', error);
      toast.error('Failed to search expenses');
    } finally {
      setSearchingExpenses(false);
    }
  };

  // Handle creating payment for expense
  const handleCreatePayment = (expenseId: string) => {
    setCreatingPayment(true);
    setCreatingPaymentId(expenseId);
    createPaymentMutation.mutate(expenseId);

    // Add to selected expenses list
    setSelectedExpenses((prev) => [...prev, expenseId]);
  };

  // Handle removing payment (will be handled on form submit)
  const handleRemoveExpense = (expenseId: string) => {
    setSelectedExpenses((prev) => prev.filter((id) => id !== expenseId));
  };

  // Helper function to format dates
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'PPP');
  };

  if (isLoading) {
    return (
      <div className='container mx-auto py-6'>
        <div className='flex h-96 items-center justify-center'>
          <p>Loading application data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='container mx-auto py-6'>
        <div className='flex h-96 items-center justify-center'>
          <p className='text-red-500'>Error loading application data</p>
        </div>
      </div>
    );
  }

  return (
    <div className='container mx-auto py-6'>
      <div className='space-y-6'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold'>Edit Application</h1>
            <p className='text-muted-foreground'>
              {application?.student?.name} - {application?.university?.name}
            </p>
          </div>
          <div className='flex gap-2'>
            <Button
              variant='outline'
              onClick={() =>
                router.push(`/admin/applications/${applicationId}`)
              }
            >
              Cancel
            </Button>
            <Button
              variant='default'
              form='edit-application-form'
              type='submit'
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' /> Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </div>

        {/* Application Status Alert */}
        {application?.status === 'PENDING' && (
          <Alert>
            <AlertCircle className='h-4 w-4' />
            <AlertTitle>Important Notice</AlertTitle>
            <AlertDescription>
              When updating this application to &quot;Approved&quot; status, the
              system will automatically create fees and schedule notifications
              based on the &quot;when&quot; field.
            </AlertDescription>
          </Alert>
        )}

        {/* Form */}
        <Form {...form}>
          <form
            id='edit-application-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-6'
          >
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className='w-full'
            >
              <TabsList className='grid w-full grid-cols-5'>
                <TabsTrigger value='basic'>Basic Info</TabsTrigger>
                <TabsTrigger value='expenses'>Expenses</TabsTrigger>
                <TabsTrigger value='documents'>Documents</TabsTrigger>
                <TabsTrigger value='credentials'>Credentials</TabsTrigger>
                <TabsTrigger value='progress'>Progress</TabsTrigger>
              </TabsList>

              {/* Basic Info Tab */}
              <TabsContent value='basic' className='mt-6'>
                <Card>
                  <CardHeader>
                    <CardTitle>Application Status</CardTitle>
                    <CardDescription>
                      Update basic application information
                    </CardDescription>
                  </CardHeader>
                  <CardContent className='space-y-6'>
                    <div className='grid gap-6 md:grid-cols-2'>
                      <FormField
                        control={form.control}
                        name='status'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Status</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value ?? ''}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder='Select status' />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value='PENDING'>Pending</SelectItem>
                                <SelectItem value='APPROVED'>
                                  Approved
                                </SelectItem>
                                <SelectItem value='REJECTED'>
                                  Rejected
                                </SelectItem>
                                <SelectItem value='CANCELLED'>
                                  Cancelled
                                </SelectItem>
                                <SelectItem value='REVOKED'>Revoked</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name='when'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Schedule Time</FormLabel>
                            <FormControl>
                              <Input
                                type='datetime-local'
                                {...field}
                                value={field.value || ''}
                                onChange={(e) => field.onChange(e.target.value)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name='is_sent'
                      render={({ field }) => (
                        <FormItem className='flex items-center space-x-2'>
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className='cursor-pointer font-normal'>
                            Mark as sent to university
                          </FormLabel>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name='info'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Internal Notes</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder='Add internal notes about this application...'
                              rows={4}
                              value={field.value || ''}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Expenses Tab */}
              <TabsContent value='expenses' className='mt-6'>
                <Card>
                  <CardHeader>
                    <CardTitle>Manage Expenses & Payments</CardTitle>
                    <CardDescription>
                      Search for expenses and create payment records for this
                      application
                    </CardDescription>
                  </CardHeader>
                  <CardContent className='space-y-6'>
                    <Tabs value={expenseTab} onValueChange={setExpenseTab}>
                      <TabsList className='grid w-full grid-cols-3'>
                        <TabsTrigger value='search'>
                          Search Expenses
                        </TabsTrigger>
                        <TabsTrigger value='current'>
                          Current Payments
                        </TabsTrigger>
                        <TabsTrigger value='selected'>
                          Selected Expenses
                        </TabsTrigger>
                      </TabsList>

                      {/* Search Expenses Tab */}
                      <TabsContent value='search' className='space-y-4 pt-4'>
                        <div className='flex flex-col gap-2'>
                          <Label>Search for Expenses</Label>
                          <div className='flex gap-2'>
                            <div className='relative flex-1'>
                              <Search className='text-muted-foreground absolute top-1/2 left-2 h-4 w-4 -translate-y-1/2' />
                              <Input
                                placeholder='Search by name or description...'
                                value={expenseSearchQuery}
                                onChange={(e) =>
                                  setExpenseSearchQuery(e.target.value)
                                }
                                className='pl-8'
                                onKeyDown={(e) =>
                                  e.key === 'Enter' && handleSearchExpenses()
                                }
                              />
                            </div>
                            <Button
                              type='button'
                              variant='default'
                              onClick={handleSearchExpenses}
                              disabled={searchingExpenses}
                            >
                              {searchingExpenses ? (
                                <Loader2 className='h-4 w-4 animate-spin' />
                              ) : (
                                'Search'
                              )}
                            </Button>
                          </div>
                        </div>

                        {/* Search Results */}
                        {expenseSearchResults.length > 0 ? (
                          <div className='space-y-2'>
                            <div className='flex items-center justify-between'>
                              <h3 className='text-sm font-medium'>
                                Search Results
                              </h3>
                              <Badge variant='outline'>
                                {expenseSearchResults.length} results
                              </Badge>
                            </div>
                            <ScrollArea className='h-[calc(100vh-480px)] rounded-md border'>
                              <div className='p-1'>
                                {expenseSearchResults.map((expense) => (
                                  <div
                                    key={expense.id}
                                    className={`m-1 rounded-md p-3 ${
                                      expense.payment_exists ||
                                      selectedExpenses.includes(expense.id)
                                        ? 'bg-muted'
                                        : 'hover:bg-muted/50'
                                    }`}
                                  >
                                    <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
                                      <div>
                                        <div className='mb-1 flex items-center gap-2'>
                                          <Badge
                                            variant='outline'
                                            className={
                                              expense.type === 'general'
                                                ? 'bg-blue-100'
                                                : expense.type === 'country'
                                                  ? 'bg-green-100'
                                                  : expense.type ===
                                                      'university'
                                                    ? 'bg-purple-100'
                                                    : expense.type === 'course'
                                                      ? 'bg-orange-100'
                                                      : ''
                                            }
                                          >
                                            {expense.type.toUpperCase()}
                                          </Badge>
                                          <h3 className='max-w-[200px] truncate font-medium'>
                                            {expense.name}
                                          </h3>
                                        </div>
                                        <p className='text-muted-foreground mb-1 text-sm'>
                                          ${expense.amount.toFixed(2)}
                                        </p>
                                        {expense.description && (
                                          <p className='text-muted-foreground max-w-[300px] truncate text-xs'>
                                            {expense.description}
                                          </p>
                                        )}
                                      </div>
                                      <Button
                                        type='button'
                                        variant={
                                          expense.payment_exists ||
                                          selectedExpenses.includes(expense.id)
                                            ? 'outline'
                                            : 'default'
                                        }
                                        size='sm'
                                        onClick={() =>
                                          handleCreatePayment(expense.id)
                                        }
                                        disabled={
                                          expense.payment_exists ||
                                          selectedExpenses.includes(
                                            expense.id
                                          ) ||
                                          creatingPayment
                                        }
                                        className='whitespace-nowrap'
                                      >
                                        {creatingPaymentId === expense.id ? (
                                          <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                        ) : null}
                                        {expense.payment_exists ||
                                        selectedExpenses.includes(expense.id)
                                          ? 'Already Added'
                                          : 'Add Expense'}
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </ScrollArea>
                          </div>
                        ) : (
                          <div className='pt-4'>
                            {expenseSearchQuery && !searchingExpenses ? (
                              <Alert variant='default'>
                                <AlertCircle className='h-4 w-4' />
                                <AlertTitle>No results found</AlertTitle>
                                <AlertDescription>
                                  Try searching with different keywords
                                </AlertDescription>
                              </Alert>
                            ) : (
                              <div className='flex flex-col items-center justify-center py-8 text-center'>
                                <Search className='text-muted-foreground mb-4 h-10 w-10' />
                                <h3 className='mb-2 text-lg font-medium'>
                                  Search for Expenses
                                </h3>
                                <p className='text-muted-foreground max-w-sm text-sm'>
                                  Search for expenses by name or description to
                                  create payment records for this application
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </TabsContent>

                      {/* Current Payments Tab */}
                      <TabsContent value='current' className='space-y-4 pt-4'>
                        <div className='flex items-center justify-between'>
                          <h3 className='text-sm font-medium'>
                            Current Application Payments
                          </h3>
                          <Badge variant='outline'>
                            {application?.fees?.length || 0} payments
                          </Badge>
                        </div>
                        {application?.fees && application.fees.length > 0 ? (
                          <ScrollArea className='h-[calc(100vh-400px)]'>
                            <div className='space-y-2'>
                              {application.fees.map((fee) => (
                                <div
                                  key={fee.id}
                                  className='rounded-lg border p-4'
                                >
                                  <div className='mb-2 flex justify-between'>
                                    <Badge
                                      variant={
                                        fee.status === 'success'
                                          ? 'default'
                                          : 'secondary'
                                      }
                                      className='capitalize'
                                    >
                                      {fee.status}
                                    </Badge>
                                    <div>
                                      {fee.exp_id && (
                                        <Badge variant='outline'>
                                          {fee.exp_id.substring(0, 8)}...
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                  <div className='grid grid-cols-1 gap-2'>
                                    <div>
                                      <p className='text-sm font-medium'>
                                        {fee.name}
                                      </p>
                                      <p className='text-muted-foreground mt-1 text-sm'>
                                        Amount: ${fee.amount.toFixed(2)}
                                      </p>
                                      {fee.description && (
                                        <p className='text-muted-foreground mt-1 text-xs'>
                                          {fee.description}
                                        </p>
                                      )}
                                    </div>
                                    <div className='flex items-center justify-between pt-2'>
                                      <span className='text-muted-foreground text-xs'>
                                        Created: {formatDate(fee.created_at)}
                                      </span>
                                      {fee.exp_id && (
                                        <Button
                                          type='button'
                                          variant='outline'
                                          size='sm'
                                          onClick={() =>
                                            handleRemoveExpense(fee.exp_id)
                                          }
                                        >
                                          <Trash2 className='mr-1 h-3 w-3' />
                                          Remove
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </ScrollArea>
                        ) : (
                          <div className='flex flex-col items-center justify-center py-8 text-center'>
                            <AlertCircle className='text-muted-foreground mb-4 h-10 w-10' />
                            <h3 className='mb-2 text-lg font-medium'>
                              No payments found
                            </h3>
                            <p className='text-muted-foreground max-w-sm text-sm'>
                              This application doesn&apos;t have any payment
                              records yet. Search for expenses to create payment
                              records.
                            </p>
                          </div>
                        )}
                      </TabsContent>

                      {/* Selected Expenses Tab */}
                      <TabsContent value='selected' className='space-y-4 pt-4'>
                        <div className='flex items-center justify-between'>
                          <h3 className='text-sm font-medium'>
                            Selected Expenses
                          </h3>
                          <Badge variant='outline'>
                            {selectedExpenses.length} selected
                          </Badge>
                        </div>
                        {selectedExpenses.length > 0 ? (
                          <div className='space-y-2'>
                            <Alert>
                              <Info className='h-4 w-4' />
                              <AlertTitle>About Selected Expenses</AlertTitle>
                              <AlertDescription>
                                These expenses will be linked to the application
                                when you save changes. New payment records will
                                be created for any newly selected expenses.
                              </AlertDescription>
                            </Alert>
                            <div className='flex flex-wrap gap-2 pt-2'>
                              {selectedExpenses.map((expenseId) => {
                                // Find matched expense from search results or payments
                                const matchedExpense =
                                  expenseSearchResults.find(
                                    (e) => e.id === expenseId
                                  );
                                const matchedPayment = application?.fees?.find(
                                  (f) => f.exp_id === expenseId
                                );

                                if (!matchedExpense && !matchedPayment)
                                  return null;

                                return (
                                  <div
                                    key={expenseId}
                                    className='bg-muted flex items-center gap-2 rounded-full px-3 py-2'
                                  >
                                    <span className='max-w-[200px] truncate text-sm font-medium'>
                                      {matchedExpense?.name ||
                                        matchedPayment?.name ||
                                        expenseId}
                                    </span>
                                    <Button
                                      type='button'
                                      variant='ghost'
                                      size='icon'
                                      className='h-4 w-4 rounded-full'
                                      onClick={() =>
                                        handleRemoveExpense(expenseId)
                                      }
                                    >
                                      <XCircle className='h-3 w-3' />
                                    </Button>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ) : (
                          <div className='flex flex-col items-center justify-center py-8 text-center'>
                            <Info className='text-muted-foreground mb-4 h-10 w-10' />
                            <h3 className='mb-2 text-lg font-medium'>
                              No expenses selected
                            </h3>
                            <p className='text-muted-foreground max-w-sm text-sm'>
                              Search for expenses and add them to this
                              application
                            </p>
                          </div>
                        )}
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Documents Tab */}
              <TabsContent value='documents' className='mt-6'>
                <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
                  <Card>
                    <CardHeader>
                      <CardTitle>Admission Letter</CardTitle>
                      <CardDescription>
                        Upload an admission letter for this application
                      </CardDescription>
                    </CardHeader>
                    <CardContent className='space-y-4'>
                      {application?.admission_letter ? (
                        <div className='space-y-4'>
                          <div className='flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-4'>
                            <div className='mb-2 flex items-center gap-2'>
                              <FileText className='h-5 w-5 text-blue-500' />
                              <span className='font-medium'>
                                Current Admission Letter
                              </span>
                            </div>
                            <a
                              href={application.admission_letter.url}
                              target='_blank'
                              rel='noopener noreferrer'
                              className='text-sm text-blue-500 hover:underline'
                            >
                              View Letter
                            </a>
                            <p className='text-muted-foreground mt-2 text-xs'>
                              Uploaded on{' '}
                              {formatDate(
                                application.admission_letter.created_at
                              )}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className='flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8'>
                          <FileText className='text-muted-foreground mb-2 h-10 w-10' />
                          <p className='text-muted-foreground text-sm'>
                            No admission letter uploaded
                          </p>
                        </div>
                      )}

                      <div className='space-y-2'>
                        <Label htmlFor='admission-letter'>
                          Upload New Admission Letter
                        </Label>
                        <div className='flex items-center gap-4'>
                          <Input
                            id='admission-letter'
                            type='file'
                            onChange={handleLetterUpload}
                            disabled={uploadingLetter}
                            accept='.pdf,.doc,.docx,.jpg,.png'
                            className='flex-1'
                          />
                          {uploadingLetter && (
                            <Loader2 className='h-4 w-4 animate-spin' />
                          )}
                        </div>
                        <p className='text-muted-foreground text-xs'>
                          Accepted formats: PDF, DOC, DOCX, JPG, PNG
                        </p>
                      </div>

                      {letterPreview && (
                        <div className='rounded-lg border p-2'>
                          <iframe
                            src={letterPreview}
                            className='h-64 w-full'
                            title='Admission Letter Preview'
                          />
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Additional Documents</CardTitle>
                      <CardDescription>
                        Upload additional documents for this application
                      </CardDescription>
                    </CardHeader>
                    <CardContent className='space-y-4'>
                      {application?.documents &&
                      application.documents.length > 0 ? (
                        <div className='mb-4 space-y-2'>
                          <h3 className='text-sm font-medium'>
                            Current Documents
                          </h3>
                          <ScrollArea className='h-48 pr-4'>
                            <div className='space-y-2'>
                              {application.documents.map(
                                (doc: ApplicationDocument) => (
                                  <div
                                    key={doc.id}
                                    className='flex items-center justify-between rounded-lg border p-3'
                                  >
                                    <div className='flex items-center gap-2'>
                                      <FileText className='h-4 w-4 text-blue-500' />
                                      <a
                                        href={doc.url}
                                        target='_blank'
                                        rel='noopener noreferrer'
                                        className='text-sm text-blue-500 hover:underline'
                                      >
                                        View Document
                                      </a>
                                    </div>
                                    <span className='text-muted-foreground text-xs'>
                                      {formatDate(doc.created_at)}
                                    </span>
                                  </div>
                                )
                              )}
                            </div>
                          </ScrollArea>
                        </div>
                      ) : (
                        <div className='flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8'>
                          <FilePlus className='text-muted-foreground mb-2 h-10 w-10' />
                          <p className='text-muted-foreground text-sm'>
                            No additional documents uploaded
                          </p>
                        </div>
                      )}

                      <div className='space-y-2'>
                        <Label htmlFor='additional-docs'>
                          Upload New Documents
                        </Label>
                        <div className='flex items-center gap-4'>
                          <Input
                            id='additional-docs'
                            type='file'
                            multiple
                            onChange={handleDocumentUpload}
                            disabled={uploadingDocuments}
                            accept='.pdf,.doc,.docx,.jpg,.png'
                            className='flex-1'
                          />
                          {uploadingDocuments && (
                            <Loader2 className='h-4 w-4 animate-spin' />
                          )}
                        </div>
                        <p className='text-muted-foreground text-xs'>
                          Accepted formats: PDF, DOC, DOCX, JPG, PNG. You can
                          select multiple files.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Credentials Tab */}
              <TabsContent value='credentials' className='mt-6'>
                <Card>
                  <CardHeader>
                    <CardTitle>Application Portal Credentials</CardTitle>
                    <CardDescription>
                      Set or update login credentials for the university
                      application portal
                    </CardDescription>
                  </CardHeader>
                  <CardContent className='space-y-6'>
                    <div className='grid gap-6 md:grid-cols-2'>
                      <FormField
                        control={form.control}
                        name='credentials.username'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder='Enter username'
                                value={field.value || ''}
                              />
                            </FormControl>
                            <FormMessage />
                            <p className='text-muted-foreground text-xs'>
                              Username for the university application portal
                            </p>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name='credentials.password'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input
                                type='password'
                                {...field}
                                placeholder='Enter password'
                                value={field.value || ''}
                              />
                            </FormControl>
                            <FormMessage />
                            <p className='text-muted-foreground text-xs'>
                              Password for the university application portal
                            </p>
                          </FormItem>
                        )}
                      />
                    </div>

                    {application?.credentials_data && (
                      <Alert>
                        <AlertCircle className='h-4 w-4' />
                        <AlertTitle>Current Credentials</AlertTitle>
                        <AlertDescription>
                          <p>
                            <strong>Username:</strong>{' '}
                            {application.credentials_data.username}
                          </p>
                          <p>
                            <strong>Password:</strong>{' '}
                            {application.credentials_data.password}
                          </p>
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Progress Tab */}
              <TabsContent value='progress' className='mt-6'>
                <div className='space-y-6'>
                  <Card>
                    <CardHeader>
                      <CardTitle>University Application Progress</CardTitle>
                      <CardDescription>
                        Update the application progress and share information
                        with the student
                      </CardDescription>
                    </CardHeader>
                    <CardContent className='space-y-6'>
                      <FormField
                        control={form.control}
                        name='progress_status'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Progress Status</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value || ''}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder='Select status' />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value='PENDING'>
                                  <div className='flex items-center'>
                                    <Clock className='mr-2 h-4 w-4' />
                                    Pending
                                  </div>
                                </SelectItem>
                                <SelectItem value='SUCCESS'>
                                  <div className='flex items-center'>
                                    <CheckCircle className='mr-2 h-4 w-4 text-green-500' />
                                    Accepted
                                  </div>
                                </SelectItem>
                                <SelectItem value='REJECTED'>
                                  <div className='flex items-center'>
                                    <XCircle className='mr-2 h-4 w-4 text-red-500' />
                                    Rejected
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                            <p className='text-muted-foreground text-xs'>
                              This represents the university&apos;s decision on
                              the application
                            </p>
                          </FormItem>
                        )}
                      />

                      {application?.progress && (
                        <Alert>
                          <Info className='h-4 w-4' />
                          <AlertTitle>Current Progress Status</AlertTitle>
                          <AlertDescription>
                            <p>
                              <strong>Status:</strong>{' '}
                              {application.progress.status}
                            </p>
                            <p>
                              <strong>Last Updated:</strong>{' '}
                              {formatDate(application.progress.created_at)}
                            </p>
                          </AlertDescription>
                        </Alert>
                      )}

                      <Separator />

                      <div className='space-y-2'>
                        <h3 className='text-sm font-medium'>
                          Information for Student
                        </h3>
                        <p className='text-muted-foreground text-xs'>
                          Add information that will be visible to the student
                          and included in the application history
                        </p>
                      </div>

                      <FormField
                        control={form.control}
                        name='new_information'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Add New Information</FormLabel>
                            <FormControl>
                              <Textarea
                                {...field}
                                placeholder='Add information for the student...'
                                rows={4}
                                value={field.value || ''}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {application?.information &&
                        application.information.length > 0 && (
                          <div className='space-y-2'>
                            <h3 className='text-sm font-medium'>
                              Previous Information Updates
                            </h3>
                            <ScrollArea className='h-48 pr-4'>
                              <div className='space-y-2'>
                                {application.information
                                  .sort(
                                    (a: ApplicationInfo, b: ApplicationInfo) =>
                                      new Date(b.created_at).getTime() -
                                      new Date(a.created_at).getTime()
                                  )
                                  .map((info: ApplicationInfo) => (
                                    <div
                                      key={info.id}
                                      className='rounded-lg border p-3'
                                    >
                                      <div className='mb-1 flex items-center justify-between'>
                                        <span className='text-muted-foreground text-xs'>
                                          {formatDate(info.created_at)}
                                        </span>
                                      </div>
                                      <p className='text-sm'>{info.info}</p>
                                    </div>
                                  ))}
                              </div>
                            </ScrollArea>
                          </div>
                        )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </form>
        </Form>
      </div>
    </div>
  );
}
