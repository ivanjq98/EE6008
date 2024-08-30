'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import { createRemark } from '@/src/server/data/remark'

// Define the form schema
const RemarkFormSchema = z.object({
  remarks: z.string().min(1, 'Remark is required').max(500, 'Remark must be 500 characters or less')
})

type RemarkFormData = z.infer<typeof RemarkFormSchema>

interface FacultyRemarkFormProps {
  milestoneId: string
}

export function FacultyRemarkForm({ milestoneId }: FacultyRemarkFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<RemarkFormData>({
    resolver: zodResolver(RemarkFormSchema),
    defaultValues: {
      remarks: ''
    }
  })

  async function onSubmit(data: RemarkFormData) {
    setIsSubmitting(true)
    try {
      console.log('Submitting remark:', { ...data, milestoneId })
      const result = await createRemark({ ...data, milestoneId })

      if (result.status === 'ERROR') {
        toast.error(result.message)
      } else {
        toast.success('Remark submitted successfully')
        form.reset()
        router.refresh()
      }
    } catch (error) {
      console.error('Error submitting remark:', error)
      toast.error('Failed to submit remark. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className='mt-4 space-y-4'>
      <div>
        <label htmlFor='remarks' className='block text-sm font-medium text-gray-700'>
          Remarks
        </label>
        <textarea
          id='remarks'
          {...form.register('remarks')}
          className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50'
          rows={3}
        />
        {form.formState.errors.remarks && (
          <p className='mt-1 text-sm text-red-600'>{form.formState.errors.remarks.message}</p>
        )}
      </div>
      <button
        type='submit'
        disabled={isSubmitting}
        className='inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'
      >
        {isSubmitting ? 'Submitting...' : 'Submit Remark'}
      </button>
    </form>
  )
}
