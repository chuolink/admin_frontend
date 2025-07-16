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
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  FileText,
  CheckCircle,
  XCircle,
  Upload,
  Send,
  DollarSign,
  Eye,
  EyeOff,
  AlertCircle,
  Clock,
  Mail,
  Phone,
  Calendar,
  User,
  Loader2,
  Info,
  Globe,
  Link
} from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Response } from '@/types/consultant';
import { Label } from '@/components/ui/label';

// Add these types
interface ExtraDocument {
  id: string;
  name: string;
  document: string;
  created_at: string;
  updated_at: string;
}

interface ApplicationInfo {
  id: string;
  info: string;
  created_at: string;
  updated_at: string;
}

interface ApplicationCredentials {
  id: string;
  username: string;
  password: string;
}

interface ApplicationPayment {
  id: string;
  amount: number;
  gepg: string;
  status: 'pending' | 'success' | 'failed' | 'cancelled';
  created_at: string;
}

interface ApplicationProof {
  id: string;
  proof: string;
  created_at: string;
  updated_at: string;
  application: string;
}

interface PaymentResponse {
  id: string;
  application: string;
  gepg: string;
  status: 'pending' | 'success' | 'failed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

// Update the form schema
const editApplicationSchema = z.object({
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'WAITING', 'COMPLETED']),
  info: z.string().optional(),
  credentials: z.object({
    username: z.string().min(1, 'Username is required'),
    password: z.string().min(1, 'Password is required')
  }),
  payment: z
    .object({
      gepg: z.string().min(1, 'GEPG reference is required')
    })
    .optional()
});

type EditApplicationFormValues = z.infer<typeof editApplicationSchema>;

// Update the ConsultantApplication type
interface ConsultantApplication {
  id: string;
  application: {
    id: string;

    student: {
      id: string;
      name: string;
      email: string;
      phone: string;
      created_at: string;
      user: {
        first_name: string;
        middle_name: string;
        last_name: string;
        email: string;
        phone_number: string;
        birth_date: string;
      };
      education_level: string;
    };
    university: {
      id: string;
      name: string;
      country: {
        name: string;
      };
      website_link: string;
      admission_link: string;
    };
    courses: {
      id: string;
      name: string;
      duration: string;
    }[];
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'WAITING' | 'SUCCESS';
    budget: number | null;
    created_at: string;
    updated_at: string;
    credentials?: ApplicationCredentials;
    payments?: ApplicationPayment[];
    infos?: ApplicationInfo[];
    extra_documents?: ExtraDocument[];
    expenses: {
      course: {
        id: string;
        uni_course: string;
        start_amount: number;
      }[];
    };
    // REMOVE results from here
  };
  // ADD results at the top level
  results?: {
    o_level_result?: {
      school: string;
      division: string;
      points: number | null;
      reg_no?: string;
    };
    o_level_grades?: {
      id: string;
      subject: {
        id: string;
        name: string;
      };
      grade: {
        id: string;
        grade: string;
      };
    }[];
    a_level_result?: {
      school: string;
      division: string;
      points: number | null;
      reg_no?: string;
    };
    a_level_grades?: {
      id: string;
      subject: {
        id: string;
        name: string;
      };
      grade: {
        id: string;
        grade: string;
      };
    }[];
  };
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'WAITING' | 'COMPLETED';
  created_at: string;
  updated_at: string;
  proofs?: ApplicationProof[];
}

export default function EditApplicationPage() {
  const router = useRouter();
  const params = useParams();
  const { api } = useClientApi();
  const applicationId = params.id as string;
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState('basic');
  const [uploadingDocuments, setUploadingDocuments] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [proofFiles, setProofFiles] = useState<File[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

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
      status: 'PENDING',
      info: '',
      credentials: {
        username: '',
        password: ''
      },
      payment: {
        gepg: ''
      }
    }
  });

  // Fetch application data
  const {
    data: application,
    isLoading,
    error
  } = useQuery<ConsultantApplication>({
    queryKey: ['consultant-application', applicationId],
    queryFn: async () => {
      if (!api) {
        console.error('API not initialized - user might not be authenticated');
        throw new Error('API not initialized');
      }
      try {
        console.log('Fetching application with ID:', applicationId);
        const response = await api.get(
          `/consultant/application/${applicationId}/`
        );
        console.log('Application data:', response.data);
        return response.data;
      } catch (error) {
        console.error('Error fetching application:', error);
        throw error;
      }
    },
    enabled: !!applicationId && !!api,
    retry: false
  });

  // Update application mutation
  const updateMutation = useMutation({
    mutationFn: async (data: EditApplicationFormValues) => {
      if (!api) throw new Error('API not initialized');
      await api.patch(`/consultant/application/${applicationId}/`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['consultant-application', applicationId]
      });
      toast.success('Application updated successfully');
    },
    onError: () => {
      toast.error('Failed to update application');
    }
  });

  // Upload document mutation
  const uploadDocumentMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!api) throw new Error('API not initialized');
      if (!application?.application?.id)
        throw new Error('Application ID not found');
      const formData = new FormData();
      formData.append('document', file);
      formData.append('name', file.name);
      formData.append('application', application.application.id);
      await api.post(`/consultant/application/extra_documents/`, formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['consultant-application', applicationId]
      });
      toast.success('Document uploaded successfully');
      setSelectedFile(null);
    },
    onError: () => {
      toast.error('Failed to upload document');
    }
  });

  // Add information mutation
  const addInfoMutation = useMutation({
    mutationFn: async (info: string) => {
      if (!api) throw new Error('API not initialized');
      if (!application?.application?.id)
        throw new Error('Application ID not found');
      await api.post(`/consultant/application/info/`, {
        application: application.application.id,
        info
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['consultant-application', applicationId]
      });
      toast.success('Information added successfully');
      form.setValue('info', '');
    },
    onError: () => {
      toast.error('Failed to add information');
    }
  });

  // Add credentials mutation
  const addCredentialsMutation = useMutation({
    mutationFn: async (credentials: { username: string; password: string }) => {
      if (!api) throw new Error('API not initialized');
      if (!application?.application?.id)
        throw new Error('Application ID not found');
      await api.post(`/consultant/application/credentials/`, {
        application: application.application.id,
        ...credentials
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['consultant-application', applicationId]
      });
      queryClient.invalidateQueries({
        queryKey: ['credentials', application?.application?.id]
      });
      toast.success('Credentials added successfully');
      form.setValue('credentials', { username: '', password: '' });
    },
    onError: () => {
      toast.error('Failed to add credentials');
    }
  });

  // Add payment mutation
  const addPaymentMutation = useMutation({
    mutationFn: async (data: { gepg: string }) => {
      if (!api) throw new Error('API not initialized');
      await api.post(`/consultant/application/payment/`, {
        application: application?.application?.id,
        gepg: data.gepg
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['consultant-application', applicationId]
      });
      queryClient.invalidateQueries({
        queryKey: ['payment-history', application?.application?.id]
      });
      toast.success('Payment submitted successfully');
      form.setValue('payment', { gepg: '' });
    },
    onError: () => {
      toast.error('Failed to submit payment');
    }
  });

  // Add final submission mutation
  const submitApplicationMutation = useMutation({
    mutationFn: async () => {
      if (!api) throw new Error('API not initialized');
      const formData = new FormData();
      formData.append('status', 'WAITING');
      proofFiles.forEach((file) => {
        formData.append('proofs', file);
      });
      await api.patch(`/consultant/application/${applicationId}/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['consultant-application', applicationId]
      });
      toast.success('Application submitted successfully');
      router.push(`/consultant/applications/${applicationId}/edit`);
    },
    onError: (error: any) => {
      if (error.response?.data?.proofs) {
        toast.error('Please upload proof documents');
      } else {
        toast.error('Failed to submit application');
      }
    }
  });

  // Add payment history query
  const { data: paymentHistory } = useQuery<{ results: PaymentResponse[] }>({
    queryKey: ['payment-history', application?.application?.id],
    queryFn: async () => {
      if (!api) throw new Error('API not initialized');
      const response = await api.get(`/consultant/application/payment/`, {
        params: {
          application: application?.application?.id
        }
      });
      return response.data as Response<PaymentResponse>;
    },
    enabled: !!application?.application?.id && !!api
  });

  // Add payment edit mutation
  const editPaymentMutation = useMutation({
    mutationFn: async ({ id, gepg }: { id: string; gepg: string }) => {
      if (!api) throw new Error('API not initialized');
      await api.patch(`/consultant/application/payment/${id}/`, { gepg });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['payment-history', application?.application?.id]
      });
      toast.success('Payment updated successfully');
    },
    onError: () => {
      toast.error('Failed to update payment');
    }
  });

  // Add credentials query
  const { data: credentialsData } = useQuery<{
    results: ApplicationCredentials[];
  }>({
    queryKey: ['credentials', application?.application?.id],
    queryFn: async () => {
      if (!api) throw new Error('API not initialized');
      const response = await api.get(`/consultant/application/credentials/`, {
        params: {
          application: application?.application?.id
        }
      });
      return response.data as Response<ApplicationCredentials>;
    },
    enabled: !!application?.application?.id && !!api
  });

  // Add credentials edit mutation
  const editCredentialsMutation = useMutation({
    mutationFn: async ({
      id,
      username,
      password
    }: {
      id: string;
      username: string;
      password: string;
    }) => {
      if (!api) throw new Error('API not initialized');
      await api.patch(`/consultant/application/credentials/${id}/`, {
        username,
        password
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['credentials', application?.application?.id]
      });
      toast.success('Credentials updated successfully');
    },
    onError: () => {
      toast.error('Failed to update credentials');
    }
  });

  const onSubmit = (data: EditApplicationFormValues) => {
    updateMutation.mutate(data);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleProofFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setProofFiles((prev) => [...prev, ...files]);
  };

  const removeProofFile = (index: number) => {
    setProofFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFileUpload = () => {
    if (selectedFile) {
      uploadDocumentMutation.mutate(selectedFile);
    }
  };

  const handleAddInfo = () => {
    const info = form.getValues('info');
    if (info) {
      addInfoMutation.mutate(info);
    }
  };

  const handleAddCredentials = () => {
    const credentials = form.getValues('credentials');
    if (credentials.username && credentials.password) {
      addCredentialsMutation.mutate({
        username: credentials.username,
        password: credentials.password
      });
    }
  };

  const handleAddPayment = () => {
    const payment = form.getValues('payment');
    if (payment?.gepg) {
      addPaymentMutation.mutate({
        gepg: payment.gepg
      });
    }
  };

  const handleFinalSubmit = () => {
    if (!application?.application?.credentials) {
      toast.error('Please add credentials before submitting');
      return;
    }

    const payment = paymentHistory?.results?.find(
      (p) => p.status === 'success'
    );
    if (!payment) {
      toast.error('Please wait for payment approval before submitting');
      return;
    }

    if (proofFiles.length === 0) {
      toast.error('Please upload proof documents');
      return;
    }

    if (
      window.confirm(
        'Are you sure you want to submit this application? You will not be able to edit it again.'
      )
    ) {
      submitApplicationMutation.mutate();
    }
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
          <div className='text-center'>
            <p className='mb-4 text-red-500'>Error loading application data</p>
            <p className='text-muted-foreground mb-4 text-sm'>
              {error instanceof Error
                ? error.message
                : 'Unknown error occurred'}
            </p>
            <Button
              variant='outline'
              onClick={() => router.push('/consultant/applications')}
            >
              Back to Applications
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='flex h-screen flex-col'>
      <div className='flex-1 overflow-y-auto'>
        <div className='container mx-auto py-6 pb-24'>
          <div className='space-y-6'>
            {/* Header */}
            <div className='flex items-center justify-between'>
              <div>
                <h1 className='text-3xl font-bold'>Edit Application</h1>
                <p className='text-muted-foreground'>
                  {application?.application?.student?.user?.first_name}{' '}
                  {application?.application?.student?.user?.last_name} -{' '}
                  {application?.application?.university?.name}
                </p>
              </div>
              <div className='flex gap-2'>
                <Button
                  variant='outline'
                  onClick={() => router.push(`/consultant/applications`)}
                >
                  Back
                </Button>
                {/* <Button
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
            </Button> */}
              </div>
            </div>

            {/* Application Status Alert */}
            {application?.status === 'PENDING' && (
              <Alert className='border-yellow-500/20 bg-yellow-500/5'>
                <AlertCircle className='h-4 w-4 text-yellow-500' />
                <AlertTitle className='text-yellow-500'>
                  Application Pending Review
                </AlertTitle>
                <AlertDescription className='space-y-4'>
                  <p>
                    This application is pending your review. Please review the
                    application details and either approve or reject it. Once
                    approved, you can start working on the application by
                    uploading documents, adding information, and managing
                    credentials.
                  </p>
                  <div className='flex items-center gap-2 text-sm text-yellow-500'>
                    <Clock className='h-4 w-4' />
                    <span>
                      This application will expire in{' '}
                      {(() => {
                        const createdAt = new Date(application.created_at);
                        const expiresAt = new Date(
                          createdAt.getTime() + 24 * 60 * 60 * 1000
                        );
                        const now = new Date();
                        const diff = expiresAt.getTime() - now.getTime();
                        const hours = Math.floor(diff / (1000 * 60 * 60));
                        const minutes = Math.floor(
                          (diff % (1000 * 60 * 60)) / (1000 * 60)
                        );
                        return `${hours}h ${minutes}m`;
                      })()}{' '}
                      and will be automatically rejected if not reviewed.
                    </span>
                  </div>
                  <div className='flex gap-4'>
                    <Button
                      variant='default'
                      onClick={() => {
                        if (
                          window.confirm(
                            'Are you sure you want to approve this application?'
                          )
                        ) {
                          updateMutation.mutate({
                            status: 'APPROVED',
                            credentials: {
                              username: '',
                              password: ''
                            }
                          });
                        }
                      }}
                      disabled={updateMutation.isPending}
                    >
                      {updateMutation.isPending ? (
                        <>
                          <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CheckCircle className='mr-2 h-4 w-4' />
                          Approve Application
                        </>
                      )}
                    </Button>
                    <Button
                      variant='destructive'
                      onClick={() => {
                        if (
                          window.confirm(
                            'Are you sure you want to reject this application?'
                          )
                        ) {
                          updateMutation.mutate({
                            status: 'REJECTED',
                            credentials: {
                              username: '',
                              password: ''
                            }
                          });
                        }
                      }}
                      disabled={updateMutation.isPending}
                    >
                      {updateMutation.isPending ? (
                        <>
                          <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                          Processing...
                        </>
                      ) : (
                        <>
                          <XCircle className='mr-2 h-4 w-4' />
                          Reject Application
                        </>
                      )}
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {application?.status === 'WAITING' && (
              <Alert className='border-green-500/20 bg-green-500/5'>
                <CheckCircle className='h-4 w-4 text-green-500' />
                <AlertTitle className='text-green-500'>
                  Application Submitted Successfully!
                </AlertTitle>
                <AlertDescription className='space-y-4'>
                  <p>
                    Your application has been received successfully and is now
                    being reviewed by the administration. Once reviewed and
                    approved, you will be able to earn from this application.
                  </p>
                  <div className='text-muted-foreground flex items-center gap-2 text-sm'>
                    <Clock className='h-4 w-4' />
                    <span>
                      Submitted on {formatDate(application.updated_at)}
                    </span>
                  </div>
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
                    <TabsTrigger
                      value='information'
                      disabled={
                        application?.status !== 'APPROVED' &&
                        application?.status !== 'WAITING' &&
                        application?.status !== 'COMPLETED'
                      }
                    >
                      Information
                    </TabsTrigger>
                    <TabsTrigger
                      value='documents'
                      disabled={
                        application?.status !== 'APPROVED' &&
                        application?.status !== 'WAITING' &&
                        application?.status !== 'COMPLETED'
                      }
                    >
                      Extra Documents
                    </TabsTrigger>
                    <TabsTrigger
                      value='payment'
                      disabled={
                        application?.status !== 'APPROVED' &&
                        application?.status !== 'WAITING' &&
                        application?.status !== 'COMPLETED'
                      }
                    >
                      Payment
                    </TabsTrigger>
                    <TabsTrigger
                      value='credentials'
                      disabled={
                        application?.status !== 'APPROVED' &&
                        application?.status !== 'WAITING' &&
                        application?.status !== 'COMPLETED'
                      }
                    >
                      Credentials
                    </TabsTrigger>
                  </TabsList>

                  {/* Basic Info Tab */}
                  <TabsContent value='basic' className='mt-6'>
                    <div className='space-y-6'>
                      {/* Student Information Card */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Student Information</CardTitle>
                          <CardDescription>
                            Details about the student applying
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className='grid gap-6 md:grid-cols-2'>
                            <div className='space-y-4'>
                              <div className='flex items-center gap-2'>
                                <User className='text-muted-foreground h-4 w-4' />
                                <div>
                                  <p className='text-sm font-medium'>
                                    Full Name
                                  </p>
                                  <p className='text-muted-foreground text-sm'>
                                    {
                                      application?.application?.student?.user
                                        ?.first_name
                                    }{' '}
                                    {
                                      application?.application?.student?.user
                                        ?.middle_name
                                    }{' '}
                                    {
                                      application?.application?.student?.user
                                        ?.last_name
                                    }
                                  </p>
                                </div>
                              </div>
                              <div className='flex items-center gap-2'>
                                <Mail className='text-muted-foreground h-4 w-4' />
                                <div>
                                  <p className='text-sm font-medium'>Email</p>
                                  <p className='text-muted-foreground text-sm'>
                                    {
                                      application?.application?.student?.user
                                        ?.email
                                    }
                                  </p>
                                </div>
                              </div>
                              <div className='flex items-center gap-2'>
                                <Phone className='text-muted-foreground h-4 w-4' />
                                <div>
                                  <p className='text-sm font-medium'>Phone</p>
                                  <p className='text-muted-foreground text-sm'>
                                    {application?.application?.student?.user
                                      ?.phone_number || 'Not provided'}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className='space-y-4'>
                              <div className='flex items-center gap-2'>
                                <FileText className='text-muted-foreground h-4 w-4' />
                                <div>
                                  <p className='text-sm font-medium'>
                                    Education Level
                                  </p>
                                  <p className='text-muted-foreground text-sm'>
                                    {application?.application?.student
                                      ?.education_level || 'Not provided'}
                                  </p>
                                </div>
                              </div>
                              <div className='flex items-center gap-2'>
                                <Calendar className='text-muted-foreground h-4 w-4' />
                                <div>
                                  <p className='text-sm font-medium'>
                                    Application Date
                                  </p>
                                  <p className='text-muted-foreground text-sm'>
                                    {application?.application?.created_at
                                      ? formatDate(
                                          application.application.created_at
                                        )
                                      : 'N/A'}
                                  </p>
                                </div>
                              </div>
                              <div className='flex items-center gap-2'>
                                <Clock className='text-muted-foreground h-4 w-4' />
                                <div>
                                  <p className='text-sm font-medium'>
                                    Last Updated
                                  </p>
                                  <p className='text-muted-foreground text-sm'>
                                    {application?.application?.updated_at
                                      ? formatDate(
                                          application.application.updated_at
                                        )
                                      : 'N/A'}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* University Information Card */}
                      <Card>
                        <CardHeader>
                          <CardTitle>University Information</CardTitle>
                          <CardDescription>
                            Details about the university being applied to
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className='space-y-4'>
                            <div className='flex items-center gap-2'>
                              <FileText className='text-muted-foreground h-4 w-4' />
                              <div>
                                <p className='text-sm font-medium'>
                                  University Name
                                </p>
                                <p className='text-muted-foreground text-sm'>
                                  {application?.application?.university?.name}
                                </p>
                              </div>
                            </div>
                            <div className='flex items-center gap-2'>
                              <Globe className='text-muted-foreground h-4 w-4' />
                              <div>
                                <p className='text-sm font-medium'>Country</p>
                                <p className='text-muted-foreground text-sm'>
                                  {
                                    application?.application?.university
                                      ?.country?.name
                                  }
                                </p>
                              </div>
                            </div>
                            <div className='flex items-center gap-2'>
                              <Link className='text-muted-foreground h-4 w-4' />
                              <div>
                                <p className='text-sm font-medium'>Website</p>
                                <a
                                  href={
                                    application?.application?.university
                                      ?.website_link
                                  }
                                  target='_blank'
                                  rel='noopener noreferrer'
                                  className='text-sm text-blue-600 hover:underline'
                                >
                                  {
                                    application?.application?.university
                                      ?.website_link
                                  }
                                </a>
                              </div>
                            </div>
                            <div className='flex items-center gap-2'>
                              <Link className='text-muted-foreground h-4 w-4' />
                              <div>
                                <p className='text-sm font-medium'>
                                  Admission Link
                                </p>
                                <a
                                  href={
                                    application?.application?.university
                                      ?.admission_link
                                  }
                                  target='_blank'
                                  rel='noopener noreferrer'
                                  className='text-sm text-blue-600 hover:underline'
                                >
                                  {application?.application?.university
                                    ?.admission_link || 'Not provided'}
                                </a>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Courses Information Card */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Selected Courses</CardTitle>
                          <CardDescription>
                            Courses the student is applying for
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className='space-y-4'>
                            {application?.application?.courses?.map(
                              (course, index) => (
                                <div
                                  key={course.id}
                                  className='rounded-lg border p-4'
                                >
                                  <div className='flex items-center justify-between'>
                                    <div className='space-y-1'>
                                      <div className='flex items-center gap-2'>
                                        <p className='font-medium'>
                                          {course.name}
                                        </p>
                                        <Badge variant='outline'>
                                          {index === 0
                                            ? 'First Choice'
                                            : index === 1
                                              ? 'Second Choice'
                                              : 'Third Choice'}
                                        </Badge>
                                      </div>
                                      <p className='text-muted-foreground text-sm'>
                                        Duration: {course.duration} years
                                      </p>
                                    </div>
                                    <div className='text-right'>
                                      <p className='text-sm font-medium'>
                                        Tuition Fee
                                      </p>
                                      <p className='text-muted-foreground text-sm'>
                                        {formatCurrency(
                                          application?.application?.expenses?.course?.find(
                                            (exp) =>
                                              exp.uni_course === course.id
                                          )?.start_amount || 0
                                        )}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Results Section */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Student Results</CardTitle>
                          <CardDescription>
                            O-Level and A-Level academic results
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          {/* O-Level Results */}
                          <div className='mb-6'>
                            <h3 className='mb-2 font-semibold'>
                              O-Level Results
                            </h3>
                            {application?.results?.o_level_result ? (
                              <>
                                <div className='mb-2'>
                                  <span className='font-medium'>School:</span>{' '}
                                  {application.results.o_level_result.school ||
                                    'N/A'}
                                </div>
                                <div className='mb-2'>
                                  <span className='font-medium'>
                                    Registration No:
                                  </span>{' '}
                                  {application.results.o_level_result.reg_no ||
                                    'N/A'}
                                </div>
                                <div className='mb-2'>
                                  <span className='font-medium'>Division:</span>{' '}
                                  {application.results.o_level_result
                                    .division || 'N/A'}
                                </div>
                                <div className='mb-2'>
                                  <span className='font-medium'>Points:</span>{' '}
                                  {application.results.o_level_result.points ??
                                    'N/A'}
                                </div>
                                <div>
                                  <span className='font-medium'>
                                    Subjects & Grades:
                                  </span>
                                  <ul className='ml-6 list-disc'>
                                    {application.results.o_level_grades?.map(
                                      (grade: any) => (
                                        <li key={grade.id}>
                                          {grade.subject?.name}:{' '}
                                          {grade.grade?.grade}
                                        </li>
                                      )
                                    )}
                                  </ul>
                                </div>
                              </>
                            ) : (
                              <p className='text-muted-foreground text-sm'>
                                No O-Level results available.
                              </p>
                            )}
                          </div>
                          {/* A-Level Results */}
                          <div>
                            <h3 className='mb-2 font-semibold'>
                              A-Level Results
                            </h3>
                            {application?.results?.a_level_result ? (
                              <>
                                <div className='mb-2'>
                                  <span className='font-medium'>School:</span>{' '}
                                  {application.results.a_level_result.school ||
                                    'N/A'}
                                </div>
                                <div className='mb-2'>
                                  <span className='font-medium'>
                                    Registration No:
                                  </span>{' '}
                                  {application.results.a_level_result.reg_no ||
                                    'N/A'}
                                </div>
                                <div className='mb-2'>
                                  <span className='font-medium'>Division:</span>{' '}
                                  {application.results.a_level_result
                                    .division || 'N/A'}
                                </div>
                                <div className='mb-2'>
                                  <span className='font-medium'>Points:</span>{' '}
                                  {application.results.a_level_result.points ??
                                    'N/A'}
                                </div>
                                <div>
                                  <span className='font-medium'>
                                    Subjects & Grades:
                                  </span>
                                  <ul className='ml-6 list-disc'>
                                    {application.results.a_level_grades?.map(
                                      (grade: any) => (
                                        <li key={grade.id}>
                                          {grade.subject?.name}:{' '}
                                          {grade.grade?.grade}
                                        </li>
                                      )
                                    )}
                                  </ul>
                                </div>
                              </>
                            ) : (
                              <p className='text-muted-foreground text-sm'>
                                No A-Level results available.
                              </p>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  {/* Documents Tab */}
                  <TabsContent value='documents' className='mt-6'>
                    <Card>
                      <CardHeader>
                        <CardTitle>Upload Documents</CardTitle>
                        <CardDescription>
                          {application?.status === 'WAITING' ||
                          application?.status === 'COMPLETED'
                            ? 'View uploaded documents for this application'
                            : 'Upload additional documents for this application'}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className='space-y-6'>
                        {application?.status !== 'WAITING' &&
                          application?.status !== 'COMPLETED' && (
                            <div className='space-y-4'>
                              <div className='flex items-center gap-4'>
                                <Input
                                  type='file'
                                  onChange={handleFileChange}
                                  disabled={uploadDocumentMutation.isPending}
                                  accept='image/*,.pdf'
                                />
                                <Button
                                  onClick={handleFileUpload}
                                  disabled={
                                    !selectedFile ||
                                    uploadDocumentMutation.isPending
                                  }
                                >
                                  {uploadDocumentMutation.isPending ? (
                                    <>
                                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                      Uploading...
                                    </>
                                  ) : (
                                    <>
                                      <Upload className='mr-2 h-4 w-4' />
                                      Upload
                                    </>
                                  )}
                                </Button>
                              </div>

                              {selectedFile && (
                                <div className='rounded-lg border p-4'>
                                  <div className='flex items-start gap-3'>
                                    {selectedFile.type.startsWith('image/') ? (
                                      <div className='relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border'>
                                        <img
                                          src={URL.createObjectURL(
                                            selectedFile
                                          )}
                                          alt={selectedFile.name}
                                          className='h-full w-full object-cover'
                                        />
                                      </div>
                                    ) : (
                                      <div className='bg-muted flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-md border'>
                                        <FileText className='text-muted-foreground h-8 w-8' />
                                      </div>
                                    )}
                                    <div className='flex-1 space-y-1'>
                                      <p className='text-sm font-medium'>
                                        {selectedFile.name}
                                      </p>
                                      <p className='text-muted-foreground text-xs'>
                                        {(selectedFile.size / 1024).toFixed(1)}{' '}
                                        KB
                                      </p>
                                    </div>
                                    <Button
                                      variant='ghost'
                                      size='sm'
                                      onClick={() => setSelectedFile(null)}
                                      className='h-8 w-8 p-0'
                                    >
                                      <XCircle className='h-4 w-4' />
                                      <span className='sr-only'>
                                        Remove file
                                      </span>
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                        <Separator />

                        <div className='space-y-4'>
                          <h3 className='text-sm font-medium'>
                            Uploaded Documents
                          </h3>
                          {application?.application?.extra_documents &&
                          application.application.extra_documents.length > 0 ? (
                            <div className='space-y-4'>
                              {application.application.extra_documents.map(
                                (doc) => (
                                  <div
                                    key={doc.id}
                                    className='rounded-lg border p-4'
                                  >
                                    <div className='mb-2 flex items-center justify-between'>
                                      <h3 className='font-medium'>
                                        {doc.name}
                                      </h3>
                                      <Button
                                        variant='outline'
                                        size='sm'
                                        onClick={() =>
                                          window.open(doc.document, '_blank')
                                        }
                                      >
                                        <Eye className='mr-2 h-4 w-4' />
                                        View
                                      </Button>
                                    </div>
                                    <p className='text-muted-foreground text-sm'>
                                      Uploaded on {formatDate(doc.created_at)}
                                    </p>
                                  </div>
                                )
                              )}
                            </div>
                          ) : (
                            <p className='text-muted-foreground text-sm'>
                              No documents uploaded yet
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Information Tab */}
                  <TabsContent value='information' className='mt-6'>
                    <Card>
                      <CardHeader>
                        <CardTitle>Application Information</CardTitle>
                        <CardDescription>
                          {application?.status === 'WAITING' ||
                          application?.status === 'COMPLETED'
                            ? 'View information history for this application'
                            : 'Add additional information or notes about this application'}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className='space-y-6'>
                        {application?.status !== 'WAITING' &&
                          application?.status !== 'COMPLETED' && (
                            <div className='space-y-4'>
                              <FormField
                                control={form.control}
                                name='info'
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>New Information</FormLabel>
                                    <FormControl>
                                      <Textarea
                                        placeholder='Enter additional information...'
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <Button
                                onClick={handleAddInfo}
                                disabled={addInfoMutation.isPending}
                              >
                                {addInfoMutation.isPending ? (
                                  <>
                                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                    Adding...
                                  </>
                                ) : (
                                  'Add Information'
                                )}
                              </Button>
                            </div>
                          )}

                        <Separator />

                        <div className='space-y-4'>
                          <h3 className='text-sm font-medium'>
                            Information History
                          </h3>
                          {application?.application?.infos &&
                          application.application.infos.length > 0 ? (
                            <div className='space-y-4'>
                              {application.application.infos
                                .sort(
                                  (a, b) =>
                                    new Date(b.created_at).getTime() -
                                    new Date(a.created_at).getTime()
                                )
                                .map((info) => (
                                  <div
                                    key={info.id}
                                    className='rounded-lg border p-4'
                                  >
                                    <div className='mb-2 flex items-center justify-between'>
                                      <span className='text-muted-foreground text-sm'>
                                        {formatDate(info.created_at)}
                                      </span>
                                    </div>
                                    <p className='text-sm'>{info.info}</p>
                                  </div>
                                ))}
                            </div>
                          ) : (
                            <p className='text-muted-foreground text-sm'>
                              No information added yet
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Payment Tab */}
                  <TabsContent value='payment' className='mt-6'>
                    <Card>
                      <CardHeader>
                        <CardTitle>Payment Information</CardTitle>
                        <CardDescription>
                          {application?.status === 'WAITING' ||
                          application?.status === 'COMPLETED'
                            ? 'View payment history for this application'
                            : paymentHistory?.results &&
                                paymentHistory.results.length > 0
                              ? 'View and edit GEPG reference for this application'
                              : 'Submit GEPG reference for this application'}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className='space-y-6'>
                        {application?.status !== 'WAITING' &&
                          application?.status !== 'COMPLETED' && (
                            <>
                              {(!paymentHistory?.results ||
                                paymentHistory.results.length === 0) && (
                                <>
                                  <div className='grid gap-6 md:grid-cols-1'>
                                    <FormField
                                      control={form.control}
                                      name='payment.gepg'
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>GEPG Reference</FormLabel>
                                          <FormControl>
                                            <Input {...field} />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                  </div>
                                  <Button
                                    onClick={handleAddPayment}
                                    disabled={addPaymentMutation.isPending}
                                  >
                                    {addPaymentMutation.isPending ? (
                                      <>
                                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                        Submitting...
                                      </>
                                    ) : (
                                      'Submit Payment'
                                    )}
                                  </Button>
                                </>
                              )}
                            </>
                          )}

                        <Separator />

                        <div className='space-y-4'>
                          <h3 className='text-sm font-medium'>
                            Payment History
                          </h3>
                          {paymentHistory?.results &&
                          paymentHistory.results.length > 0 ? (
                            <div className='space-y-4'>
                              {paymentHistory.results.map((payment) => (
                                <div
                                  key={payment.id}
                                  className='rounded-lg border p-4'
                                >
                                  <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                                    <div className='space-y-1'>
                                      <p className='text-muted-foreground text-sm font-medium'>
                                        GEPG Reference
                                      </p>
                                      <div className='flex items-center gap-2'>
                                        <p className='font-medium'>
                                          {payment.gepg}
                                        </p>
                                        {application?.status !== 'WAITING' &&
                                          application?.status !==
                                            'COMPLETED' && (
                                            <Button
                                              variant='ghost'
                                              size='sm'
                                              onClick={() => {
                                                const newGepg = window.prompt(
                                                  'Enter new GEPG reference:',
                                                  payment.gepg
                                                );
                                                if (
                                                  newGepg &&
                                                  newGepg !== payment.gepg
                                                ) {
                                                  editPaymentMutation.mutate({
                                                    id: payment.id,
                                                    gepg: newGepg
                                                  });
                                                }
                                              }}
                                              className='h-8 w-8 p-0'
                                            >
                                              <FileText className='h-4 w-4' />
                                              <span className='sr-only'>
                                                Edit GEPG reference
                                              </span>
                                            </Button>
                                          )}
                                      </div>
                                    </div>
                                    <div className='space-y-1'>
                                      <p className='text-muted-foreground text-sm font-medium'>
                                        Status
                                      </p>
                                      <Badge
                                        variant={
                                          payment.status === 'success'
                                            ? 'default'
                                            : payment.status === 'failed'
                                              ? 'destructive'
                                              : payment.status === 'cancelled'
                                                ? 'destructive'
                                                : 'secondary'
                                        }
                                      >
                                        {payment.status.toUpperCase()}
                                      </Badge>
                                    </div>
                                  </div>
                                  <div className='text-muted-foreground mt-2 text-sm'>
                                    Last updated:{' '}
                                    {formatDate(payment.updated_at)}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className='text-muted-foreground text-sm'>
                              No payments submitted yet
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Credentials Tab */}
                  <TabsContent
                    value='credentials'
                    className='mt-6 space-y-6 pb-8'
                  >
                    <Card>
                      <CardHeader>
                        <CardTitle>Application Credentials</CardTitle>
                        <CardDescription>
                          {application?.status === 'WAITING' ||
                          application?.status === 'COMPLETED'
                            ? 'View credentials for this application'
                            : credentialsData?.results &&
                                credentialsData.results.length > 0
                              ? 'View and edit login credentials for this application'
                              : 'Add login credentials for this application'}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className='space-y-6'>
                        {application?.status !== 'WAITING' &&
                          application?.status !== 'COMPLETED' && (
                            <>
                              {(!credentialsData?.results ||
                                credentialsData.results.length === 0) && (
                                <>
                                  <div className='grid gap-6 md:grid-cols-2'>
                                    <FormField
                                      control={form.control}
                                      name='credentials.username'
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>Username</FormLabel>
                                          <FormControl>
                                            <Input {...field} />
                                          </FormControl>
                                          <FormMessage />
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
                                            <div className='relative'>
                                              <Input
                                                type={
                                                  showPassword
                                                    ? 'text'
                                                    : 'password'
                                                }
                                                {...field}
                                              />
                                              <Button
                                                type='button'
                                                variant='ghost'
                                                size='sm'
                                                className='absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent'
                                                onClick={() =>
                                                  setShowPassword(!showPassword)
                                                }
                                              >
                                                {showPassword ? (
                                                  <EyeOff className='text-muted-foreground h-4 w-4' />
                                                ) : (
                                                  <Eye className='text-muted-foreground h-4 w-4' />
                                                )}
                                                <span className='sr-only'>
                                                  {showPassword
                                                    ? 'Hide password'
                                                    : 'Show password'}
                                                </span>
                                              </Button>
                                            </div>
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                  </div>
                                  <Button
                                    onClick={handleAddCredentials}
                                    disabled={addCredentialsMutation.isPending}
                                  >
                                    {addCredentialsMutation.isPending ? (
                                      <>
                                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                        Adding...
                                      </>
                                    ) : (
                                      'Add Credentials'
                                    )}
                                  </Button>
                                </>
                              )}
                            </>
                          )}

                        <Separator />

                        <div className='space-y-4'>
                          <h3 className='text-sm font-medium'>
                            Current Credentials
                          </h3>
                          {credentialsData?.results &&
                          credentialsData.results.length > 0 ? (
                            <div className='space-y-4'>
                              {credentialsData.results.map((credential) => (
                                <div
                                  key={credential.id}
                                  className='rounded-lg border p-4'
                                >
                                  <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                                    <div className='space-y-1'>
                                      <p className='text-muted-foreground text-sm font-medium'>
                                        Username
                                      </p>
                                      <div className='flex items-center gap-2'>
                                        <p className='font-medium'>
                                          {credential.username}
                                        </p>
                                        {application?.status !== 'WAITING' &&
                                          application?.status !==
                                            'COMPLETED' && (
                                            <Button
                                              variant='ghost'
                                              size='sm'
                                              onClick={() => {
                                                const newUsername =
                                                  window.prompt(
                                                    'Enter new username:',
                                                    credential.username
                                                  );
                                                if (
                                                  newUsername &&
                                                  newUsername !==
                                                    credential.username
                                                ) {
                                                  editCredentialsMutation.mutate(
                                                    {
                                                      id: credential.id,
                                                      username: newUsername,
                                                      password:
                                                        credential.password
                                                    }
                                                  );
                                                }
                                              }}
                                              className='h-8 w-8 p-0'
                                            >
                                              <FileText className='h-4 w-4' />
                                              <span className='sr-only'>
                                                Edit username
                                              </span>
                                            </Button>
                                          )}
                                      </div>
                                    </div>
                                    <div className='space-y-1'>
                                      <p className='text-muted-foreground text-sm font-medium'>
                                        Password
                                      </p>
                                      <div className='flex items-center gap-2'>
                                        <div className='relative flex-1'>
                                          <p className='font-medium'>
                                            {showNewPassword
                                              ? credential.password
                                              : '••••••••'}
                                          </p>
                                          <Button
                                            variant='ghost'
                                            size='sm'
                                            onClick={() =>
                                              setShowNewPassword(
                                                !showNewPassword
                                              )
                                            }
                                            className='absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent'
                                          >
                                            {showNewPassword ? (
                                              <EyeOff className='text-muted-foreground h-4 w-4' />
                                            ) : (
                                              <Eye className='text-muted-foreground h-4 w-4' />
                                            )}
                                            <span className='sr-only'>
                                              {showNewPassword
                                                ? 'Hide password'
                                                : 'Show password'}
                                            </span>
                                          </Button>
                                        </div>
                                        {application?.status !== 'WAITING' &&
                                          application?.status !==
                                            'COMPLETED' && (
                                            <Button
                                              variant='ghost'
                                              size='sm'
                                              onClick={() => {
                                                const newPassword =
                                                  window.prompt(
                                                    'Enter new password:',
                                                    credential.password
                                                  );
                                                if (
                                                  newPassword &&
                                                  newPassword !==
                                                    credential.password
                                                ) {
                                                  editCredentialsMutation.mutate(
                                                    {
                                                      id: credential.id,
                                                      username:
                                                        credential.username,
                                                      password: newPassword
                                                    }
                                                  );
                                                }
                                              }}
                                              className='h-8 w-8 p-0'
                                            >
                                              <FileText className='h-4 w-4' />
                                              <span className='sr-only'>
                                                Edit password
                                              </span>
                                            </Button>
                                          )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className='text-muted-foreground text-sm'>
                              No credentials added yet
                            </p>
                          )}
                        </div>

                        {/* Proof Upload Section */}
                        {application?.status === 'COMPLETED' ||
                        application?.status === 'WAITING' ? (
                          <>
                            <Separator className='my-6' />
                            <div className='space-y-4'>
                              <div className='flex items-center justify-between'>
                                <div>
                                  <h3 className='text-sm font-medium'>
                                    Proof Documents
                                  </h3>
                                  <p className='text-muted-foreground text-sm'>
                                    View submitted proof documents
                                  </p>
                                </div>
                              </div>

                              <div className='space-y-4'>
                                {application?.proofs &&
                                application.proofs.length > 0 ? (
                                  application.proofs.map((proof) => (
                                    <div
                                      key={proof.id}
                                      className='rounded-lg border p-4'
                                    >
                                      <div className='flex items-start gap-3'>
                                        {proof.proof.match(
                                          /\.(jpg|jpeg|png|gif)$/i
                                        ) ? (
                                          <div className='relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border'>
                                            <img
                                              src={proof.proof}
                                              alt='Proof document'
                                              className='h-full w-full object-cover'
                                            />
                                          </div>
                                        ) : (
                                          <div className='bg-muted flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-md border'>
                                            <FileText className='text-muted-foreground h-8 w-8' />
                                          </div>
                                        )}
                                        <div className='flex-1 space-y-1'>
                                          <p className='text-sm font-medium'>
                                            Proof Document
                                          </p>
                                          <p className='text-muted-foreground text-xs'>
                                            Uploaded on{' '}
                                            {formatDate(proof.created_at)}
                                          </p>
                                        </div>
                                        <Button
                                          variant='outline'
                                          size='sm'
                                          onClick={() =>
                                            window.open(proof.proof, '_blank')
                                          }
                                        >
                                          <Eye className='mr-2 h-4 w-4' />
                                          View
                                        </Button>
                                      </div>
                                    </div>
                                  ))
                                ) : (
                                  <p className='text-muted-foreground text-sm'>
                                    No proof documents available
                                  </p>
                                )}
                              </div>
                            </div>
                          </>
                        ) : (
                          <>
                            <Separator className='my-6' />
                            <div className='space-y-4'>
                              <div className='flex items-center justify-between'>
                                <div>
                                  <h3 className='text-sm font-medium'>
                                    Proof Documents
                                  </h3>
                                  <p className='text-muted-foreground text-sm'>
                                    Upload proof documents for final submission
                                  </p>
                                </div>
                              </div>

                              {credentialsData?.results &&
                              credentialsData.results.length > 0 &&
                              paymentHistory?.results?.some(
                                (payment) => payment.status === 'success'
                              ) ? (
                                <div className='space-y-4'>
                                  <div className='flex items-center gap-4'>
                                    <Input
                                      type='file'
                                      onChange={handleProofFileChange}
                                      disabled={
                                        submitApplicationMutation.isPending
                                      }
                                      accept='image/*,.pdf'
                                      multiple
                                    />
                                  </div>

                                  {proofFiles.length > 0 && (
                                    <div className='space-y-4'>
                                      {proofFiles.map((file, index) => (
                                        <div
                                          key={index}
                                          className='rounded-lg border p-4'
                                        >
                                          <div className='flex items-start gap-3'>
                                            {file.type.startsWith('image/') ? (
                                              <div className='relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border'>
                                                <img
                                                  src={URL.createObjectURL(
                                                    file
                                                  )}
                                                  alt={file.name}
                                                  className='h-full w-full object-cover'
                                                />
                                              </div>
                                            ) : (
                                              <div className='bg-muted flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-md border'>
                                                <FileText className='text-muted-foreground h-8 w-8' />
                                              </div>
                                            )}
                                            <div className='flex-1 space-y-1'>
                                              <p className='text-sm font-medium'>
                                                {file.name}
                                              </p>
                                              <p className='text-muted-foreground text-xs'>
                                                {(file.size / 1024).toFixed(1)}{' '}
                                                KB
                                              </p>
                                            </div>
                                            <Button
                                              variant='ghost'
                                              size='sm'
                                              onClick={() =>
                                                removeProofFile(index)
                                              }
                                              className='h-8 w-8 p-0'
                                            >
                                              <XCircle className='h-4 w-4' />
                                              <span className='sr-only'>
                                                Remove file
                                              </span>
                                            </Button>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}

                                  {proofFiles.length > 0 && (
                                    <Button
                                      onClick={handleFinalSubmit}
                                      disabled={
                                        submitApplicationMutation.isPending
                                      }
                                      className='w-full'
                                    >
                                      {submitApplicationMutation.isPending ? (
                                        <>
                                          <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                          Submitting...
                                        </>
                                      ) : (
                                        <>
                                          <Send className='mr-2 h-4 w-4' />
                                          Submit Application
                                        </>
                                      )}
                                    </Button>
                                  )}
                                </div>
                              ) : (
                                <div className='bg-muted/50 rounded-lg border p-4'>
                                  <div className='space-y-2'>
                                    <div className='flex items-center gap-2'>
                                      <Info className='text-muted-foreground h-4 w-4' />
                                      <p className='text-sm font-medium'>
                                        Proof Upload Not Available
                                      </p>
                                    </div>
                                    <div className='text-muted-foreground space-y-1 text-sm'>
                                      <p>
                                        To enable proof upload, you need to:
                                      </p>
                                      <ol className='list-inside list-decimal space-y-1'>
                                        <li>
                                          Submit GEPG payment and wait for
                                          successful confirmation
                                        </li>
                                        <li>Add application credentials</li>
                                      </ol>
                                      <div className='mt-2 flex items-center gap-2'>
                                        <Badge
                                          variant='outline'
                                          className='gap-1'
                                        >
                                          <Clock className='h-3 w-3' />
                                          {!paymentHistory?.results?.some(
                                            (payment) =>
                                              payment.status === 'success'
                                          )
                                            ? 'Waiting for payment confirmation'
                                            : !credentialsData?.results?.length
                                              ? 'Credentials required'
                                              : 'Ready to upload proofs'}
                                        </Badge>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}
