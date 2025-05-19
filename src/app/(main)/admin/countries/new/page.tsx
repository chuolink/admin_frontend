'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ImageUpload } from '@/components/ui/image-upload';
import { z } from 'zod';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';

const countrySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().min(1, 'Description is required'),
  imgs: z.array(
    z.object({
      image: z.string().min(1, 'Image URL is required'),
      name: z.string().min(1, 'Image name is required')
    })
  ),
  benefits: z.array(
    z.object({
      title: z.string().min(1, 'Title is required'),
      description: z.string().min(1, 'Description is required'),
      img: z.string().min(1, 'Image URL is required')
    })
  ),
  faqs: z.array(
    z.object({
      title: z.string().min(1, 'Title is required'),
      paragraphs: z.array(z.string().min(1, 'Paragraph is required'))
    })
  ),
  testimonials: z.array(
    z.object({
      name: z.string().min(1, 'Name is required'),
      subtitle: z.string().min(1, 'Subtitle is required'),
      img: z.string().min(1, 'Image URL is required'),
      description: z.string().min(1, 'Description is required'),
      ratings: z.number().min(1).max(5)
    })
  ),
  reasons: z.array(z.string().min(1, 'Reason is required'))
});

type CountryFormValues = z.infer<typeof countrySchema> & {
  reasons: string[];
};

export default function NewCountryPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('basic');

  const form = useForm<CountryFormValues>({
    resolver: zodResolver(countrySchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      imgs: [],
      benefits: [],
      faqs: [],
      testimonials: [],
      reasons: []
    }
  });

  const {
    fields: imgFields,
    append: appendImg,
    remove: removeImg
  } = useFieldArray({
    control: form.control,
    name: 'imgs'
  });

  const {
    fields: benefitFields,
    append: appendBenefit,
    remove: removeBenefit
  } = useFieldArray({
    control: form.control,
    name: 'benefits'
  });

  const {
    fields: faqFields,
    append: appendFaq,
    remove: removeFaq
  } = useFieldArray({
    control: form.control,
    name: 'faqs'
  });

  const {
    fields: testimonialFields,
    append: appendTestimonial,
    remove: removeTestimonial
  } = useFieldArray({
    control: form.control,
    name: 'testimonials'
  });

  const createMutation = useMutation({
    mutationFn: async (values: CountryFormValues) => {
      const response = await axios.post('/api/countries', values);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Country created successfully');
      router.push('/admin/countries');
    },
    onError: (error: any) => {
      console.error('Create country error:', error);
      toast.error(error.response?.data?.message || 'Failed to create country');
    }
  });

  const onSubmit = async (values: CountryFormValues) => {
    try {
      await createMutation.mutateAsync(values);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  return (
    <PageContainer className='w-full'>
      <div className='w-full space-y-6'>
        {/* Header */}
        <div className='flex w-full items-center justify-between'>
          <div className='flex items-center gap-4'>
            <Button variant='outline' size='icon' onClick={() => router.back()}>
              <ArrowLeft className='h-4 w-4' />
            </Button>
            <div>
              <h1 className='text-3xl font-bold'>New Country</h1>
              <p className='text-muted-foreground'>
                Add a new country to the system
              </p>
            </div>
          </div>
          <div className='flex items-center gap-2'>
            <Button variant='outline' onClick={() => router.back()}>
              Cancel
            </Button>
            <Button
              onClick={form.handleSubmit(onSubmit)}
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? 'Creating...' : 'Create Country'}
            </Button>
          </div>
        </div>

        {/* Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className='w-full'
            >
              <TabsList className='grid w-full grid-cols-5'>
                <TabsTrigger value='basic'>Basic Info</TabsTrigger>
                <TabsTrigger value='images'>Images</TabsTrigger>
                <TabsTrigger value='benefits'>Benefits</TabsTrigger>
                <TabsTrigger value='content'>Content</TabsTrigger>
                <TabsTrigger value='why-chuolink'>Why Chuolink</TabsTrigger>
              </TabsList>

              {/* Basic Info Tab */}
              <TabsContent value='basic' className='mt-6'>
                <Card>
                  <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-6'>
                    <FormField
                      control={form.control}
                      name='name'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder='Enter country name'
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name='slug'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Slug</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder='Enter country slug'
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name='description'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder='Enter country description'
                              rows={4}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Images Tab */}
              <TabsContent value='images' className='mt-6'>
                <Card>
                  <CardHeader>
                    <CardTitle>Country Images</CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-6'>
                    {imgFields.map((field, index) => (
                      <div
                        key={field.id}
                        className='space-y-4 rounded-lg border p-4'
                      >
                        <div className='flex justify-between'>
                          <h3 className='font-medium'>Image {index + 1}</h3>
                          <Button
                            type='button'
                            variant='destructive'
                            size='icon'
                            onClick={() => removeImg(index)}
                          >
                            <Trash2 className='h-4 w-4' />
                          </Button>
                        </div>
                        <ImageUpload
                          label='Country Image'
                          onUploadComplete={(name, url) => {
                            form.setValue(`imgs.${index}.name`, name);
                            form.setValue(`imgs.${index}.image`, url);
                          }}
                        />
                      </div>
                    ))}
                    <Button
                      type='button'
                      variant='outline'
                      onClick={() => appendImg({ name: '', image: '' })}
                    >
                      <Plus className='mr-2 h-4 w-4' />
                      Add Image
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Benefits Tab */}
              <TabsContent value='benefits' className='mt-6'>
                <Card>
                  <CardHeader>
                    <CardTitle>Benefits</CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-6'>
                    {benefitFields.map((field, index) => (
                      <div
                        key={field.id}
                        className='space-y-4 rounded-lg border p-4'
                      >
                        <div className='flex justify-between'>
                          <h3 className='font-medium'>Benefit {index + 1}</h3>
                          <Button
                            type='button'
                            variant='destructive'
                            size='icon'
                            onClick={() => removeBenefit(index)}
                          >
                            <Trash2 className='h-4 w-4' />
                          </Button>
                        </div>
                        <FormField
                          control={form.control}
                          name={`benefits.${index}.title`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Title</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`benefits.${index}.description`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description</FormLabel>
                              <FormControl>
                                <Textarea {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <ImageUpload
                          label='Benefit Image'
                          onUploadComplete={(name, url) => {
                            form.setValue(`benefits.${index}.img`, url);
                          }}
                        />
                      </div>
                    ))}
                    <Button
                      type='button'
                      variant='outline'
                      onClick={() =>
                        appendBenefit({ title: '', description: '', img: '' })
                      }
                    >
                      <Plus className='mr-2 h-4 w-4' />
                      Add Benefit
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Content Tab */}
              <TabsContent value='content' className='mt-6'>
                <Card>
                  <CardHeader>
                    <CardTitle>FAQs & Testimonials</CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-6'>
                    {/* FAQs Section */}
                    <div className='space-y-4'>
                      <h3 className='font-medium'>FAQs</h3>
                      {faqFields.map((field, index) => (
                        <div
                          key={field.id}
                          className='space-y-4 rounded-lg border p-4'
                        >
                          <div className='flex justify-between'>
                            <h4 className='font-medium'>FAQ {index + 1}</h4>
                            <Button
                              type='button'
                              variant='destructive'
                              size='icon'
                              onClick={() => removeFaq(index)}
                            >
                              <Trash2 className='h-4 w-4' />
                            </Button>
                          </div>
                          <FormField
                            control={form.control}
                            name={`faqs.${index}.title`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Question</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`faqs.${index}.paragraphs`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Answer</FormLabel>
                                <FormControl>
                                  <div className='space-y-2'>
                                    {field.value.map((paragraph, pIndex) => (
                                      <div key={pIndex} className='flex gap-2'>
                                        <Textarea
                                          value={paragraph}
                                          onChange={(e) => {
                                            const newParagraphs = [
                                              ...field.value
                                            ];
                                            newParagraphs[pIndex] =
                                              e.target.value;
                                            field.onChange(newParagraphs);
                                          }}
                                          placeholder={`Paragraph ${pIndex + 1}`}
                                        />
                                        <Button
                                          type='button'
                                          variant='destructive'
                                          size='icon'
                                          onClick={() => {
                                            const newParagraphs =
                                              field.value.filter(
                                                (_, i) => i !== pIndex
                                              );
                                            field.onChange(newParagraphs);
                                          }}
                                        >
                                          <Trash2 className='h-4 w-4' />
                                        </Button>
                                      </div>
                                    ))}
                                    <Button
                                      type='button'
                                      variant='outline'
                                      onClick={() => {
                                        field.onChange([...field.value, '']);
                                      }}
                                    >
                                      <Plus className='mr-2 h-4 w-4' />
                                      Add Paragraph
                                    </Button>
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      ))}
                      <Button
                        type='button'
                        variant='outline'
                        onClick={() =>
                          appendFaq({ title: '', paragraphs: [''] })
                        }
                      >
                        <Plus className='mr-2 h-4 w-4' />
                        Add FAQ
                      </Button>
                    </div>

                    {/* Testimonials Section */}
                    <div className='space-y-4'>
                      <h3 className='font-medium'>Testimonials</h3>
                      {testimonialFields.map((field, index) => (
                        <div
                          key={field.id}
                          className='space-y-4 rounded-lg border p-4'
                        >
                          <div className='flex justify-between'>
                            <h4 className='font-medium'>
                              Testimonial {index + 1}
                            </h4>
                            <Button
                              type='button'
                              variant='destructive'
                              size='icon'
                              onClick={() => removeTestimonial(index)}
                            >
                              <Trash2 className='h-4 w-4' />
                            </Button>
                          </div>
                          <FormField
                            control={form.control}
                            name={`testimonials.${index}.name`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`testimonials.${index}.subtitle`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Subtitle</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`testimonials.${index}.description`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Testimonial</FormLabel>
                                <FormControl>
                                  <Textarea {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`testimonials.${index}.ratings`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Rating (1-5)</FormLabel>
                                <FormControl>
                                  <Input
                                    type='number'
                                    min={1}
                                    max={5}
                                    {...field}
                                    onChange={(e) =>
                                      field.onChange(Number(e.target.value))
                                    }
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <ImageUpload
                            label='Profile Image'
                            onUploadComplete={(name, url) => {
                              form.setValue(`testimonials.${index}.img`, url);
                            }}
                          />
                        </div>
                      ))}
                      <Button
                        type='button'
                        variant='outline'
                        onClick={() =>
                          appendTestimonial({
                            name: '',
                            subtitle: '',
                            img: '',
                            description: '',
                            ratings: 5
                          })
                        }
                      >
                        <Plus className='mr-2 h-4 w-4' />
                        Add Testimonial
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Why Chuolink Tab */}
              <TabsContent value='why-chuolink' className='mt-6'>
                <Card>
                  <CardHeader>
                    <CardTitle>Why Chuolink Reasons</CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-6'>
                    <FormField
                      control={form.control}
                      name='reasons'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Reasons</FormLabel>
                          <FormControl>
                            <div className='space-y-4'>
                              {(field.value || []).map((reason, index) => (
                                <div key={index} className='flex gap-2'>
                                  <Textarea
                                    value={reason}
                                    onChange={(e) => {
                                      const newReasons = [...field.value];
                                      newReasons[index] = e.target.value;
                                      field.onChange(newReasons);
                                    }}
                                    placeholder={`Reason ${index + 1}`}
                                    rows={2}
                                  />
                                  <Button
                                    type='button'
                                    variant='destructive'
                                    size='icon'
                                    onClick={() => {
                                      const newReasons = field.value.filter(
                                        (_, i) => i !== index
                                      );
                                      field.onChange(newReasons);
                                    }}
                                  >
                                    <Trash2 className='h-4 w-4' />
                                  </Button>
                                </div>
                              ))}
                              <Button
                                type='button'
                                variant='outline'
                                onClick={() => {
                                  field.onChange([...field.value, '']);
                                }}
                              >
                                <Plus className='mr-2 h-4 w-4' />
                                Add Reason
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </form>
        </Form>
      </div>
    </PageContainer>
  );
}
