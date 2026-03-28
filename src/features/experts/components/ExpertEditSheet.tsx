// @ts-nocheck
'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import useClientApi from '@/lib/axios/clientSide';
import { DataSheet } from '@/features/data-admin/components/DataSheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ExpertEditSheetProps {
  expert: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ExpertEditSheet({
  expert,
  open,
  onOpenChange
}: ExpertEditSheetProps) {
  const { api } = useClientApi();
  const queryClient = useQueryClient();

  const form = useForm({
    defaultValues: {
      job_title: '',
      institution: '',
      years_experience: 0,
      employment_type: '',
      highest_degree: '',
      message_rate: 0,
      call_rate_per_min: 0,
      group_subscription_price: 0,
      is_active: true,
      linkedin: '',
      twitter: '',
      github: '',
      website: '',
      portfolio: ''
    }
  });

  useEffect(() => {
    if (expert) {
      form.reset({
        job_title: expert.job_title || '',
        institution: expert.institution || '',
        years_experience: expert.years_experience || 0,
        employment_type: expert.employment_type || '',
        highest_degree: expert.highest_degree || '',
        message_rate: expert.message_rate || 0,
        call_rate_per_min: expert.call_rate_per_min || 0,
        group_subscription_price: expert.group_subscription_price || 0,
        is_active: expert.is_active ?? true,
        linkedin: expert.linkedin || '',
        twitter: expert.twitter || '',
        github: expert.github || '',
        website: expert.website || '',
        portfolio: expert.portfolio || ''
      });
    }
  }, [expert, form]);

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      if (!api) throw new Error('API not initialized');
      return api.patch(`/admin/experts/${expert.id}/`, data);
    },
    onSuccess: () => {
      toast.success('Expert updated successfully');
      queryClient.invalidateQueries({ queryKey: ['expert', expert.id] });
      queryClient.invalidateQueries({ queryKey: ['experts'] });
      onOpenChange(false);
    },
    onError: () => {
      toast.error('Failed to update expert');
    }
  });

  const onSubmit = (data: any) => {
    updateMutation.mutate(data);
  };

  return (
    <DataSheet
      open={open}
      onOpenChange={onOpenChange}
      title='Edit Expert Profile'
      description={expert?.user_name ? `Editing ${expert.user_name}` : ''}
      size='xl'
      footer={
        <div className='flex justify-end gap-2'>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={form.handleSubmit(onSubmit)}
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending && (
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
            )}
            Save Changes
          </Button>
        </div>
      }
    >
      <form className='space-y-6'>
        {/* Professional Info */}
        <div>
          <h3 className='mb-3 text-sm font-semibold'>Professional Info</h3>
          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label>Job Title</Label>
              <Input {...form.register('job_title')} />
            </div>
            <div className='space-y-2'>
              <Label>Institution</Label>
              <Input {...form.register('institution')} />
            </div>
            <div className='space-y-2'>
              <Label>Years of Experience</Label>
              <Input
                type='number'
                {...form.register('years_experience', { valueAsNumber: true })}
              />
            </div>
            <div className='space-y-2'>
              <Label>Employment Type</Label>
              <Select
                value={form.watch('employment_type')}
                onValueChange={(val) => form.setValue('employment_type', val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Select type' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='full_time'>Full Time</SelectItem>
                  <SelectItem value='part_time'>Part Time</SelectItem>
                  <SelectItem value='freelance'>Freelance</SelectItem>
                  <SelectItem value='contract'>Contract</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className='space-y-2'>
              <Label>Highest Degree</Label>
              <Input {...form.register('highest_degree')} />
            </div>
          </div>
        </div>

        <Separator />

        {/* Rates */}
        <div>
          <h3 className='mb-3 text-sm font-semibold'>Rates</h3>
          <div className='grid grid-cols-3 gap-4'>
            <div className='space-y-2'>
              <Label>Message Rate</Label>
              <Input
                type='number'
                step='0.01'
                {...form.register('message_rate', { valueAsNumber: true })}
              />
            </div>
            <div className='space-y-2'>
              <Label>Call Rate / Min</Label>
              <Input
                type='number'
                step='0.01'
                {...form.register('call_rate_per_min', { valueAsNumber: true })}
              />
            </div>
            <div className='space-y-2'>
              <Label>Group Sub. Price</Label>
              <Input
                type='number'
                step='0.01'
                {...form.register('group_subscription_price', {
                  valueAsNumber: true
                })}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Links */}
        <div>
          <h3 className='mb-3 text-sm font-semibold'>Links</h3>
          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label>LinkedIn</Label>
              <Input {...form.register('linkedin')} placeholder='https://' />
            </div>
            <div className='space-y-2'>
              <Label>Twitter</Label>
              <Input {...form.register('twitter')} placeholder='https://' />
            </div>
            <div className='space-y-2'>
              <Label>GitHub</Label>
              <Input {...form.register('github')} placeholder='https://' />
            </div>
            <div className='space-y-2'>
              <Label>Website</Label>
              <Input {...form.register('website')} placeholder='https://' />
            </div>
            <div className='space-y-2'>
              <Label>Portfolio</Label>
              <Input {...form.register('portfolio')} placeholder='https://' />
            </div>
          </div>
        </div>

        <Separator />

        {/* Status */}
        <div>
          <h3 className='mb-3 text-sm font-semibold'>Status</h3>
          <div className='flex items-center gap-3'>
            <Switch
              checked={form.watch('is_active')}
              onCheckedChange={(val) => form.setValue('is_active', val)}
            />
            <Label>Active</Label>
          </div>
        </div>
      </form>
    </DataSheet>
  );
}
