'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useClientApi from '@/lib/axios/clientSide';
import PageContainer from '@/components/layout/page-container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  ClipboardList,
  Clock,
  CheckCircle,
  XCircle,
  Plus,
  Search,
  MoreVertical
} from 'lucide-react';
import { Button } from '@/components/ui/button';
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
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  type StaffTask,
  type StaffTasksResponse,
  type TaskType,
  type TaskStatus,
  TASK_TYPE_OPTIONS,
  TASK_STATUS_OPTIONS
} from '@/features/staff-tasks/types';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface TaskFormData {
  task_type: TaskType;
  title: string;
  description: string;
  due_date: string;
}

const emptyForm: TaskFormData = {
  task_type: 'GENERAL',
  title: '',
  description: '',
  due_date: ''
};

export default function TasksPage() {
  const { api } = useClientApi();
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState<TaskFormData>(emptyForm);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { data, isLoading } = useQuery<StaffTasksResponse>({
    queryKey: ['staff-tasks'],
    queryFn: async () => {
      if (!api) throw new Error('API not initialized');
      const response = await api.get('/admin/staff-tasks/');
      return response.data;
    },
    enabled: !!api
  });

  const createTask = useMutation({
    mutationFn: async (formData: TaskFormData) => {
      if (!api) throw new Error('API not initialized');
      const payload = {
        ...formData,
        due_date: formData.due_date || null
      };
      const response = await api.post('/admin/staff-tasks/', payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-tasks'] });
      setCreateOpen(false);
      setForm(emptyForm);
      toast.success('Task created');
    },
    onError: () => toast.error('Failed to create task')
  });

  const updateTask = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: TaskStatus }) => {
      if (!api) throw new Error('API not initialized');
      const response = await api.patch(`/admin/staff-tasks/${id}/`, {
        status
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-tasks'] });
      toast.success('Task updated');
    },
    onError: () => toast.error('Failed to update task')
  });

  const allTasks = data?.results ?? [];
  const total = data?.count ?? 0;
  const pending = allTasks.filter((t) => t.status === 'PENDING').length;
  const inProgress = allTasks.filter((t) => t.status === 'IN_PROGRESS').length;
  const completed = allTasks.filter((t) => t.status === 'COMPLETED').length;

  const tasks = allTasks.filter((t) => {
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    if (
      searchQuery &&
      !t.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !t.description?.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !t.assigned_to_name?.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false;
    return true;
  });

  const typeLabel = (val: string) =>
    TASK_TYPE_OPTIONS.find((o) => o.value === val)?.label ?? val;

  const statusVariant: Record<
    string,
    'default' | 'secondary' | 'destructive' | 'outline'
  > = {
    PENDING: 'outline',
    IN_PROGRESS: 'default',
    COMPLETED: 'secondary',
    CANCELLED: 'destructive'
  };

  return (
    <PageContainer className='w-full'>
      <div className='w-full space-y-6'>
        <div className='flex w-full items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold'>Tasks</h1>
            <p className='text-muted-foreground'>
              Manage staff tasks and action items
            </p>
          </div>
          <Button
            onClick={() => {
              setForm(emptyForm);
              setCreateOpen(true);
            }}
          >
            <Plus className='mr-2 h-4 w-4' />
            New Task
          </Button>
        </div>

        <div className='grid grid-cols-1 gap-4 md:grid-cols-4'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Total</CardTitle>
              <ClipboardList className='text-muted-foreground h-4 w-4' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{total}</div>
              <p className='text-muted-foreground text-xs'>All tasks</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Pending</CardTitle>
              <Clock className='text-muted-foreground h-4 w-4' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{pending}</div>
              <p className='text-muted-foreground text-xs'>Not started</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>In Progress</CardTitle>
              <ClipboardList className='text-muted-foreground h-4 w-4' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{inProgress}</div>
              <p className='text-muted-foreground text-xs'>Active</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Completed</CardTitle>
              <CheckCircle className='text-muted-foreground h-4 w-4' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{completed}</div>
              <p className='text-muted-foreground text-xs'>Done</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className='flex gap-3'>
          <div className='relative flex-1'>
            <Search className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
            <Input
              placeholder='Search by title, description, or assignee...'
              className='pl-9'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className='w-[200px]'>
              <SelectValue placeholder='Filter by status' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Statuses</SelectItem>
              {TASK_STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Card>
          <CardContent className='p-0'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead className='w-[60px]'>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className='py-8 text-center'>
                      Loading tasks...
                    </TableCell>
                  </TableRow>
                ) : tasks.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className='text-muted-foreground py-8 text-center'
                    >
                      No tasks found.
                    </TableCell>
                  </TableRow>
                ) : (
                  tasks.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell>
                        <div>
                          <p className='font-medium'>{task.title}</p>
                          {task.description && (
                            <p className='text-muted-foreground max-w-[250px] truncate text-xs'>
                              {task.description}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant='outline'>
                          {typeLabel(task.task_type)}
                        </Badge>
                      </TableCell>
                      <TableCell>{task.assigned_to_name ?? '—'}</TableCell>
                      <TableCell>{task.student_name ?? '—'}</TableCell>
                      <TableCell>
                        <Badge
                          variant={statusVariant[task.status] ?? 'secondary'}
                        >
                          {task.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {task.due_date
                          ? format(new Date(task.due_date), 'MMM d, yyyy')
                          : '—'}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant='ghost'
                              size='icon'
                              className='h-7 w-7'
                            >
                              <MoreVertical className='h-3.5 w-3.5' />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align='end'>
                            {task.status === 'PENDING' && (
                              <DropdownMenuItem
                                onClick={() =>
                                  updateTask.mutate({
                                    id: task.id,
                                    status: 'IN_PROGRESS'
                                  })
                                }
                              >
                                Start Task
                              </DropdownMenuItem>
                            )}
                            {task.status === 'IN_PROGRESS' && (
                              <DropdownMenuItem
                                onClick={() =>
                                  updateTask.mutate({
                                    id: task.id,
                                    status: 'COMPLETED'
                                  })
                                }
                              >
                                Mark Complete
                              </DropdownMenuItem>
                            )}
                            {(task.status === 'PENDING' ||
                              task.status === 'IN_PROGRESS') && (
                              <DropdownMenuItem
                                onClick={() =>
                                  updateTask.mutate({
                                    id: task.id,
                                    status: 'CANCELLED'
                                  })
                                }
                                className='text-destructive'
                              >
                                Cancel
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Create Task Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className='max-w-md'>
          <DialogHeader>
            <DialogTitle>New Task</DialogTitle>
          </DialogHeader>
          <div className='space-y-4'>
            <div>
              <Label required>Title</Label>
              <Input
                placeholder='Task title...'
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
              />
            </div>
            <div className='grid grid-cols-2 gap-3'>
              <div>
                <Label required>Type</Label>
                <Select
                  value={form.task_type}
                  onValueChange={(val) =>
                    setForm((f) => ({
                      ...f,
                      task_type: val as TaskType
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TASK_TYPE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Due Date</Label>
                <Input
                  type='datetime-local'
                  value={form.due_date}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, due_date: e.target.value }))
                  }
                />
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => createTask.mutate(form)}
              disabled={!form.title.trim() || createTask.isPending}
            >
              {createTask.isPending ? 'Creating...' : 'Create Task'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
