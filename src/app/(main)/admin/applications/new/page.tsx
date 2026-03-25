'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import useClientApi from '@/lib/axios/clientSide';
import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { StudentPicker } from '@/components/student-picker';
import {
  UniversityPicker,
  CoursePicker,
  type PickerItem
} from '@/components/entity-multi-picker';
import {
  ArrowLeft,
  GraduationCap,
  Building2,
  BookOpen,
  Settings2,
  Loader2,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';

interface StudentInfo {
  id: string;
  name: string;
  email: string;
  educationLevel?: string;
}

export default function NewApplicationPage() {
  const router = useRouter();
  const { api } = useClientApi();

  // Form state
  const [student, setStudent] = useState<StudentInfo | null>(null);
  const [university, setUniversity] = useState<PickerItem[]>([]);
  const [courses, setCourses] = useState<PickerItem[]>([]);
  const [flowType, setFlowType] = useState<string>('LOCAL');
  const [budget, setBudget] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Current step
  const [step, setStep] = useState(1);

  const selectedUniversity = university[0] || null;

  // Reset courses when university changes
  useEffect(() => {
    setCourses([]);
  }, [selectedUniversity?.id]);

  // Create mutation
  const createApplication = useMutation({
    mutationFn: async () => {
      if (!api || !student || !selectedUniversity)
        throw new Error('Missing required fields');
      const payload = {
        student: student.id,
        university: selectedUniversity.id,
        course_ids: courses.map((c) => c.id),
        flow_type: flowType,
        budget: budget ? Number(budget) : 0,
        info: notes || '',
        status: 'PENDING'
      };
      const response = await api.post('/admin/applications/', payload);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success('Application created successfully');
      // Navigate to the new application
      router.push(`/admin/applications/${data.id}`);
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.detail ||
          error.response?.data?.message ||
          JSON.stringify(error.response?.data) ||
          'Failed to create application'
      );
    }
  });

  const canProceedToStep2 = !!student;
  const canProceedToStep3 = !!selectedUniversity;
  const canProceedToStep4 = courses.length > 0;
  const canSubmit = !!student && !!selectedUniversity && courses.length > 0;

  const handleSubmit = () => {
    if (!canSubmit) return;
    createApplication.mutate();
  };

  const steps = [
    { number: 1, label: 'Student', icon: GraduationCap, done: !!student },
    {
      number: 2,
      label: 'University',
      icon: Building2,
      done: !!selectedUniversity
    },
    { number: 3, label: 'Courses', icon: BookOpen, done: courses.length > 0 },
    { number: 4, label: 'Details', icon: Settings2, done: false }
  ];

  return (
    <PageContainer>
      <div className='mx-auto max-w-3xl space-y-6'>
        {/* Header */}
        <div className='flex items-center gap-3'>
          <Link href='/admin/applications'>
            <Button variant='ghost' size='icon'>
              <ArrowLeft className='h-4 w-4' />
            </Button>
          </Link>
          <div>
            <h1 className='text-2xl font-semibold tracking-tight'>
              New Application
            </h1>
            <p className='text-muted-foreground text-sm'>
              Create a university application for a student
            </p>
          </div>
        </div>

        {/* Step indicator */}
        <div className='flex items-center gap-2'>
          {steps.map((s, i) => (
            <div key={s.number} className='flex items-center gap-2'>
              <button
                onClick={() => setStep(s.number)}
                className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                  step === s.number
                    ? 'bg-primary text-primary-foreground'
                    : s.done
                      ? 'bg-green-500/10 text-green-500'
                      : 'bg-muted text-muted-foreground'
                }`}
              >
                {s.done && step !== s.number ? (
                  <CheckCircle2 className='h-3.5 w-3.5' />
                ) : (
                  <s.icon className='h-3.5 w-3.5' />
                )}
                {s.label}
              </button>
              {i < steps.length - 1 && (
                <ArrowRight className='text-muted-foreground h-3 w-3' />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Select Student */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <GraduationCap className='h-5 w-5' />
                Select Student
              </CardTitle>
              <CardDescription>
                Search for the student by name, email, or phone number
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <StudentPicker value={student} onChange={(s) => setStudent(s)} />

              {student && (
                <div className='rounded-lg border p-4'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='font-medium'>{student.name}</p>
                      <p className='text-muted-foreground text-sm'>
                        {student.email}
                      </p>
                    </div>
                    <Badge variant='secondary'>
                      {student.educationLevel || 'Student'}
                    </Badge>
                  </div>
                </div>
              )}

              <div className='flex justify-end'>
                <Button
                  onClick={() => setStep(2)}
                  disabled={!canProceedToStep2}
                >
                  Next: Select University
                  <ArrowRight className='ml-2 h-4 w-4' />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Select University */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Building2 className='h-5 w-5' />
                Select University
              </CardTitle>
              <CardDescription>
                Choose one university for this application
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <UniversityPicker
                value={university}
                onChange={(items) => {
                  // Only keep the last selected (single select behavior)
                  if (items.length > 1) {
                    setUniversity([items[items.length - 1]]);
                  } else {
                    setUniversity(items);
                  }
                }}
              />

              {selectedUniversity && (
                <div className='rounded-lg border p-4'>
                  <p className='font-medium'>{selectedUniversity.name}</p>
                  {selectedUniversity.subtitle && (
                    <p className='text-muted-foreground text-sm'>
                      {selectedUniversity.subtitle}
                    </p>
                  )}
                </div>
              )}

              <div className='flex justify-between'>
                <Button variant='outline' onClick={() => setStep(1)}>
                  <ArrowLeft className='mr-2 h-4 w-4' />
                  Back
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  disabled={!canProceedToStep3}
                >
                  Next: Select Courses
                  <ArrowRight className='ml-2 h-4 w-4' />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Select Courses */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <BookOpen className='h-5 w-5' />
                Select Courses
              </CardTitle>
              <CardDescription>
                Choose one or more courses offered at{' '}
                <span className='text-foreground font-medium'>
                  {selectedUniversity?.name}
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <CoursePicker
                value={courses}
                onChange={setCourses}
                universityId={selectedUniversity?.id}
              />

              {courses.length > 0 && (
                <div className='space-y-2'>
                  <Label className='text-muted-foreground text-xs tracking-wider uppercase'>
                    Selected Courses ({courses.length})
                  </Label>
                  <div className='space-y-1'>
                    {courses.map((course) => (
                      <div
                        key={course.id}
                        className='rounded-lg border px-3 py-2'
                      >
                        <p className='text-sm font-medium'>{course.name}</p>
                        {course.subtitle && (
                          <p className='text-muted-foreground text-xs'>
                            {course.subtitle}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className='flex justify-between'>
                <Button variant='outline' onClick={() => setStep(2)}>
                  <ArrowLeft className='mr-2 h-4 w-4' />
                  Back
                </Button>
                <Button
                  onClick={() => setStep(4)}
                  disabled={!canProceedToStep4}
                >
                  Next: Application Details
                  <ArrowRight className='ml-2 h-4 w-4' />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Application Details + Submit */}
        {step === 4 && (
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Settings2 className='h-5 w-5' />
                Application Details
              </CardTitle>
              <CardDescription>
                Set the flow type, budget, and any additional notes
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-5'>
              {/* Summary */}
              <div className='bg-muted/50 space-y-2 rounded-lg p-4'>
                <div className='flex items-center justify-between text-sm'>
                  <span className='text-muted-foreground'>Student</span>
                  <span className='font-medium'>{student?.name}</span>
                </div>
                <div className='flex items-center justify-between text-sm'>
                  <span className='text-muted-foreground'>University</span>
                  <span className='font-medium'>
                    {selectedUniversity?.name}
                  </span>
                </div>
                <div className='flex items-center justify-between text-sm'>
                  <span className='text-muted-foreground'>Courses</span>
                  <span className='font-medium'>{courses.length} selected</span>
                </div>
              </div>

              <Separator />

              <div className='space-y-4'>
                <div className='space-y-2'>
                  <Label>Flow Type *</Label>
                  <Select value={flowType} onValueChange={setFlowType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='LOCAL'>Local (Tanzania)</SelectItem>
                      <SelectItem value='ABROAD'>
                        Abroad (International)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className='text-muted-foreground text-xs'>
                    Determines the pipeline stages for this application
                  </p>
                </div>

                <div className='space-y-2'>
                  <Label>Budget (TZS)</Label>
                  <Input
                    type='number'
                    placeholder='e.g. 5000000'
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                  />
                </div>

                <div className='space-y-2'>
                  <Label>Notes</Label>
                  <Textarea
                    placeholder='Any additional notes about this application...'
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </div>

              <Separator />

              <div className='flex justify-between'>
                <Button variant='outline' onClick={() => setStep(3)}>
                  <ArrowLeft className='mr-2 h-4 w-4' />
                  Back
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!canSubmit || createApplication.isPending}
                  size='lg'
                >
                  {createApplication.isPending ? (
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  ) : (
                    <CheckCircle2 className='mr-2 h-4 w-4' />
                  )}
                  Create Application
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PageContainer>
  );
}
