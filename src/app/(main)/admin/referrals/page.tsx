'use client';

import { DataTable } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate } from '@/lib/utils';
import { IconEye, IconFilter } from '@tabler/icons-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import useClientApi from '@/lib/axios/clientSide';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DateRangePicker } from '@/components/ui/date-range-picker';

const columns = [
  {
    header: 'ID',
    accessorKey: 'id'
  },
  {
    header: 'Referrer',
    accessorKey: 'referrer_name'
  },
  {
    header: 'Referred',
    accessorKey: 'referred_name'
  },
  {
    header: 'Status',
    accessorKey: 'status',
    cell: ({ row }) => (
      <Badge
        variant={
          row.original.status === 'completed'
            ? 'success'
            : row.original.status === 'pending'
              ? 'warning'
              : 'destructive'
        }
      >
        {row.original.status}
      </Badge>
    )
  },
  {
    header: 'Reward',
    accessorKey: 'reward_amount',
    cell: ({ row }) => formatCurrency(row.original.reward_amount)
  },
  {
    header: 'Date',
    accessorKey: 'created_at',
    cell: ({ row }) => formatDate(row.original.created_at)
  },
  {
    header: 'Actions',
    cell: ({ row }) => (
      <Dialog>
        <DialogTrigger asChild>
          <Button size='sm' variant='outline'>
            <IconEye className='h-4 w-4' />
          </Button>
        </DialogTrigger>
        <DialogContent className='max-w-3xl'>
          <DialogHeader>
            <DialogTitle>Referral Details</DialogTitle>
          </DialogHeader>
          <ReferralDetails referral={row.original} />
        </DialogContent>
      </Dialog>
    )
  }
];

function ReferralDetails({ referral }) {
  return (
    <div className='space-y-4'>
      <div className='grid grid-cols-2 gap-4'>
        <div>
          <h3 className='font-semibold'>Referrer Information</h3>
          <p>Name: {referral.referrer_name}</p>
          <p>Email: {referral.referrer_email}</p>
          <p>Phone: {referral.referrer_phone}</p>
        </div>
        <div>
          <h3 className='font-semibold'>Referred Student Information</h3>
          <p>Name: {referral.referred_name}</p>
          <p>Email: {referral.referred_email}</p>
          <p>Phone: {referral.referred_phone}</p>
        </div>
      </div>
      <div>
        <h3 className='font-semibold'>Referral Information</h3>
        <p>Status: {referral.status}</p>
        <p>Reward Amount: {formatCurrency(referral.reward_amount)}</p>
        <p>Date: {formatDate(referral.created_at)}</p>
        {referral.completed_at && (
          <p>Completed: {formatDate(referral.completed_at)}</p>
        )}
      </div>
      {referral.notes && (
        <div>
          <h3 className='font-semibold'>Notes</h3>
          <p className='whitespace-pre-wrap'>{referral.notes}</p>
        </div>
      )}
    </div>
  );
}

function ReferralFilters({ onFilterChange }) {
  const [filters, setFilters] = useState({
    status: '',
    dateRange: null,
    minReferrals: '',
    maxReferrals: '',
    minEarnings: '',
    maxEarnings: ''
  });

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className='mb-6 grid grid-cols-1 gap-4 md:grid-cols-6'>
      <div className='space-y-2'>
        <Label>Status</Label>
        <Select
          value={filters.status}
          onValueChange={(value) => handleFilterChange('status', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder='All Statuses' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value=''>All Statuses</SelectItem>
            <SelectItem value='active'>Active</SelectItem>
            <SelectItem value='inactive'>Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className='space-y-2'>
        <Label>Date Range</Label>
        <DateRangePicker
          value={filters.dateRange}
          onChange={(value) => handleFilterChange('dateRange', value)}
        />
      </div>

      <div className='space-y-2'>
        <Label>Min Referrals</Label>
        <Input
          type='number'
          placeholder='Min referrals'
          value={filters.minReferrals}
          onChange={(e) => handleFilterChange('minReferrals', e.target.value)}
        />
      </div>

      <div className='space-y-2'>
        <Label>Max Referrals</Label>
        <Input
          type='number'
          placeholder='Max referrals'
          value={filters.maxReferrals}
          onChange={(e) => handleFilterChange('maxReferrals', e.target.value)}
        />
      </div>

      <div className='space-y-2'>
        <Label>Min Earnings</Label>
        <Input
          type='number'
          placeholder='Min earnings'
          value={filters.minEarnings}
          onChange={(e) => handleFilterChange('minEarnings', e.target.value)}
        />
      </div>

      <div className='space-y-2'>
        <Label>Max Earnings</Label>
        <Input
          type='number'
          placeholder='Max earnings'
          value={filters.maxEarnings}
          onChange={(e) => handleFilterChange('maxEarnings', e.target.value)}
        />
      </div>
    </div>
  );
}

export default function ReferralsPage() {
  const { api } = useClientApi();
  const [referrals, setReferrals] = useState([]);
  const [filteredReferrals, setFilteredReferrals] = useState([]);
  const [stats, setStats] = useState({
    total_referrals: 0,
    total_earnings: 0,
    active_referrers: 0,
    average_earnings: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!api) return;
    try {
      const [referralsRes, statsRes] = await Promise.all([
        api.get('/api/v1/admin/referrals/'),
        api.get('/api/v1/admin/referrals/stats/')
      ]);
      setReferrals(referralsRes.data);
      setFilteredReferrals(referralsRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filters) => {
    let filtered = [...referrals];

    if (filters.status) {
      filtered = filtered.filter((r) => r.status === filters.status);
    }

    if (filters.dateRange) {
      const { from, to } = filters.dateRange;
      filtered = filtered.filter((r) => {
        const referralDate = new Date(r.created_at);
        return referralDate >= from && referralDate <= to;
      });
    }

    if (filters.minReferrals) {
      filtered = filtered.filter(
        (r) => r.total_referrals >= parseInt(filters.minReferrals)
      );
    }

    if (filters.maxReferrals) {
      filtered = filtered.filter(
        (r) => r.total_referrals <= parseInt(filters.maxReferrals)
      );
    }

    if (filters.minEarnings) {
      filtered = filtered.filter(
        (r) => r.total_earnings >= parseFloat(filters.minEarnings)
      );
    }

    if (filters.maxEarnings) {
      filtered = filtered.filter(
        (r) => r.total_earnings <= parseFloat(filters.maxEarnings)
      );
    }

    setFilteredReferrals(filtered);
  };

  useEffect(() => {
    fetchData();
  }, [api]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-3xl font-bold'>Referrals Management</h1>
      </div>

      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Total Referrals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.total_referrals}</div>
            <p className='text-muted-foreground text-xs'>All time referrals</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Total Earnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {formatCurrency(stats.total_earnings)}
            </div>
            <p className='text-muted-foreground text-xs'>
              Total referral earnings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Active Referrers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.active_referrers}</div>
            <p className='text-muted-foreground text-xs'>
              Currently active referrers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Average Earnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {formatCurrency(stats.average_earnings)}
            </div>
            <p className='text-muted-foreground text-xs'>Per active referrer</p>
          </CardContent>
        </Card>
      </div>

      <ReferralFilters onFilterChange={handleFilterChange} />

      <DataTable
        columns={columns}
        data={filteredReferrals}
        searchKey='referrer_name'
      />
    </div>
  );
}
