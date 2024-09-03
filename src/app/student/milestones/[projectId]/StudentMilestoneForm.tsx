'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import * as z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

import { Button } from '@/src/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/src/components/ui/form'
import { Input } from '@/src/components/ui/input'
import { Textarea } from '@/src/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/components/ui/select'
import { createMilestone } from '@/src/server/data/milestone'

const MilestoneStatus = z.enum(['NOT_STARTED', 'STARTED', 'NEARLY_HALF', 'HALF_WAY_THERE', 'ALMOST_DONE', 'COMPLETED'])

const MilestoneFormSchema = z.object({
  objective: z.string().min(1, 'Objective is required'),
  description: z.string().optional(),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  status: MilestoneStatus
})

type MilestoneFormData = z.infer<typeof MilestoneFormSchema>

interface StudentMilestoneFormProps {
  projectId: string
}

export function StudentMilestoneForm({ projectId }: StudentMilestoneFormProps) {
  const router = useRouter()
  const form = useForm<MilestoneFormData>({
    resolver: zodResolver(MilestoneFormSchema),
    defaultValues: {
      objective: '',
      description: '',
      startDate: '',
      endDate: '',
      status: 'NOT_STARTED'
    }
  })

  async function onSubmit(data: MilestoneFormData) {
    console.log('Submitting milestone data:', { ...data, projectId })

    try {
      const result = await createMilestone({ ...data, projectId })

      if (result.status === 'ERROR') {
        console.error('Error from server:', result.message)
        toast.error(result.message)
      } else {
        console.log('Milestone created successfully:', result)
        toast.success('Milestone created successfully!')
        router.refresh()
        form.reset()
        // Optionally, redirect to a specific page
        router.push(`/student/milestones/${projectId}`)
      }
    } catch (error) {
      console.error('Error creating milestone:', error)
      toast.error('Failed to create milestone. Please try again.')
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
        <FormField
          control={form.control}
          name='objective'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Objective</FormLabel>
              <FormControl>
                <Input placeholder='Enter milestone objective' {...field} />
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
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea placeholder='Enter milestone description' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='startDate'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Start Date</FormLabel>
              <FormControl>
                <Input type='date' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='endDate'
          render={({ field }) => (
            <FormItem>
              <FormLabel>End Date</FormLabel>
              <FormControl>
                <Input type='date' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='status'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder='Select status' />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value='NOT_STARTED'>Not Started (0%)</SelectItem>
                  <SelectItem value='STARTED'>Started (20%)</SelectItem>
                  <SelectItem value='NEARLY_HALF'>Nearly Half (40%)</SelectItem>
                  <SelectItem value='HALF_WAY_THERE'>Half Way There (60%)</SelectItem>
                  <SelectItem value='ALMOST_DONE'>Almost Done (80%)</SelectItem>
                  <SelectItem value='COMPLETED'>Completed (100%)</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type='submit'>Submit Milestone</Button>
      </form>
    </Form>
  )
}
