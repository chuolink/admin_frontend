// @ts-nocheck
'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQueryState } from 'nuqs';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useClientApi from '@/lib/axios/clientSide';
import PageContainer from '@/components/layout/page-container';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Edit,
  MessageCircle,
  Shield,
  Briefcase,
  Globe,
  DollarSign,
  Loader2,
  ExternalLink,
  Flag,
  Phone,
  Mail,
  MapPin,
  GraduationCap,
  Clock,
  FileText,
  Award,
  Ban,
  Link2,
  Building2
} from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/utils';
import { StarRating } from '@/features/experts/components/StarRating';
import { ChatInterface } from '@/features/experts/components/ChatInterface';
import { ExpertEditSheet } from '@/features/experts/components/ExpertEditSheet';
import { VerificationBadge } from '@/features/experts/components/VerificationBadge';
import { toast } from 'sonner';

// ---------- Info Row ----------
function InfoRow({
  label,
  value,
  icon: Icon
}: {
  label: string;
  value: any;
  icon?: any;
}) {
  return (
    <div className='flex items-start gap-3 py-2'>
      {Icon && (
        <Icon className='text-muted-foreground mt-0.5 h-4 w-4 shrink-0' />
      )}
      <div>
        <p className='text-muted-foreground text-xs'>{label}</p>
        <p className='text-sm font-medium'>{value || '—'}</p>
      </div>
    </div>
  );
}

// ========== PROFILE TAB ==========
function ProfileTab({ expert }: { expert: any }) {
  return (
    <div className='space-y-6'>
      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle className='text-base'>Basic Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-2 gap-x-8 gap-y-1 lg:grid-cols-3'>
            <InfoRow label='Full Name' value={expert.user_name} />
            <InfoRow label='Email' value={expert.user_email} icon={Mail} />
            <InfoRow
              label='Phone'
              value={expert.phone_number || expert.phone}
              icon={Phone}
            />
            <InfoRow
              label='Location'
              value={expert.location || expert.city}
              icon={MapPin}
            />
            <InfoRow
              label='Job Title'
              value={expert.job_title}
              icon={Briefcase}
            />
            <InfoRow
              label='Institution'
              value={expert.institution}
              icon={GraduationCap}
            />
          </div>
        </CardContent>
      </Card>

      {/* Professional */}
      <Card>
        <CardHeader>
          <CardTitle className='text-base'>Professional Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-2 gap-x-8 gap-y-1 lg:grid-cols-3'>
            <InfoRow
              label='Years of Experience'
              value={expert.years_experience}
              icon={Clock}
            />
            <InfoRow
              label='Employment Type'
              value={expert.employment_type?.replace('_', ' ')}
              icon={Briefcase}
            />
            <InfoRow
              label='Highest Degree'
              value={expert.highest_degree}
              icon={GraduationCap}
            />
            <InfoRow
              label='Degree Institution'
              value={expert.degree_institution}
              icon={Building2}
            />
            <InfoRow label='Expertise Source' value={expert.expertise_source} />
          </div>
        </CardContent>
      </Card>

      {/* Education */}
      {expert.education?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className='text-base'>Education</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              {expert.education.map((edu: any) => (
                <div key={edu.id} className='flex items-start gap-3'>
                  <GraduationCap className='text-muted-foreground mt-0.5 h-4 w-4 shrink-0' />
                  <div>
                    <p className='text-sm font-medium'>
                      {edu.degree} — {edu.institution}
                      {edu.is_primary && (
                        <Badge variant='secondary' className='ml-2 text-xs'>
                          Primary
                        </Badge>
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Work History */}
      {expert.work_history?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className='text-base'>Work History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              {expert.work_history.map((work: any) => (
                <div key={work.id} className='flex items-start gap-3'>
                  <Briefcase className='text-muted-foreground mt-0.5 h-4 w-4 shrink-0' />
                  <div>
                    <p className='text-sm font-medium'>
                      {work.title} at {work.organization}
                      {work.years && (
                        <span className='text-muted-foreground font-normal'>
                          {' '}
                          — {work.years} {work.years === '1' ? 'year' : 'years'}
                        </span>
                      )}
                      {work.is_current && (
                        <Badge variant='secondary' className='ml-2 text-xs'>
                          Current
                        </Badge>
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notable Work */}
      {expert.notable_work && (
        <Card>
          <CardHeader>
            <CardTitle className='text-base'>Notable Work</CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-sm whitespace-pre-wrap'>{expert.notable_work}</p>
          </CardContent>
        </Card>
      )}

      {/* Links */}
      <Card>
        <CardHeader>
          <CardTitle className='text-base'>Links</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-2 gap-x-8 gap-y-1 lg:grid-cols-3'>
            {expert.social_links && expert.social_links.length > 0
              ? expert.social_links.map((link: any) => (
                  <InfoRow
                    key={link.id}
                    label={
                      link.type.charAt(0).toUpperCase() + link.type.slice(1)
                    }
                    value={
                      link.url ? (
                        <a
                          href={link.url}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='text-sm text-blue-600 hover:underline'
                        >
                          {link.url}
                        </a>
                      ) : (
                        '—'
                      )
                    }
                    icon={Link2}
                  />
                ))
              : // Fallback to direct URL fields if no social_links entries
                [
                  'linkedin_url',
                  'twitter_url',
                  'github_url',
                  'website_url',
                  'portfolio_url'
                ].map((field) => (
                  <InfoRow
                    key={field}
                    label={
                      field.replace('_url', '').charAt(0).toUpperCase() +
                      field.replace('_url', '').slice(1)
                    }
                    value={
                      expert[field] ? (
                        <a
                          href={expert[field]}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='text-sm text-blue-600 hover:underline'
                        >
                          {expert[field]}
                        </a>
                      ) : (
                        '—'
                      )
                    }
                    icon={Link2}
                  />
                ))}
          </div>
        </CardContent>
      </Card>

      {/* Rates */}
      <Card>
        <CardHeader>
          <CardTitle className='text-base'>Rates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-3 gap-x-8'>
            <InfoRow
              label='Message Rate'
              value={
                expert.message_rate
                  ? formatCurrency(Number(expert.message_rate))
                  : '—'
              }
              icon={DollarSign}
            />
            <InfoRow
              label='Call Rate / Min'
              value={
                expert.call_rate_per_min
                  ? formatCurrency(Number(expert.call_rate_per_min))
                  : '—'
              }
              icon={DollarSign}
            />
            <InfoRow
              label='Group Subscription'
              value={
                expert.group_subscription_price
                  ? formatCurrency(Number(expert.group_subscription_price))
                  : '—'
              }
              icon={DollarSign}
            />
          </div>
        </CardContent>
      </Card>

      {/* Status */}
      <Card>
        <CardHeader>
          <CardTitle className='text-base'>Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-2 gap-x-8 gap-y-1 lg:grid-cols-4'>
            <InfoRow
              label='Verification'
              value={
                <VerificationBadge
                  status={expert.verification_status || 'pending'}
                />
              }
              icon={Shield}
            />
            <InfoRow
              label='Verification Level'
              value={expert.verification_level}
            />
            <InfoRow
              label='Active'
              value={
                <div
                  className={`h-2.5 w-2.5 rounded-full ${expert.is_active ? 'bg-green-500' : 'bg-gray-300'}`}
                />
              }
            />
            <InfoRow
              label='Online'
              value={
                <div
                  className={`h-2.5 w-2.5 rounded-full ${expert.is_online ? 'bg-green-500' : 'bg-gray-300'}`}
                />
              }
            />
            <InfoRow
              label='Onboarding'
              value={expert.onboarding_step || expert.onboarding || '—'}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ========== CREDENTIALS TAB ==========
function CredentialsTab({ expert }: { expert: any }) {
  const credentials = expert?.credentials || [];

  return (
    <Card>
      <CardContent className='p-0'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Institution</TableHead>
              <TableHead>Year</TableHead>
              <TableHead>File</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {credentials.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className='text-muted-foreground py-8 text-center'
                >
                  No credentials found.
                </TableCell>
              </TableRow>
            ) : (
              credentials.map((cred: any) => (
                <TableRow key={cred.id}>
                  <TableCell>
                    <Badge variant='secondary'>
                      {cred.credential_type || cred.type || '—'}
                    </Badge>
                  </TableCell>
                  <TableCell className='font-medium'>
                    {cred.title || cred.name || '—'}
                  </TableCell>
                  <TableCell>
                    {cred.institution || cred.issuing_organization || '—'}
                  </TableCell>
                  <TableCell>{cred.year || cred.issue_year || '—'}</TableCell>
                  <TableCell>
                    {cred.file || cred.document ? (
                      <a
                        href={cred.file || cred.document}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='text-blue-600 hover:underline'
                      >
                        <ExternalLink className='inline h-4 w-4' />
                      </a>
                    ) : (
                      '—'
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

// ========== EARNINGS TAB ==========
function EarningsTab({ expertId }: { expertId: string }) {
  const { api } = useClientApi();

  const { data, isLoading } = useQuery({
    queryKey: ['expert-earnings', expertId],
    queryFn: async () => {
      if (!api) throw new Error('API not initialized');
      const res = await api.get(`/admin/experts/${expertId}/earnings/`);
      return res.data;
    },
    enabled: !!api
  });

  const earnings = data?.results || data || [];

  // Calculate summaries
  const totalEarnings = earnings.reduce(
    (sum: number, e: any) =>
      sum + (Number(e.amount) || Number(e.net_amount) || 0),
    0
  );
  const pendingEarnings = earnings
    .filter((e: any) => e.status === 'pending')
    .reduce(
      (sum: number, e: any) =>
        sum + (Number(e.amount) || Number(e.net_amount) || 0),
      0
    );

  return (
    <div className='space-y-4'>
      {/* Summary */}
      <div className='grid grid-cols-3 gap-4'>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>
              Total Earnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {formatCurrency(totalEarnings)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-amber-600'>
              {formatCurrency(pendingEarnings)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>Withdrawn</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-green-600'>
              {formatCurrency(totalEarnings - pendingEarnings)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className='p-0'>
          {isLoading ? (
            <div className='space-y-3 p-4'>
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className='h-12 w-full' />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Commission</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {earnings.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className='text-muted-foreground py-8 text-center'
                    >
                      No earnings found.
                    </TableCell>
                  </TableRow>
                ) : (
                  earnings.map((earning: any) => (
                    <TableRow key={earning.id}>
                      <TableCell>
                        <Badge variant='secondary'>
                          {earning.transaction_type || earning.type || '—'}
                        </Badge>
                      </TableCell>
                      <TableCell className='font-medium'>
                        {formatCurrency(
                          Number(earning.amount) ||
                            Number(earning.net_amount) ||
                            0
                        )}
                      </TableCell>
                      <TableCell className='text-muted-foreground'>
                        {earning.commission
                          ? formatCurrency(Number(earning.commission))
                          : '—'}
                      </TableCell>
                      <TableCell className='max-w-[200px] truncate'>
                        {earning.description || '—'}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            earning.status === 'completed' ||
                            earning.status === 'paid'
                              ? 'border-green-200 bg-green-100 text-green-800'
                              : earning.status === 'pending'
                                ? 'border-amber-200 bg-amber-100 text-amber-800'
                                : ''
                          }
                        >
                          {earning.status || '—'}
                        </Badge>
                      </TableCell>
                      <TableCell className='text-muted-foreground text-sm'>
                        {earning.created_at
                          ? formatDate(earning.created_at)
                          : '—'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ========== INTERACTIONS TAB ==========
function InteractionsTab({ expertId }: { expertId: string }) {
  const { api } = useClientApi();
  const [subTab, setSubTab] = useState<'bookings' | 'calls'>('bookings');

  const { data: bookingsData, isLoading: bookingsLoading } = useQuery({
    queryKey: ['expert-bookings', expertId],
    queryFn: async () => {
      if (!api) throw new Error('API not initialized');
      const res = await api.get(`/admin/experts/${expertId}/bookings/`);
      return res.data;
    },
    enabled: !!api && subTab === 'bookings'
  });

  const { data: callsData, isLoading: callsLoading } = useQuery({
    queryKey: ['expert-calls', expertId],
    queryFn: async () => {
      if (!api) throw new Error('API not initialized');
      const res = await api.get(`/admin/experts/${expertId}/calls/`);
      return res.data;
    },
    enabled: !!api && subTab === 'calls'
  });

  const bookings = bookingsData?.results || bookingsData || [];
  const calls = callsData?.results || callsData || [];

  return (
    <div className='space-y-4'>
      <div className='flex gap-2'>
        <Button
          variant={subTab === 'bookings' ? 'default' : 'outline'}
          size='sm'
          onClick={() => setSubTab('bookings')}
        >
          Bookings
        </Button>
        <Button
          variant={subTab === 'calls' ? 'default' : 'outline'}
          size='sm'
          onClick={() => setSubTab('calls')}
        >
          Calls
        </Button>
      </div>

      {subTab === 'bookings' && (
        <Card>
          <CardContent className='p-0'>
            {bookingsLoading ? (
              <div className='space-y-3 p-4'>
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className='h-12 w-full' />
                ))}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Paid</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className='text-muted-foreground py-8 text-center'
                      >
                        No bookings found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    bookings.map((booking: any) => (
                      <TableRow key={booking.id}>
                        <TableCell className='font-medium'>
                          {booking.student_name ||
                            booking.student?.user?.first_name ||
                            '—'}
                        </TableCell>
                        <TableCell>
                          <Badge variant='secondary'>
                            {booking.booking_type || booking.type || '—'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              booking.status === 'completed'
                                ? 'border-green-200 bg-green-100 text-green-800'
                                : booking.status === 'pending'
                                  ? 'border-amber-200 bg-amber-100 text-amber-800'
                                  : booking.status === 'cancelled'
                                    ? 'border-red-200 bg-red-100 text-red-800'
                                    : ''
                            }
                          >
                            {booking.status || '—'}
                          </Badge>
                        </TableCell>
                        <TableCell className='text-muted-foreground text-sm'>
                          {booking.scheduled_at || booking.date
                            ? formatDate(booking.scheduled_at || booking.date)
                            : '—'}
                        </TableCell>
                        <TableCell>
                          {booking.amount
                            ? formatCurrency(Number(booking.amount))
                            : '—'}
                        </TableCell>
                        <TableCell>
                          {booking.is_paid ? (
                            <CheckCircle className='h-4 w-4 text-green-600' />
                          ) : (
                            <XCircle className='text-muted-foreground h-4 w-4' />
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {subTab === 'calls' && (
        <Card>
          <CardContent className='p-0'>
            {callsLoading ? (
              <div className='space-y-3 p-4'>
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className='h-12 w-full' />
                ))}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {calls.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className='text-muted-foreground py-8 text-center'
                      >
                        No calls found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    calls.map((call: any) => (
                      <TableRow key={call.id}>
                        <TableCell className='font-medium'>
                          {call.student_name ||
                            call.student?.user?.first_name ||
                            '—'}
                        </TableCell>
                        <TableCell>
                          <Badge variant='secondary'>
                            {call.call_type || call.type || '—'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              call.status === 'completed'
                                ? 'border-green-200 bg-green-100 text-green-800'
                                : call.status === 'missed'
                                  ? 'border-red-200 bg-red-100 text-red-800'
                                  : ''
                            }
                          >
                            {call.status || '—'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {call.duration
                            ? `${Math.floor(call.duration / 60)}m ${call.duration % 60}s`
                            : '—'}
                        </TableCell>
                        <TableCell>
                          {call.amount
                            ? formatCurrency(Number(call.amount))
                            : '—'}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ========== REVIEWS TAB ==========
function ReviewsDetailTab({ expertId }: { expertId: string }) {
  const { api } = useClientApi();

  const { data, isLoading } = useQuery({
    queryKey: ['expert-reviews-detail', expertId],
    queryFn: async () => {
      if (!api) throw new Error('API not initialized');
      const res = await api.get(`/admin/experts/${expertId}/reviews/`);
      return res.data;
    },
    enabled: !!api
  });

  const reviews = data?.results || data || [];
  const avgRating =
    reviews.length > 0
      ? reviews.reduce(
          (sum: number, r: any) => sum + (Number(r.rating) || 0),
          0
        ) / reviews.length
      : 0;

  return (
    <div className='space-y-4'>
      {/* Avg Rating Card */}
      <Card>
        <CardContent className='flex items-center gap-4 py-4'>
          <div>
            <p className='text-muted-foreground text-sm'>Average Rating</p>
            <div className='flex items-center gap-2'>
              <span className='text-3xl font-bold'>{avgRating.toFixed(1)}</span>
              <StarRating rating={avgRating} size='md' />
            </div>
            <p className='text-muted-foreground text-xs'>
              {reviews.length} reviews
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className='p-0'>
          {isLoading ? (
            <div className='space-y-3 p-4'>
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className='h-12 w-full' />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reviewer</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Comment</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className='w-10'></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reviews.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className='text-muted-foreground py-8 text-center'
                    >
                      No reviews found.
                    </TableCell>
                  </TableRow>
                ) : (
                  reviews.map((review: any) => (
                    <TableRow key={review.id}>
                      <TableCell className='font-medium'>
                        {review.reviewer_name ||
                          review.student_name ||
                          review.student?.user?.first_name ||
                          '—'}
                      </TableCell>
                      <TableCell>
                        <StarRating
                          rating={Number(review.rating) || 0}
                          showValue
                        />
                      </TableCell>
                      <TableCell className='max-w-[300px]'>
                        <p className='truncate'>{review.comment || '—'}</p>
                      </TableCell>
                      <TableCell className='text-muted-foreground text-sm'>
                        {review.created_at
                          ? formatDate(review.created_at)
                          : '—'}
                      </TableCell>
                      <TableCell>
                        {Number(review.rating) < 3 && (
                          <Flag className='h-4 w-4 text-red-500' />
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ========== WITHDRAWALS TAB ==========
function WithdrawalsTab({ expertId }: { expertId: string }) {
  const { api } = useClientApi();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['expert-withdrawals', expertId],
    queryFn: async () => {
      if (!api) throw new Error('API not initialized');
      const res = await api.get(`/admin/experts/${expertId}/withdrawals/`);
      return res.data;
    },
    enabled: !!api
  });

  const actionMutation = useMutation({
    mutationFn: async ({
      withdrawalId,
      action
    }: {
      withdrawalId: string;
      action: 'approve' | 'reject';
    }) => {
      if (!api) throw new Error('API not initialized');
      return api.post(`/admin/expert-withdrawals/${withdrawalId}/${action}/`);
    },
    onSuccess: (_, variables) => {
      toast.success(
        variables.action === 'approve'
          ? 'Withdrawal approved'
          : 'Withdrawal rejected'
      );
      queryClient.invalidateQueries({
        queryKey: ['expert-withdrawals', expertId]
      });
      queryClient.invalidateQueries({ queryKey: ['expert', expertId] });
    },
    onError: () => {
      toast.error('Failed to process withdrawal');
    }
  });

  const withdrawals = data?.results || data || [];
  const pendingWithdrawals = withdrawals.filter(
    (w: any) => w.status === 'pending'
  );
  const completedWithdrawals = withdrawals.filter(
    (w: any) => w.status !== 'pending'
  );

  return (
    <div className='space-y-4'>
      {pendingWithdrawals.length > 0 && (
        <div className='rounded-lg border border-amber-200 bg-amber-50 p-3'>
          <p className='text-sm font-medium text-amber-800'>
            {pendingWithdrawals.length} pending withdrawal request
            {pendingWithdrawals.length !== 1 ? 's' : ''} requiring action
          </p>
        </div>
      )}

      <Card>
        <CardContent className='p-0'>
          {isLoading ? (
            <div className='space-y-3 p-4'>
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className='h-12 w-full' />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Requested</TableHead>
                  <TableHead className='w-32'>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {withdrawals.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className='text-muted-foreground py-8 text-center'
                    >
                      No withdrawal requests.
                    </TableCell>
                  </TableRow>
                ) : (
                  withdrawals.map((w: any) => (
                    <TableRow key={w.id}>
                      <TableCell className='font-medium'>
                        {formatCurrency(Number(w.amount) || 0)}
                      </TableCell>
                      <TableCell>
                        <Badge variant='secondary'>
                          {w.method || w.payment_method || '—'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            w.status === 'completed' || w.status === 'approved'
                              ? 'border-green-200 bg-green-100 text-green-800'
                              : w.status === 'pending'
                                ? 'border-amber-200 bg-amber-100 text-amber-800'
                                : w.status === 'rejected'
                                  ? 'border-red-200 bg-red-100 text-red-800'
                                  : ''
                          }
                        >
                          {w.status || '—'}
                        </Badge>
                      </TableCell>
                      <TableCell className='text-muted-foreground text-sm'>
                        {w.created_at ? formatDate(w.created_at) : '—'}
                      </TableCell>
                      <TableCell>
                        {w.status === 'pending' && (
                          <div className='flex gap-1'>
                            <Button
                              size='sm'
                              variant='outline'
                              className='h-7 px-2 text-xs'
                              onClick={() =>
                                actionMutation.mutate({
                                  withdrawalId: w.id,
                                  action: 'approve'
                                })
                              }
                              disabled={actionMutation.isPending}
                            >
                              <CheckCircle className='mr-1 h-3 w-3' />
                              Approve
                            </Button>
                            <Button
                              size='sm'
                              variant='outline'
                              className='text-destructive hover:text-destructive h-7 px-2 text-xs'
                              onClick={() =>
                                actionMutation.mutate({
                                  withdrawalId: w.id,
                                  action: 'reject'
                                })
                              }
                              disabled={actionMutation.isPending}
                            >
                              <XCircle className='mr-1 h-3 w-3' />
                              Reject
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ========== RIGHT SIDEBAR ==========
function ExpertSidebar({
  expert,
  onVerify,
  onReject,
  onEdit,
  onSuspend,
  verifyPending,
  suspendPending
}: {
  expert: any;
  onVerify: () => void;
  onReject: () => void;
  onEdit: () => void;
  onSuspend: () => void;
  verifyPending: boolean;
  suspendPending: boolean;
}) {
  return (
    <div className='space-y-4'>
      {/* Quick Info */}
      <Card>
        <CardContent className='pt-6'>
          <div className='flex flex-col items-center text-center'>
            <Avatar className='mb-3 h-16 w-16'>
              <AvatarImage src={expert.profile_photo} />
              <AvatarFallback className='bg-muted text-lg font-medium'>
                {expert.user_name
                  ? expert.user_name
                      .split(' ')
                      .map((n: string) => n[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase()
                  : '?'}
              </AvatarFallback>
            </Avatar>
            <h3 className='font-semibold'>{expert.user_name || '—'}</h3>
            <p className='text-muted-foreground text-sm'>
              {expert.job_title || '—'}
            </p>
            <div className='mt-2'>
              <VerificationBadge
                status={expert.verification_status || 'pending'}
              />
            </div>
            {expert.avg_rating ? (
              <div className='mt-2'>
                <StarRating rating={Number(expert.avg_rating)} showValue />
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader className='pb-2'>
          <CardTitle className='text-sm'>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className='space-y-2'>
          {expert.verification_status === 'pending' && (
            <>
              <Button
                className='w-full'
                size='sm'
                onClick={onVerify}
                disabled={verifyPending}
              >
                <CheckCircle className='mr-1 h-4 w-4' />
                Verify Expert
              </Button>
              <Button
                variant='destructive'
                className='w-full'
                size='sm'
                onClick={onReject}
                disabled={verifyPending}
              >
                <XCircle className='mr-1 h-4 w-4' />
                Reject
              </Button>
            </>
          )}
          <Button
            variant='outline'
            className='w-full'
            size='sm'
            onClick={onEdit}
          >
            <Edit className='mr-1 h-4 w-4' />
            Edit Profile
          </Button>
          {expert.verification_status === 'verified' && (
            <Button
              variant='outline'
              className={`w-full ${expert.is_active ? 'text-destructive hover:text-destructive' : ''}`}
              size='sm'
              onClick={onSuspend}
              disabled={suspendPending}
            >
              {expert.is_active ? (
                <>
                  <Ban className='mr-1 h-4 w-4' />
                  Suspend Expert
                </>
              ) : (
                <>
                  <CheckCircle className='mr-1 h-4 w-4' />
                  Activate Expert
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Earnings Summary */}
      <Card>
        <CardHeader className='pb-2'>
          <CardTitle className='text-sm'>Earnings Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-2'>
            <div className='flex justify-between text-sm'>
              <span className='text-muted-foreground'>Total Earnings</span>
              <span className='font-medium'>
                {formatCurrency(expert.total_earnings ?? expert.earnings ?? 0)}
              </span>
            </div>
            <div className='flex justify-between text-sm'>
              <span className='text-muted-foreground'>Pending</span>
              <span className='font-medium text-amber-600'>
                {formatCurrency(expert.pending_earnings ?? 0)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Support Tickets */}
      <Card>
        <CardHeader className='pb-2'>
          <CardTitle className='text-sm'>Support</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='flex justify-between text-sm'>
            <span className='text-muted-foreground'>Active Tickets</span>
            <Badge variant='secondary'>
              {expert.active_support_tickets ?? 0}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ========== MAIN DETAIL PAGE ==========
export default function ExpertDetailPage() {
  const params = useParams();
  const router = useRouter();
  const expertId = params.expertId as string;
  const { api } = useClientApi();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useQueryState('tab', {
    defaultValue: 'profile'
  });
  const [editSheetOpen, setEditSheetOpen] = useState(false);
  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);
  const [verifyAction, setVerifyAction] = useState<'approve' | 'reject'>(
    'approve'
  );
  const [verifyNotes, setVerifyNotes] = useState('');

  // Fetch expert detail
  const { data: expert, isLoading } = useQuery({
    queryKey: ['expert', expertId],
    queryFn: async () => {
      if (!api) throw new Error('API not initialized');
      const res = await api.get(`/admin/experts/${expertId}/`);
      return res.data;
    },
    enabled: !!api && !!expertId
  });

  // Verify mutation
  const verifyMutation = useMutation({
    mutationFn: async ({
      action,
      notes
    }: {
      action: string;
      notes: string;
    }) => {
      if (!api) throw new Error('API not initialized');
      return api.post(`/admin/experts/${expertId}/verify/`, { action, notes });
    },
    onSuccess: () => {
      toast.success(
        verifyAction === 'approve'
          ? 'Expert verified successfully'
          : 'Expert rejected'
      );
      queryClient.invalidateQueries({ queryKey: ['expert', expertId] });
      queryClient.invalidateQueries({ queryKey: ['experts'] });
      setVerifyDialogOpen(false);
      setVerifyNotes('');
    },
    onError: () => {
      toast.error('Failed to update verification status');
    }
  });

  // Suspend/activate mutation
  const suspendMutation = useMutation({
    mutationFn: async (is_active: boolean) => {
      if (!api) throw new Error('API not initialized');
      return api.patch(`/admin/experts/${expertId}/`, { is_active });
    },
    onSuccess: (_, is_active) => {
      toast.success(is_active ? 'Expert activated' : 'Expert suspended');
      queryClient.invalidateQueries({ queryKey: ['expert', expertId] });
      queryClient.invalidateQueries({ queryKey: ['experts'] });
    },
    onError: () => {
      toast.error('Failed to update expert status');
    }
  });

  const handleVerifyClick = () => {
    setVerifyAction('approve');
    setVerifyDialogOpen(true);
  };

  const handleRejectClick = () => {
    setVerifyAction('reject');
    setVerifyDialogOpen(true);
  };

  const handleVerifyConfirm = () => {
    verifyMutation.mutate({ action: verifyAction, notes: verifyNotes });
  };

  const handleSuspendToggle = () => {
    if (!expert) return;
    suspendMutation.mutate(!expert.is_active);
  };

  if (isLoading) {
    return (
      <PageContainer className='w-full'>
        <div className='flex h-96 items-center justify-center'>
          <Loader2 className='text-muted-foreground h-8 w-8 animate-spin' />
        </div>
      </PageContainer>
    );
  }

  if (!expert) {
    return (
      <PageContainer className='w-full'>
        <div className='text-muted-foreground flex h-96 items-center justify-center'>
          Expert not found.
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer className='w-full'>
      <div className='w-full space-y-6'>
        {/* Header */}
        <div className='flex items-center gap-4'>
          <Button
            variant='ghost'
            size='icon'
            onClick={() => router.push('/admin/experts')}
          >
            <ArrowLeft className='h-5 w-5' />
          </Button>
          <div className='flex-1'>
            <h1 className='text-2xl font-bold tracking-tight'>
              {expert.user_name || '—'}
            </h1>
            <p className='text-muted-foreground'>
              {expert.job_title || 'Expert'}
              {expert.institution ? ` at ${expert.institution}` : ''}
            </p>
          </div>
          <div className='flex items-center gap-2'>
            <VerificationBadge
              status={expert.verification_status || 'pending'}
            />
            {!expert.is_active && expert.verification_status === 'verified' && (
              <Badge className='border-red-200 bg-red-100 text-red-800'>
                Suspended
              </Badge>
            )}
          </div>
        </div>

        {/* Mobile Action Bar (visible below lg) */}
        <div className='flex flex-wrap items-center gap-2 lg:hidden'>
          {expert.verification_status === 'pending' && (
            <>
              <Button
                size='sm'
                onClick={handleVerifyClick}
                disabled={verifyMutation.isPending}
              >
                <CheckCircle className='mr-1 h-4 w-4' />
                Verify
              </Button>
              <Button
                variant='destructive'
                size='sm'
                onClick={handleRejectClick}
                disabled={verifyMutation.isPending}
              >
                <XCircle className='mr-1 h-4 w-4' />
                Reject
              </Button>
            </>
          )}
          <Button
            variant='outline'
            size='sm'
            onClick={() => setEditSheetOpen(true)}
          >
            <Edit className='mr-1 h-4 w-4' />
            Edit
          </Button>
          {expert.verification_status === 'verified' && (
            <Button
              variant='outline'
              size='sm'
              className={
                expert.is_active
                  ? 'text-destructive hover:text-destructive'
                  : ''
              }
              onClick={handleSuspendToggle}
              disabled={suspendMutation.isPending}
            >
              {expert.is_active ? (
                <>
                  <Ban className='mr-1 h-4 w-4' />
                  Suspend
                </>
              ) : (
                <>
                  <CheckCircle className='mr-1 h-4 w-4' />
                  Activate
                </>
              )}
            </Button>
          )}
        </div>

        {/* Main Content Layout */}
        <div className='flex gap-6'>
          {/* Left: Main Content */}
          <div className='min-w-0 flex-1'>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className='flex-wrap'>
                <TabsTrigger value='profile'>Profile</TabsTrigger>
                <TabsTrigger value='credentials'>Credentials</TabsTrigger>
                <TabsTrigger value='verification-chat'>
                  Verification Chat
                </TabsTrigger>
                <TabsTrigger value='earnings'>Earnings</TabsTrigger>
                <TabsTrigger value='withdrawals'>Withdrawals</TabsTrigger>
                <TabsTrigger value='interactions'>Interactions</TabsTrigger>
                <TabsTrigger value='reviews'>Reviews</TabsTrigger>
              </TabsList>

              <TabsContent value='profile'>
                <ProfileTab expert={expert} />
              </TabsContent>

              <TabsContent value='credentials'>
                <CredentialsTab expert={expert} />
              </TabsContent>

              <TabsContent value='verification-chat'>
                <Card>
                  <CardContent className='p-0'>
                    <ChatInterface
                      threadId={null}
                      threadType='verification'
                      expertId={expertId}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value='earnings'>
                <EarningsTab expertId={expertId} />
              </TabsContent>

              <TabsContent value='withdrawals'>
                <WithdrawalsTab expertId={expertId} />
              </TabsContent>

              <TabsContent value='interactions'>
                <InteractionsTab expertId={expertId} />
              </TabsContent>

              <TabsContent value='reviews'>
                <ReviewsDetailTab expertId={expertId} />
              </TabsContent>
            </Tabs>
          </div>

          {/* Right: Sidebar */}
          <div className='hidden w-72 shrink-0 lg:block'>
            <ExpertSidebar
              expert={expert}
              onVerify={handleVerifyClick}
              onReject={handleRejectClick}
              onEdit={() => setEditSheetOpen(true)}
              onSuspend={handleSuspendToggle}
              verifyPending={verifyMutation.isPending}
              suspendPending={suspendMutation.isPending}
            />
          </div>
        </div>
      </div>

      {/* Verify/Reject Dialog */}
      <Dialog open={verifyDialogOpen} onOpenChange={setVerifyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {verifyAction === 'approve' ? 'Verify Expert' : 'Reject Expert'}
            </DialogTitle>
            <DialogDescription>
              {verifyAction === 'approve'
                ? 'This will approve the expert and allow them to appear on the platform.'
                : 'This will reject the expert application. You can add notes explaining the reason.'}
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-4 py-2'>
            <div className='space-y-2'>
              <label className='text-sm font-medium'>Notes (optional)</label>
              <Textarea
                placeholder={
                  verifyAction === 'approve'
                    ? 'Any notes about the approval...'
                    : 'Reason for rejection...'
                }
                value={verifyNotes}
                onChange={(e) => setVerifyNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setVerifyDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant={verifyAction === 'approve' ? 'default' : 'destructive'}
              onClick={handleVerifyConfirm}
              disabled={verifyMutation.isPending}
            >
              {verifyMutation.isPending && (
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              )}
              {verifyAction === 'approve' ? 'Approve' : 'Reject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Sheet */}
      <ExpertEditSheet
        expert={expert}
        open={editSheetOpen}
        onOpenChange={setEditSheetOpen}
      />
    </PageContainer>
  );
}
