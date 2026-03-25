'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useClientApi from '@/lib/axios/clientSide';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import {
  CheckCircle2,
  Circle,
  Clock,
  CreditCard,
  FileText,
  Calendar,
  Info,
  MapPin,
  ShieldCheck,
  SkipForward,
  Ban,
  Route
} from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';

type StageStatus = 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'SKIPPED' | 'BLOCKED';
type StageType =
  | 'PAYMENT'
  | 'DOCUMENT_UPLOAD'
  | 'SCHEDULE'
  | 'INFO'
  | 'PHYSICAL_VISIT'
  | 'APPROVAL';

interface StageInstance {
  id: string;
  stage_order: number;
  stage_name: string;
  stage_type: StageType;
  description: string;
  is_required: boolean;
  status: StageStatus;
  data: any;
  payment_amount: string | null;
  payment_currency: string;
  scheduled_date: string | null;
  completed_at: string | null;
  completed_by_name: string;
  notes: string;
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

const STATUS_COLORS: Record<StageStatus, string> = {
  PENDING: 'text-muted-foreground',
  ACTIVE: 'text-primary',
  COMPLETED: 'text-green-500',
  SKIPPED: 'text-muted-foreground',
  BLOCKED: 'text-destructive'
};

function StatusIcon({ status }: { status: StageStatus }) {
  switch (status) {
    case 'COMPLETED':
      return <CheckCircle2 className='h-5 w-5 text-green-500' />;
    case 'ACTIVE':
      return (
        <div className='border-primary bg-primary/20 flex h-5 w-5 items-center justify-center rounded-full border-2'>
          <div className='bg-primary h-2 w-2 animate-pulse rounded-full' />
        </div>
      );
    case 'SKIPPED':
      return <SkipForward className='text-muted-foreground h-5 w-5' />;
    case 'BLOCKED':
      return <Ban className='text-destructive h-5 w-5' />;
    default:
      return <Circle className='text-muted-foreground h-5 w-5' />;
  }
}

function StageActions({
  stage,
  onComplete,
  onSkip,
  isLoading
}: {
  stage: StageInstance;
  onComplete: (notes: string) => void;
  onSkip: () => void;
  isLoading: boolean;
}) {
  const [notes, setNotes] = useState('');

  if (stage.status !== 'ACTIVE') return null;

  return (
    <div className='mt-3 space-y-3 border-t pt-3'>
      <Textarea
        placeholder='Add notes (optional)...'
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={2}
      />
      <div className='flex gap-2'>
        <Button
          size='sm'
          onClick={() => onComplete(notes)}
          disabled={isLoading}
        >
          <CheckCircle2 className='mr-1.5 h-3.5 w-3.5' />
          {isLoading ? 'Completing...' : 'Mark Complete'}
        </Button>
        <Button
          size='sm'
          variant='outline'
          onClick={onSkip}
          disabled={isLoading}
        >
          <SkipForward className='mr-1.5 h-3.5 w-3.5' />
          Skip
        </Button>
      </div>
    </div>
  );
}

export default function AdminJourneyTab({
  applicationId
}: {
  applicationId: string;
}) {
  const { api } = useClientApi();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['stage-instances', applicationId],
    queryFn: async () => {
      const response = await api!.get('/admin/stage-instances/', {
        params: {
          application: applicationId,
          page_size: 50,
          ordering: 'stage_order'
        }
      });
      return response.data;
    },
    enabled: !!api && !!applicationId
  });

  const completeMutation = useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes: string }) => {
      await api!.post(`/admin/stage-instances/${id}/complete/`, { notes });
    },
    onSuccess: () => {
      toast.success('Stage marked as complete');
      queryClient.invalidateQueries({
        queryKey: ['stage-instances', applicationId]
      });
    },
    onError: () => toast.error('Failed to complete stage')
  });

  const skipMutation = useMutation({
    mutationFn: async (id: string) => {
      await api!.post(`/admin/stage-instances/${id}/skip/`);
    },
    onSuccess: () => {
      toast.success('Stage skipped');
      queryClient.invalidateQueries({
        queryKey: ['stage-instances', applicationId]
      });
    },
    onError: () => toast.error('Failed to skip stage')
  });

  if (isLoading) {
    return (
      <div className='space-y-3'>
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className='h-20 rounded-lg' />
        ))}
      </div>
    );
  }

  const stages: StageInstance[] = data?.results || [];

  if (!stages.length) {
    return (
      <Card>
        <CardContent className='flex flex-col items-center py-12'>
          <Route className='text-muted-foreground mb-3 h-8 w-8' />
          <p className='text-muted-foreground text-sm'>
            No journey stages for this application.
          </p>
          <p className='text-muted-foreground mt-1 text-xs'>
            Stages are auto-created when an application is approved.
          </p>
        </CardContent>
      </Card>
    );
  }

  const completedCount = stages.filter((s) => s.status === 'COMPLETED').length;
  const activeStage = stages.find((s) => s.status === 'ACTIVE');
  const progress =
    stages.length > 0 ? Math.round((completedCount / stages.length) * 100) : 0;

  return (
    <div className='space-y-4'>
      {/* Progress summary */}
      <Card>
        <CardContent className='py-4'>
          <div className='mb-2 flex items-center justify-between'>
            <span className='text-sm font-medium'>
              {completedCount} of {stages.length} stages completed
            </span>
            <Badge variant='outline'>{progress}%</Badge>
          </div>
          <div className='bg-muted h-2 w-full rounded-full'>
            <div
              className='bg-primary h-2 rounded-full transition-all duration-500'
              style={{ width: `${progress}%` }}
            />
          </div>
          {activeStage && (
            <p className='text-muted-foreground mt-2 text-xs'>
              Current:{' '}
              <span className='text-primary font-medium'>
                {activeStage.stage_name}
              </span>
            </p>
          )}
        </CardContent>
      </Card>

      {/* Stage timeline */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2 text-base'>
            <Route className='h-4 w-4' />
            Application Journey
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-0'>
            {stages
              .sort((a, b) => a.stage_order - b.stage_order)
              .map((stage, idx) => (
                <div key={stage.id} className='flex gap-3'>
                  {/* Timeline */}
                  <div className='flex flex-col items-center'>
                    <StatusIcon status={stage.status} />
                    {idx < stages.length - 1 && (
                      <div
                        className={`mt-1 w-0.5 flex-1 ${
                          stage.status === 'COMPLETED'
                            ? 'bg-green-500/30'
                            : 'bg-border'
                        }`}
                      />
                    )}
                  </div>

                  {/* Content */}
                  <div
                    className={`flex-1 pb-6 ${idx === stages.length - 1 ? 'pb-0' : ''}`}
                  >
                    <div className='flex items-start justify-between'>
                      <div>
                        <div className='flex items-center gap-2'>
                          <p
                            className={`text-sm font-medium ${STATUS_COLORS[stage.status]}`}
                          >
                            {stage.stage_name}
                          </p>
                          <Badge variant='outline' className='gap-1 text-xs'>
                            {STAGE_TYPE_ICONS[stage.stage_type]}
                          </Badge>
                          {stage.status === 'ACTIVE' && (
                            <Badge className='text-xs'>Active</Badge>
                          )}
                        </div>
                        {stage.description && (
                          <p className='text-muted-foreground mt-1 text-xs'>
                            {stage.description}
                          </p>
                        )}
                        {stage.completed_at && (
                          <p className='text-muted-foreground mt-1 text-xs'>
                            Completed{' '}
                            {new Date(stage.completed_at).toLocaleDateString()}
                            {stage.completed_by_name
                              ? ` by ${stage.completed_by_name}`
                              : ''}
                          </p>
                        )}
                        {stage.notes && (
                          <p className='text-muted-foreground mt-1 text-xs italic'>
                            Notes: {stage.notes}
                          </p>
                        )}
                        {stage.payment_amount && (
                          <p className='mt-1 text-xs'>
                            Amount: {stage.payment_currency || 'TZS'}{' '}
                            {Number(stage.payment_amount).toLocaleString()}
                          </p>
                        )}
                        {stage.scheduled_date && (
                          <p className='mt-1 text-xs'>
                            Scheduled:{' '}
                            {new Date(
                              stage.scheduled_date
                            ).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>

                    <StageActions
                      stage={stage}
                      onComplete={(notes) =>
                        completeMutation.mutate({ id: stage.id, notes })
                      }
                      onSkip={() => skipMutation.mutate(stage.id)}
                      isLoading={
                        completeMutation.isPending || skipMutation.isPending
                      }
                    />
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
