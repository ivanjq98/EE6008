'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import * as z from 'zod'

import { addProject } from '@/src/app/actions/common/project'
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
import { AddProjectFormSchema } from '@/src/lib/schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { Venue } from '@prisma/client'

type ProposalFormValues = z.infer<typeof AddProjectFormSchema>

interface AddProjectFormProps {
  semesterId: string
  programmeOptions: string[]
  venueOptions: Venue[]
}

export function milestoneForm({ semesterId, programmeOptions, venueOptions }: AddProjectFormProps) {
  const router = useRouter()
  const session = useSession()
  const user = session?.data?.user

  const form = useForm<ProposalFormValues>({
    resolver: zodResolver(AddProjectFormSchema),
    defaultValues: {
      title: '',
      semesterId
    }
  })

  async function onSubmit(values: z.infer<typeof AddProjectFormSchema>) {
    if (!user?.facultyId) return
    const response = await addProject(values, user.facultyId)
    if (response.status === 'ERROR') {
      toast.error(response.message)
    } else {
      toast.success(response.message)
      router.push(`/faculty/my-proposal`)
      router.refresh()
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
        <FormField
          control={form.control}
          name='semesterId'
          render={({ field }) => (
            <FormItem className='m-0 hidden'>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='title'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>This is your project title.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='programme'
          render={({ field }) => (
            <FormItem className='md:col-span-2'>
              <FormLabel>Programme</FormLabel>
              <Select onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {programmeOptions.map((programme) => (
                    <SelectItem key={programme} value={programme}>
                      {programme}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='venueId'
          render={({ field }) => (
            <FormItem className='md:col-span-2'>
              <FormLabel>Venue</FormLabel>
              <Select onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectGroup className='max-h-[10rem] overflow-y-auto'>
                    {venueOptions.map(({ id, name, location }) => (
                      <SelectItem key={id} value={id}>
                        {name} - {location}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='description'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder='Enter a short summary of your project'
                  className='h-[300px] resize-none'
                  {...field}
                />
              </FormControl>
              <FormDescription>Max 1000 characters are allowed</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type='submit'>Submit</Button>
      </form>
    </Form>
  )
}
