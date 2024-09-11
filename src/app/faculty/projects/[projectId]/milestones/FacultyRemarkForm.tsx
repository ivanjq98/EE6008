'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import { createRemark, updateRemark, fetchRemarkByMilestoneId } from '@/src/server/data/remark'

const RemarkFormSchema = z.object({
  remarks: z.string().min(1, 'Remark is required').max(500, 'Remark must be 500 characters or less')
})

type RemarkFormData = z.infer<typeof RemarkFormSchema>

interface FacultyRemarkFormProps {
  milestoneId: string
}

// Define a type for the remark data
type RemarkData = {
  id: string
  remarks: string
  milestoneId: string
  facultyId: string
  createdAt: Date
  updatedAt: Date
}

export function FacultyRemarkForm({ milestoneId }: FacultyRemarkFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [existingRemark, setExistingRemark] = useState<RemarkData | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  const form = useForm<RemarkFormData>({
    resolver: zodResolver(RemarkFormSchema),
    defaultValues: {
      remarks: ''
    }
  })

  const fetchExistingRemark = useCallback(async () => {
    try {
      const remark = await fetchRemarkByMilestoneId(milestoneId)
      if (remark) {
        setExistingRemark(remark)
        form.setValue('remarks', remark.remarks)
      }
    } catch (error) {
      console.error('Error fetching existing remark:', error)
      toast.error('Failed to load existing remark. Please try again.')
    }
  }, [milestoneId, form, fetchRemarkByMilestoneId])

  useEffect(() => {
    fetchExistingRemark()
  }, [fetchExistingRemark])

  async function onSubmit(data: RemarkFormData) {
    setIsSubmitting(true)
    try {
      let result
      if (existingRemark) {
        result = await updateRemark(existingRemark.id, { remarks: data.remarks })
      } else {
        result = await createRemark({ remarks: data.remarks, milestoneId })
      }

      if (result.status === 'ERROR') {
        toast.error(result.message)
      } else {
        toast.success(existingRemark ? 'Remark updated successfully' : 'Remark submitted successfully')
        form.reset()
        router.refresh()
        setIsEditing(false)
        if (!existingRemark && result.data) {
          setExistingRemark(result.data as RemarkData)
        }
      }
    } catch (error) {
      console.error('Error submitting remark:', error)
      toast.error(`Failed to ${existingRemark ? 'update' : 'submit'} remark. Please try again.`)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (existingRemark && !isEditing) {
    return (
      <div className='mt-4'>
        <p className='text-sm text-gray-600'>{existingRemark.remarks}</p>
        <button
          onClick={() => setIsEditing(true)}
          className='mt-2 inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'
        >
          Edit Remark
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className='mt-4 space-y-4'>
      <div>
        <label htmlFor='remarks' className='block text-sm font-medium text-gray-700'>
          Remark
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
        {isSubmitting ? 'Submitting...' : existingRemark ? 'Update Remark' : 'Submit Remark'}
      </button>
      {isEditing && (
        <button
          type='button'
          onClick={() => {
            form.reset({ remarks: existingRemark?.remarks || '' })
            setIsEditing(false)
          }}
          className='ml-2 inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'
        >
          Cancel
        </button>
      )}
    </form>
  )
}
