'use client' // Add this to mark the component as a Client Component

import React, { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { toast } from 'sonner' // Assuming you use 'sonner' for notifications
import { useRouter } from 'next/navigation' // Updated import
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { prisma } from '@/src/lib/prisma' // Adjust the import based on your project structure
import { useSession } from 'next-auth/react'
import { milestoneSchema } from '@/src/lib/schema'

type MilestoneFormInputs = z.infer<typeof milestoneSchema>

const MilestonePage: React.FC = () => {
  const { data: session } = useSession()
  const router = useRouter()
  const [milestone, setMilestone] = useState<MilestoneFormInputs | null>(null)
  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors }
  } = useForm<MilestoneFormInputs>({
    resolver: zodResolver(milestoneSchema)
  })

  useEffect(() => {
    const fetchMilestone = async () => {
      const milestoneId = router.query.id as string

      if (milestoneId) {
        try {
          const fetchedMilestone = await prisma.milestone.findUnique({
            where: { id: milestoneId }
          })
          if (fetchedMilestone) {
            setMilestone(fetchedMilestone)
            reset(fetchedMilestone)
          }
        } catch (error) {
          console.error('Failed to fetch milestone:', error)
        }
      }
    }

    fetchMilestone()
  }, [router.query.id, reset])

  const onSubmit = async (data: MilestoneFormInputs) => {
    try {
      const milestoneId = router.query.id as string

      if (milestoneId) {
        await prisma.milestone.update({
          where: { id: milestoneId },
          data: {
            ...data
          }
        })
        toast.success('Milestone updated successfully')
      } else {
        await prisma.milestone.create({
          data: {
            ...data,
            studentId: session?.user?.id ?? '' // Ensure the student ID is correct
          }
        })
        toast.success('Milestone submitted successfully')
      }

      router.push('/milestones') // Redirect after submission
    } catch (error) {
      console.error('Failed to submit milestone:', error)
      toast.error('Failed to submit milestone')
    }
  }

  return (
    <div className='container mx-auto p-4'>
      <h1 className='mb-4 text-2xl font-bold'>{milestone ? 'Edit Milestone' : 'Submit Milestone'}</h1>
      <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
        <div>
          <label htmlFor='objective' className='block text-sm font-medium text-gray-700'>
            Objective
          </label>
          <input
            id='objective'
            type='text'
            {...register('objective')}
            className='mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
          />
          {errors.objective && <p className='text-sm text-red-600'>{errors.objective.message}</p>}
        </div>

        <div>
          <label htmlFor='description' className='block text-sm font-medium text-gray-700'>
            Description
          </label>
          <textarea
            id='description'
            {...register('description')}
            className='mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
          />
        </div>

        <div>
          <label htmlFor='startDate' className='block text-sm font-medium text-gray-700'>
            Start Date
          </label>
          <Controller
            name='startDate'
            control={control}
            render={({ field }) => (
              <input
                type='date'
                {...field}
                className='mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
              />
            )}
          />
          {errors.startDate && <p className='text-sm text-red-600'>{errors.startDate.message}</p>}
        </div>

        <div>
          <label htmlFor='endDate' className='block text-sm font-medium text-gray-700'>
            End Date
          </label>
          <Controller
            name='endDate'
            control={control}
            render={({ field }) => (
              <input
                type='date'
                {...field}
                className='mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
              />
            )}
          />
          {errors.endDate && <p className='text-sm text-red-600'>{errors.endDate.message}</p>}
        </div>

        <div>
          <label htmlFor='status' className='block text-sm font-medium text-gray-700'>
            Status
          </label>
          <select
            id='status'
            {...register('status')}
            className='mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
          >
            <option value='COMPLETED'>Completed</option>
            <option value='NOT_COMPLETED'>Not Completed</option>
          </select>
          {errors.status && <p className='text-sm text-red-600'>{errors.status.message}</p>}
        </div>

        <button
          type='submit'
          className='inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'
        >
          {milestone ? 'Update Milestone' : 'Submit Milestone'}
        </button>
      </form>
    </div>
  )
}

export default MilestonePage
