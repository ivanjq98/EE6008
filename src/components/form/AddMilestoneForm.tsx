'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import * as z from 'zod'

import { addMilestone } from '@/src/app/actions/common/milestone'
import { Button } from '@/src/components/ui/button'
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
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/src/components/ui/select'
import { Textarea } from '@/src/components/ui/textarea'
import { AddMilestoneFormSchema } from '@/src/lib/schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { Venue } from '@prisma/client'

type MilestoneFormValues = z.infer<typeof AddMilestoneFormSchema>

interface AddMilestoneFormProps {
  projectId: string
  statusOptions: string[]
}

export function AddMilestoneForm({ projectId, statusOptions }: AddMilestoneFormProps) {
  const router = useRouter()
  const session = useSession()
  const user = session?.data?.user

  const form = useForm<MilestoneFormValues>({
    resolver: zodResolver(AddMilestoneFormSchema),
    defaultValues: {
      objective: '',
      description: null,
      startAt: new Date(), // default to today's date
      endAt: new Date(), // default to today's date
      status: 'Pending'
    }
  })

  const formatDate = (date: Date | string): string => {
    if (typeof date === 'string') return date
    const d = new Date(date)
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`
  }

  async function onSubmit(values: MilestoneFormValues) {
    if (!user?.facultyId) return
    const response = await addMilestone(values, projectId)
    if (response.status === 'ERROR') {
      toast.error(response.message)
    } else {
      toast.success(response.message)
      router.push(`/milestones`)
      router.refresh()
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
        <FormField
          control={form.control}
          name='objective'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Objective</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>Minimum 2 characters required.</FormDescription>
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
                <Textarea placeholder='Enter a description of the milestone' className='resize-none' {...field} />
              </FormControl>
              <FormDescription>Optional description for the milestone.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='startAt'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Start Date</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type='text'
                  placeholder='DD/MM/YYYY'
                  value={formatDate(field.value)}
                  onChange={(e) => field.onChange(e.target.value)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='endAt'
          render={({ field }) => (
            <FormItem>
              <FormLabel>End Date</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type='text'
                  placeholder='DD/MM/YYYY'
                  value={formatDate(field.value)}
                  onChange={(e) => field.onChange(e.target.value)}
                />
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
                  {statusOptions.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type='submit'>Submit</Button>
      </form>
    </Form>
  )
}
