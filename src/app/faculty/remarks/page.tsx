'use client' // Add this to mark the component as a Client Component

import React, { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { toast } from 'sonner' // Assuming you use 'sonner' for notifications
import { useRouter } from 'next/navigation' // Updated import
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { prisma } from '@/src/lib/prisma' // Adjust the import based on your project structure
import { useSession } from 'next-auth/react'

const remarkSchema = z.object({
  remark: z.string().min(1, 'Remark is required')
})

type RemarkFormInputs = z.infer<typeof remarkSchema>

const FacultyRemarksPage: React.FC = () => {
  const { data: session } = useSession()
  const router = useRouter()
  const [projects, setProjects] = useState([])
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [milestones, setMilestones] = useState<any[]>([])
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string | null>(null)
  const [selectedMilestone, setSelectedMilestone] = useState<any>(null)

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors }
  } = useForm<RemarkFormInputs>({
    resolver: zodResolver(remarkSchema)
  })

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const fetchedProjects = await prisma.project.findMany({
          where: { facultyId: session?.user?.id } // Fetch projects for the logged-in faculty
        })
        setProjects(fetchedProjects)
      } catch (error) {
        console.error('Failed to fetch projects:', error)
      }
    }

    fetchProjects()
  }, [session?.user?.id])

  useEffect(() => {
    const fetchMilestones = async () => {
      if (selectedProjectId) {
        try {
          const fetchedMilestones = await prisma.milestone.findMany({
            where: { projectId: selectedProjectId }
          })
          setMilestones(fetchedMilestones)
        } catch (error) {
          console.error('Failed to fetch milestones:', error)
        }
      }
    }

    fetchMilestones()
  }, [selectedProjectId])

  useEffect(() => {
    const fetchMilestoneDetails = async () => {
      if (selectedMilestoneId) {
        try {
          const fetchedMilestone = await prisma.milestone.findUnique({
            where: { id: selectedMilestoneId }
          })
          if (fetchedMilestone) {
            setSelectedMilestone(fetchedMilestone)
            reset({ remark: '' })
          }
        } catch (error) {
          console.error('Failed to fetch milestone details:', error)
        }
      }
    }

    fetchMilestoneDetails()
  }, [selectedMilestoneId, reset])

  const onSubmit = async (data: RemarkFormInputs) => {
    try {
      if (selectedMilestoneId) {
        await prisma.milestone.update({
          where: { id: selectedMilestoneId },
          data: {
            remarks: data.remark
          }
        })
        toast.success('Remark added successfully')
        setSelectedMilestone(null) // Clear the selected milestone
      }
    } catch (error) {
      console.error('Failed to add remark:', error)
      toast.error('Failed to add remark')
    }
  }

  return (
    <div className='container mx-auto p-4'>
      <h1 className='mb-4 text-2xl font-bold'>Add Remarks</h1>

      {/* Project Selection */}
      <div className='mb-4'>
        <label htmlFor='project' className='block text-sm font-medium text-gray-700'>
          Select Project
        </label>
        <select
          id='project'
          value={selectedProjectId || ''}
          onChange={(e) => setSelectedProjectId(e.target.value)}
          className='mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
        >
          <option value=''>Select a project</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.title}
            </option>
          ))}
        </select>
      </div>

      {/* Milestone Selection */}
      {selectedProjectId && (
        <div className='mb-4'>
          <label htmlFor='milestone' className='block text-sm font-medium text-gray-700'>
            Select Milestone
          </label>
          <select
            id='milestone'
            value={selectedMilestoneId || ''}
            onChange={(e) => setSelectedMilestoneId(e.target.value)}
            className='mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
          >
            <option value=''>Select a milestone</option>
            {milestones.map((milestone) => (
              <option key={milestone.id} value={milestone.id}>
                {milestone.objective}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Remark Form */}
      {selectedMilestone && (
        <div>
          <h2 className='mb-4 text-xl font-semibold'>Remarks for: {selectedMilestone.objective}</h2>
          <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
            <div>
              <label htmlFor='objective' className='block text-sm font-medium text-gray-700'>
                Objective
              </label>
              <input
                id='objective'
                value={selectedMilestone.objective}
                readOnly
                className='mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
              />
            </div>

            <div>
              <label htmlFor='description' className='block text-sm font-medium text-gray-700'>
                Description
              </label>
              <textarea
                id='description'
                value={selectedMilestone.description || ''}
                readOnly
                className='mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
              />
            </div>

            <div>
              <label htmlFor='remark' className='block text-sm font-medium text-gray-700'>
                Remark
              </label>
              <Controller
                name='remark'
                control={control}
                render={({ field }) => (
                  <textarea
                    id='remark'
                    {...field}
                    className='mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
                  />
                )}
              />
              {errors.remark && <p className='text-sm text-red-600'>{errors.remark.message}</p>}
            </div>

            <button
              type='submit'
              className='inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'
            >
              Submit Remark
            </button>
          </form>
        </div>
      )}
    </div>
  )
}

export default FacultyRemarksPage
