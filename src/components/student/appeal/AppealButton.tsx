'use client'

import React, { useState } from 'react'
import { Button } from '@/src/components/ui/button'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/src/components/ui/dialog'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/components/ui/select'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

interface Project {
  id: string
  projectCode: string
  title: string
  description: string
  programme: string
  faculty: string
}

interface AppealButtonProps {
  studentId: string
  currentProjectId: string
  availableProjects: Project[]
}

interface AppealFormData {
  requestedProjectId: string
  reason: string
}

async function createAppeal(data: AppealFormData & { studentId: string; currentProjectId: string }) {
  const response = await fetch('/api/student/my-project', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })

  if (!response.ok) {
    const errorData = await response.text()
    console.error('Error response:', errorData)
    throw new Error(errorData || 'Failed to submit appeal')
  }

  return response.json()
}

export const AppealButton: React.FC<AppealButtonProps> = ({ studentId, currentProjectId, availableProjects }) => {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const form = useForm<AppealFormData>({
    defaultValues: {
      requestedProjectId: '',
      reason: ''
    }
  })

  const onSubmit = async (data: AppealFormData) => {
    console.log('Submitting appeal data:', { ...data, studentId, currentProjectId })

    try {
      const result = await createAppeal({ ...data, studentId, currentProjectId })

      console.log('Appeal submitted successfully:', result)
      toast.success('Your appeal has been successfully submitted.')
      setIsOpen(false)
      form.reset()
      router.refresh()
      // Optionally, redirect to a specific page
      router.push('/student/appeals')
    } catch (error) {
      console.error('Error submitting appeal:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to submit appeal. Please try again.')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant='outline'
          className='mt-2 inline-flex justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'
        >
          Submit Appeal To Change Project
        </Button>
      </DialogTrigger>
      <p className='mt-2 text-sm text-gray-600'>Note: You can only submit a total of 3 appeal requests.</p>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Submit Appeal</DialogTitle>
          <DialogDescription>Enter the details for your project allocation appeal.</DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className='grid gap-4 py-4'>
            <div className='grid grid-cols-4 items-center gap-4'>
              <Label htmlFor='requestedProjectId' className='text-right'>
                Requested Project
              </Label>
              <Select
                onValueChange={(value) => form.setValue('requestedProjectId', value)}
                value={form.watch('requestedProjectId')}
              >
                <SelectTrigger className='col-span-3'>
                  <SelectValue placeholder='Select a project' />
                </SelectTrigger>
                <SelectContent>
                  {availableProjects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.projectCode} - {project.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className='grid grid-cols-4 items-center gap-4'>
              <Label htmlFor='reason' className='text-right'>
                Reason
              </Label>
              <Input id='reason' {...form.register('reason')} className='col-span-3' />
            </div>
          </div>
          <DialogFooter>
            <Button type='submit'>Submit Appeal</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
