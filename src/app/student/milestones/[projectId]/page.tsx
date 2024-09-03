'use client'

import { useState, useEffect, useCallback } from 'react'
import { notFound, redirect } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { StudentMilestoneForm } from './StudentMilestoneForm'
import { MilestoneList } from './MilestoneList'
import { fetchProject, fetchMilestones } from '@/src/server/data/milestone'

interface PageProps {
  params: { projectId: string }
}

interface Milestone {
  student: {
    user: { name: string }
    id: string
    userId: string
    projectId: string | null
    createdAt: Date
    updatedAt: Date
    matriculationNumber: string
  }
  Remark: {
    faculty: {
      user: { name: string }
    }
  }[]
}

const StudentMilestonePage = ({ params }: PageProps) => {
  const { data: session, status } = useSession()
  const [project, setProject] = useState<{ id: string; title: string } | null>(null)
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadProjectAndMilestones = useCallback(async () => {
    setIsLoading(true)
    try {
      const projectData = await fetchProject(params.projectId)
      setProject(projectData)
      const milestonesData = await fetchMilestones(params.projectId)
      setMilestones(milestonesData)
      setError(null)
    } catch (err) {
      console.error('Error fetching project and milestones:', err)
      setError('An error occurred while loading the project. Please try again later.')
    } finally {
      setIsLoading(false)
    }
  }, [params.projectId])

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.studentId) {
      loadProjectAndMilestones()
    } else if (status === 'unauthenticated') {
      redirect('/login')
    }
  }, [status, session, loadProjectAndMilestones])

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (error) {
    return (
      <div className='container mx-auto p-4'>
        <h1 className='mb-4 text-2xl font-bold'>Error</h1>
        <p>{error}</p>
      </div>
    )
  }

  if (!project) {
    notFound()
  }

  return (
    <div className='container mx-auto p-4'>
      <h1 className='mb-4 text-2xl font-bold'>{project.title}</h1>
      <MilestoneList milestones={milestones} onMilestoneUpdate={loadProjectAndMilestones} />
      <div className='mt-8'>
        <h2 className='mb-4 text-xl font-semibold'>Create New Milestone</h2>
        <StudentMilestoneForm projectId={project.id} onMilestoneCreated={loadProjectAndMilestones} />
      </div>
    </div>
  )
}

export default StudentMilestonePage
