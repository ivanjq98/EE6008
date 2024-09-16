'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface AppealFormProps {
  currentProjectId: string
  availableProjects: any[] // Replace with proper type
  studentId: string
}

export function AppealForm({ currentProjectId, availableProjects, studentId }: AppealFormProps) {
  const [requestedProjectId, setRequestedProjectId] = useState('')
  const [reason, setReason] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const response = await fetch('/api/student/appeal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          currentProjectId,
          requestedProjectId,
          reason
        })
      })
      if (response.ok) {
        router.push('/student/my-project')
      } else {
        throw new Error('Failed to submit appeal')
      }
    } catch (error) {
      console.error('Error submitting appeal:', error)
      // Handle error (e.g., show error message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <select value={requestedProjectId} onChange={(e) => setRequestedProjectId(e.target.value)} required>
        <option value=''>Select a project</option>
        {availableProjects.map((project) => (
          <option key={project.id} value={project.id}>
            {project.title} - {project.faculty.user.name}({project.students.length}/{project.programme.maximumGroupSize}{' '}
            students)
          </option>
        ))}
      </select>
      <textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder='Reason for appeal' required />
      <button type='submit' disabled={isLoading}>
        {isLoading ? 'Submitting...' : 'Submit Appeal'}
      </button>
    </form>
  )
}
