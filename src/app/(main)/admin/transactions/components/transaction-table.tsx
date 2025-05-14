'use client';

import { DataTable } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { IconCheck, IconX, IconEdit, IconTrash } from '@tabler/icons-react';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Transaction, TransactionStatus } from '@/types';
import { useTransactions } from '@/hooks/use-transactions';

interface TransactionTableProps {
  data: Transaction[];
}

export function TransactionTable({ data }: TransactionTableProps) {
  const {
    approveTransaction,
    rejectTransaction,
    updateTransaction,
    deleteTransaction,
    isApproving,
    isRejecting,
    isUpdating,
    isDeleting
  } = useTransactions();

  const columns = [
    {
      header: 'ID',
      accessorKey: 'id'
    },
    {
      header: 'Student',
      accessorKey: 'student_name'
    },
    {
      header: 'Amount',
      accessorKey: 'amount',
      cell: ({ row }: { row: { original: Transaction } }) =>
        formatCurrency(row.original.amount)
    },
    {
      header: 'Type',
      accessorKey: 'transaction_type',
      cell: ({ row }: { row: { original: Transaction } }) => {
        const type = row.original.transaction_type;
        return (
          <Badge
            variant={
              type === 'deposit'
                ? 'success'
                : type === 'withdrawal'
                  ? 'warning'
                  : 'default'
            }
          >
            {type}
          </Badge>
        );
      }
    },
    {
      header: 'Payment Method',
      accessorKey: 'payment_method',
      cell: ({ row }: { row: { original: Transaction } }) => {
        const method = row.original.payment_method;
        const details =
          method === 'bank'
            ? `${row.original.bank_name} - ${row.original.account_number}`
            : `${row.original.provider?.toUpperCase()} - ${row.original.phone_number}`;

        return (
          <div className='space-y-1'>
            <Badge variant={method === 'bank' ? 'default' : 'secondary'}>
              {method === 'bank' ? 'Bank Transfer' : 'Mobile Money'}
            </Badge>
            <p className='text-muted-foreground text-sm'>{details}</p>
          </div>
        );
      }
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: ({ row }: { row: { original: Transaction } }) => {
        const status = row.original.status;
        return (
          <Badge
            variant={
              status === 'completed'
                ? 'success'
                : status === 'pending'
                  ? 'warning'
                  : status === 'failed'
                    ? 'destructive'
                    : 'default'
            }
          >
            {status}
          </Badge>
        );
      }
    },
    {
      header: 'Date',
      accessorKey: 'created_at',
      cell: ({ row }: { row: { original: Transaction } }) =>
        formatDate(row.original.created_at)
    },
    {
      header: 'Actions',
      cell: ({ row }: { row: { original: Transaction } }) => {
        const [isEditOpen, setIsEditOpen] = useState(false);
        const [editData, setEditData] = useState<Transaction>(row.original);

        const handleEdit = () => {
          updateTransaction(
            { id: row.original.id, data: editData },
            {
              onSuccess: () => {
                setIsEditOpen(false);
                toast.success('Transaction updated successfully');
              },
              onError: () => {
                toast.error('Failed to update transaction');
              }
            }
          );
        };

        const handleDelete = () => {
          if (confirm('Are you sure you want to delete this transaction?')) {
            deleteTransaction(row.original.id, {
              onSuccess: () => {
                toast.success('Transaction deleted successfully');
              },
              onError: () => {
                toast.error('Failed to delete transaction');
              }
            });
          }
        };

        return (
          <div className='flex space-x-2'>
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
              <DialogTrigger asChild>
                <Button size='sm' variant='outline'>
                  <IconEdit className='h-4 w-4' />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Transaction</DialogTitle>
                </DialogHeader>
                <div className='space-y-4'>
                  <div className='space-y-2'>
                    <Label>Amount</Label>
                    <Input
                      type='number'
                      value={editData.amount}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          amount: Number(e.target.value)
                        })
                      }
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label>Status</Label>
                    <Select
                      value={editData.status}
                      onValueChange={(value: TransactionStatus) =>
                        setEditData({ ...editData, status: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='completed'>Completed</SelectItem>
                        <SelectItem value='pending'>Pending</SelectItem>
                        <SelectItem value='failed'>Failed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    onClick={handleEdit}
                    disabled={isUpdating}
                    className='w-full'
                  >
                    {isUpdating ? 'Updating...' : 'Update Transaction'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {row.original.status === 'pending' && (
              <>
                <Button
                  size='sm'
                  variant='outline'
                  className='text-green-600'
                  onClick={() => approveTransaction(row.original.id)}
                  disabled={isApproving}
                >
                  <IconCheck className='h-4 w-4' />
                </Button>
                <Button
                  size='sm'
                  variant='outline'
                  className='text-red-600'
                  onClick={() => rejectTransaction(row.original.id)}
                  disabled={isRejecting}
                >
                  <IconX className='h-4 w-4' />
                </Button>
              </>
            )}

            <Button
              size='sm'
              variant='outline'
              className='text-red-600'
              onClick={handleDelete}
              disabled={isDeleting}
            >
              <IconTrash className='h-4 w-4' />
            </Button>
          </div>
        );
      }
    }
  ];

  return <DataTable columns={columns} data={data} searchKey='student_name' />;
}
