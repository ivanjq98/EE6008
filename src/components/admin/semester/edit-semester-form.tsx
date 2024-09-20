'use client'
import { Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, useFieldArray } from 'react-hook-form'
import { toast } from 'sonner'
import * as z from 'zod'

import { editSemester } from '@/src/app/actions/admin/semester'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/src/components/tabs'
import { Button } from '@/src/components/ui/button'
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
import { EditSemesterDataFormSchema } from '@/src/lib/schema'
import { zodResolver } from '@hookform/resolvers/zod'
import SingleDateTimeFormInput from '../../ui/single-date-picker-input'

const ExtendedEditSemesterDataFormSchema = EditSemesterDataFormSchema.extend({
  facultyRoleWeightages: z
    .object({
      SUPERVISOR: z.number().min(0).max(100),
      MODERATOR: z.number().min(0).max(100)
    })
    .refine((data) => data.SUPERVISOR + data.MODERATOR === 100, {
      message: 'Weightages must add up to 100%'
    })
})

type ExtendedEditSemesterDataFormType = z.infer<typeof ExtendedEditSemesterDataFormSchema>

export function EditSemesterForm({
  defaultValues,
  semesterName
}: {
  defaultValues?: ExtendedEditSemesterDataFormType
  semesterName: string
}) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<ExtendedEditSemesterDataFormType>({
    resolver: zodResolver(ExtendedEditSemesterDataFormSchema),
    defaultValues
  })

  const {
    fields: assessmentFields,
    append: appendAssessment,
    remove: removeAssessment
  } = useFieldArray({
    control: form.control,
    name: 'assessmentFormats'
  })

  async function onSubmit(data: ExtendedEditSemesterDataFormType) {
    setIsSubmitting(true)
    console.log('Submitting form data:', data)

    try {
      const weightageResponse = await fetch('/api/updateWeightages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data.facultyRoleWeightages)
      })

      console.log('Response status:', weightageResponse.status)
      console.log('Response headers:', Object.fromEntries(weightageResponse.headers.entries()))

      if (!weightageResponse.ok) {
        const responseText = await weightageResponse.text()
        console.error('Full response:', responseText)
        throw new Error(`Failed to update weightages: ${weightageResponse.status} ${weightageResponse.statusText}`)
      }

      const weightageResult = await weightageResponse.json()
      console.log('Weightages updated successfully:', weightageResult.data)

      // Update semester details
      const semesterResult = await editSemester(data)

      if (semesterResult.status === 'ERROR') {
        console.error('Error updating semester:', semesterResult.message)
        toast.error(semesterResult.message)
      } else {
        console.log('Semester updated successfully:', semesterResult)
        toast.success('Semester details and weightages updated successfully!')
        router.refresh()
        form.reset(data) // Reset form with new data
        router.push(`/admin/semester?semester=${semesterName}`)
      }
    } catch (error) {
      console.error('Error updating semester and weightages:', error)
      toast.error('Failed to update semester and weightages. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='mt-0 space-y-4'>
        <Tabs defaultValue='semester-setting'>
          <TabsList>
            <TabsTrigger value='semester-setting'>Semester Setting</TabsTrigger>
            <TabsTrigger value='timeline-setting'>Configure Timeline</TabsTrigger>
            <TabsTrigger value='assessment-formats'>Assessment Formats</TabsTrigger>
            <TabsTrigger value='faculty-weightages'>Faculty Weightages</TabsTrigger>
          </TabsList>
          <TabsContent value='semester-setting' className='max-w-2xl space-y-6'>
            <FormField
              control={form.control}
              name='minimumGroupSize'
              render={({ field }) => (
                <FormItem className='flex flex-col space-y-2'>
                  <FormLabel>Minimum group size</FormLabel>
                  <FormControl>
                    <Input placeholder='Enter minimum group size' {...field} />
                  </FormControl>
                  <FormDescription>The minimum number of students to form a group</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='maximumGroupSize'
              render={({ field }) => (
                <FormItem className='flex flex-col space-y-2'>
                  <FormLabel>Maximum group size</FormLabel>
                  <FormControl>
                    <Input placeholder='Enter maximum group size' {...field} />
                  </FormControl>
                  <FormDescription>The maximum number of students to form a group</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='projectApplicationsLimit'
              render={({ field }) => (
                <FormItem className='flex flex-col space-y-2'>
                  <FormLabel>Project Application Limit</FormLabel>
                  <FormControl>
                    <Input placeholder='Enter student registration limit' {...field} />
                  </FormControl>
                  <FormDescription>Number of projects student can register</FormDescription>
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
            <FormField
              control={form.control}
              name='studentResultRelease'
              render={({ field }) => (
                <FormItem className='flex flex-col space-y-4'>
                  <FormLabel>Student Mark Release</FormLabel>
                  <SingleDateTimeFormInput value={field.value} onChange={field.onChange} />
                  <FormDescription>Date when student results will be release</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>
          <TabsContent value='assessment-formats' className='max-w-2xl space-y-6'>
            <div className='space-y-4'>
              <div className='hidden gap-x-4 md:grid md:grid-cols-12'>
                <FormLabel className='md:col-span-4'>Assessment Format</FormLabel>
                <FormLabel className='md:col-span-2'>Total Weightage (100%)</FormLabel>
              </div>
              {assessmentFields.map((field, index) => (
                <div className='grid gap-x-4 md:grid-cols-12' key={field.id}>
                  <div className='md:col-span-4'>
                    <FormField
                      control={form.control}
                      name={`assessmentFormats.${index}.name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input {...field} placeholder='Format name' />
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
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={() => appendAssessment({ name: '', weightage: 0 })}
              >
                Add Assessment Format
              </Button>
            </div>
          </TabsContent>

          <TabsContent value='faculty-weightages' className='max-w-2xl space-y-6'>
            <FormField
              control={form.control}
              name='facultyRoleWeightages.SUPERVISOR'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Supervisor Weightage (%)</FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      {...field}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value)
                        field.onChange(value)
                        form.setValue('facultyRoleWeightages.MODERATOR', 100 - value)
                      }}
                    />
                  </FormControl>
                  <FormDescription>Weightage for the Supervisor role</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='facultyRoleWeightages.MODERATOR'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Moderator Weightage (%)</FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      {...field}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value)
                        field.onChange(value)
                        form.setValue('facultyRoleWeightages.SUPERVISOR', 100 - value)
                      }}
                    />
                  </FormControl>
                  <FormDescription>Weightage for the Moderator role</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormMessage>{form.formState.errors.facultyRoleWeightages?.root?.message}</FormMessage>
          </TabsContent>
        </Tabs>

        <Button type='submit' disabled={isSubmitting}>
          {isSubmitting ? 'Updating...' : 'Submit'}
        </Button>

        {/* Hidden form field for id */}
        <FormField
          control={form.control}
          name='semesterId'
          render={({ field }) => (
            <FormItem className='m-0 hidden'>
              <Input {...field} type='hidden' />
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  )
}
