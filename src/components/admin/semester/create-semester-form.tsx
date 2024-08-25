'use client'

import { Check, ChevronsUpDown, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useFieldArray, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import * as z from 'zod'

import { createSemester } from '@/src/app/actions/admin/semester'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/src/components/tabs'
import { Button } from '@/src/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/src/components/ui/command'
import DateTimePickerFormInput from '@/src/components/ui/date-time-picker-form-input'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/src/components/ui/form'
import { Input } from '@/src/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/src/components/ui/popover'
import { CreateSemesterDataFormSchema } from '@/src/lib/schema'
import { cn } from '@/src/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'

interface CreateSemesterFormProps {
  faculties: ({
    user: {
      id: string
      name: string
    }
  } & {
    id: string
    userId: string
    createdAt: Date
    updatedAt: Date
  })[]
}

export function CreateSemesterForm({ faculties }: CreateSemesterFormProps) {
  const defaultValues: Partial<z.infer<typeof CreateSemesterDataFormSchema>> = {
    programmeDetails: [
      {
        faculty: '',
        programmeName: 'Communications Engineering',
        programCode: '1'
      },
      {
        faculty: '',
        programmeName: 'Computer Control & Automation',
        programCode: '2'
      },
      {
        faculty: '',
        programmeName: 'Electronics',
        programCode: '3'
      },
      {
        faculty: '',
        programmeName: 'Power Engineering',
        programCode: '4'
      },
      {
        faculty: '',
        programmeName: 'Signal Processing',
        programCode: '5'
      }
    ],
    assessmentFormats: [
      {
        name: '',
        weightage: 0
      }
    ]
  }

  const router = useRouter()
  const form = useForm<z.infer<typeof CreateSemesterDataFormSchema>>({
    resolver: zodResolver(CreateSemesterDataFormSchema),
    defaultValues: defaultValues
  })

  async function onSubmit(data: z.infer<typeof CreateSemesterDataFormSchema>) {
    console.log("xinruixgao; onSubmit")
    // Calculate total weightage
    const totalWeightage = data.assessmentFormats.reduce((sum, format) => sum + (format.weightage || 0), 0)

    // Check if total weightage is exactly 100
    if (totalWeightage !== 100) {
      toast.error(`Total weightage must be exactly 100%. Current total: ${totalWeightage}%`)
      return // Prevent form submission
    }

    const result = await createSemester(data)
    if (result.status === 'ERROR') {
      toast.error(result.message)
    } else {
      toast.success(result.message)
      router.push(`/admin/semester?semester=${data.semesterName}`)
      router.refresh()
    }
  }

  const {
    fields: programmeFields,
    append: appendProgram,
    remove: removeProgram
  } = useFieldArray({
    name: 'programmeDetails',
    control: form.control
  })

  const {
    fields: assessmentFields,
    append: appendAssessment,
    remove: removeAssessment
  } = useFieldArray({
    name: 'assessmentFormats',
    control: form.control
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Tabs defaultValue='semester-setting'>
          <TabsList>
            <TabsTrigger value='semester-setting'>Semester Setting</TabsTrigger>
            <TabsTrigger value='timeline-setting'>Configure Timeline</TabsTrigger>
            <TabsTrigger value='programme-leader'>Programme Director (Delegate)</TabsTrigger>
            <TabsTrigger value='assessment-formats'>Assessment formats</TabsTrigger>
          </TabsList>
          <TabsContent value='semester-setting' className='max-w-2xl space-y-6'>
            <FormField
              control={form.control}
              name='semesterName'
              render={({ field }) => (
                <FormItem className='flex flex-col space-y-4'>
                  <FormLabel>Semester name</FormLabel>
                  <FormControl>
                    <Input placeholder='Input semester name' {...field} />
                  </FormControl>
                  <FormDescription>Must be in format of XXSY where X is start year and Y is semester.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='minimumGroupSize'
              render={({ field }) => (
                <FormItem className='flex flex-col space-y-4'>
                  <FormLabel>Minimum group size</FormLabel>
                  <FormControl>
                    <Input placeholder='Enter minimum group size' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='maximumGroupSize'
              render={({ field }) => (
                <FormItem className='flex flex-col space-y-4'>
                  <FormLabel>Maximum group size</FormLabel>
                  <FormControl>
                    <Input placeholder='Enter maximum group size' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='projectApplicationsLimit'
              render={({ field }) => (
                <FormItem className='flex flex-col space-y-4'>
                  <FormLabel>Project Application Limit</FormLabel>
                  <FormControl>
                    <Input placeholder='Enter student registration limit' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>

          <TabsContent value='timeline-setting' className='max-w-2xl space-y-6'>
            <FormField
              control={form.control}
              name='facultyProposalSubmission'
              render={({ field }) => (
                <FormItem className='flex flex-col space-y-4'>
                  <FormLabel>Staff Proposal Submission</FormLabel>
                  <DateTimePickerFormInput value={field.value} onChange={field.onChange} />
                  <FormDescription>Period for when faculty member can submit proposals</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='facultyProposalReview'
              render={({ field }) => (
                <FormItem className='flex flex-col space-y-4'>
                  <FormLabel>Proposal Review</FormLabel>
                  <DateTimePickerFormInput value={field.value} onChange={field.onChange} />
                  <FormDescription>Period for when faculty member can submit proposals</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='studentRegistration'
              render={({ field }) => (
                <FormItem className='flex flex-col space-y-4'>
                  <FormLabel>Student Selection</FormLabel>
                  <DateTimePickerFormInput value={field.value} onChange={field.onChange} />
                  <FormDescription>Period for when students can select projects</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='markEntry'
              render={({ field }) => (
                <FormItem className='flex flex-col space-y-4'>
                  <FormLabel>Mark Entry</FormLabel>
                  <DateTimePickerFormInput value={field.value} onChange={field.onChange} />
                  <FormDescription>Period for when staff can mark entry</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='peerReview'
              render={({ field }) => (
                <FormItem className='flex flex-col space-y-4'>
                  <FormLabel>Peer review</FormLabel>
                  <DateTimePickerFormInput value={field.value} onChange={field.onChange} />
                  <FormDescription>Period for when students can do peer review</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>

          <TabsContent value='programme-leader'>
            <div className='space-y-4'>
              <div className='hidden gap-x-4 md:col-span-12 md:grid md:grid-cols-12'>
                <div className={cn('md:col-span-4 md:block')}>
                  <FormLabel>Faculty</FormLabel>
                </div>
                <div className={cn('md:col-span-5 md:block')}>
                  <FormLabel>Programme Name</FormLabel>
                </div>
                <div className={cn('md:col-span-2 md:block')}>
                  <FormLabel>Programme Code</FormLabel>
                </div>
              </div>
              {programmeFields.map((field, index) => (
                <div className='grid gap-x-4 md:grid-cols-12' key={field.id}>
                  <FormField
                    control={form.control}
                    name={`programmeDetails.${index}.faculty`}
                    render={({ field }) => (
                      <FormItem className='md:col-span-4'>
                        <div>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant='outline'
                                  role='combobox'
                                  className={cn(
                                    !field.value && 'text-muted-foreground',
                                    'flex w-full items-center justify-between'
                                  )}
                                >
                                  {field.value
                                    ? faculties.find((faculty) => faculty.id === field.value)?.user.name
                                    : 'Select faculty'}
                                  <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className='w-[300px] p-0'>
                              <Command>
                                <CommandInput placeholder='Search faculty...' />
                                <CommandList>
                                  <CommandEmpty>No faculty member found.</CommandEmpty>
                                  <CommandGroup>
                                    {faculties.map((faculty) => (
                                      <CommandItem
                                        value={faculty.user.name}
                                        key={faculty.user.id}
                                        onSelect={() => {
                                          form.setValue(`programmeDetails.${index}.faculty`, faculty.id)
                                        }}
                                      >
                                        <Check
                                          className={cn(
                                            'mr-2 h-4 w-4',
                                            faculty.user.name === field.value ? 'opacity-100' : 'opacity-0'
                                          )}
                                        />
                                        {faculty.user.name}
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`programmeDetails.${index}.programmeName`}
                    render={({ field }) => (
                      <FormItem className='md:col-span-5'>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`programmeDetails.${index}.programCode`}
                    render={({ field }) => (
                      <FormItem className='md:col-span-2'>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className='self-end md:col-span-1'>
                    <Button type='button' variant='outline' size='icon' onClick={() => removeProgram(index)}>
                      <Trash2 className='h-4 w-4' />
                    </Button>
                  </div>
                </div>
              ))}
              <div className='flex justify-center'>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  className='my-4'
                  onClick={() => appendProgram({ faculty: '', programmeName: '', programCode: '' })}
                >
                  Add Programme
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value='assessment-formats'>
            <div className='space-y-4'>
              <div className='hidden md:block'>
                <FormLabel>Assessment Format</FormLabel>
              </div>
              {assessmentFields.map((field, index) => (
                <div className='grid gap-x-4 md:grid-cols-12' key={field.id}>
                  <div className='md:col-span-4'>
                    <FormField
                      key={field.id}
                      control={form.control}
                      name={`assessmentFormats.${index}.name`}
                      render={({ field }) => (
                        <FormItem className='md:col-span-4'>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className='md:col-span-2'>
                    <FormField
                      control={form.control}
                      name={`assessmentFormats.${index}.weightage`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              type='number'
                              min='0'
                              max='100'
                              {...field}
                              onChange={(e) => field.onChange(e.target.valueAsNumber)}
                              placeholder='Weightage %'
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className='md:col-span-1'>
                    <Button type='button' variant='outline' size='icon' onClick={() => removeAssessment(index)}>
                      <Trash2 className='h-4 w-4' />
                    </Button>
                  </div>
                </div>
              ))}

              <div className='flex justify-center'>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  className='my-4'
                  onClick={() => appendAssessment({ name: '', weightage: 0 })}
                >
                  Add Assessment Format
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <Button className='mt-4' type='submit'>
          Submit
        </Button>
      </form>
    </Form>
  )
}
