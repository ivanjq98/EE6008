'use client'

import { Milestone, Remark, Student } from '@prisma/client'

interface ExtendedRemark extends Remark {
  faculty: {
    user: {
      name: string
    }
  }
}

interface ExtendedMilestone extends Milestone {
  Remark: ExtendedRemark[]
  student: {
    user: {
      name: string
    }
  }
}

interface MilestoneListProps {
  milestones: ExtendedMilestone[]
}

export function MilestoneList({ milestones }: MilestoneListProps) {
  // Group milestones by student
  const milestonesByStudent = milestones.reduce(
    (acc, milestone) => {
      const studentName = milestone.student.user.name
      if (!acc[studentName]) {
        acc[studentName] = []
      }
      acc[studentName].push(milestone)
      return acc
    },
    {} as Record<string, ExtendedMilestone[]>
  )

  return (
    <div>
      <h2 className='mb-4 text-xl font-semibold'>Project Milestones</h2>
      {Object.keys(milestonesByStudent).length === 0 ? (
        <p>No milestones created yet.</p>
      ) : (
        Object.entries(milestonesByStudent).map(([studentName, studentMilestones]) => (
          <div key={studentName} className='mb-8'>
            <h3 className='mb-2 text-lg font-semibold'>{studentName}'s Milestones</h3>
            <ul className='space-y-4'>
              {studentMilestones.map((milestone) => (
                <li key={milestone.id} className='rounded-md border p-4'>
                  <h4 className='font-semibold'>Objective: {milestone.objective}</h4>
                  {milestone.description && <p className='text-gray-600'>Description: {milestone.description}</p>}
                  <p>Start Date: {new Date(milestone.startDate).toLocaleDateString()}</p>
                  <p>End Date: {new Date(milestone.endDate).toLocaleDateString()}</p>
                  <p>Status: {milestone.status}</p>
                  {milestone.Remark && milestone.Remark.length > 0 && (
                    <div className='mt-2'>
                      <h5 className='font-semibold'>Faculty Remarks:</h5>
                      {milestone.Remark.map((remark, index) => (
                        <p key={index} className='text-gray-600'>
                          <span className='font-medium'>{remark.faculty.user.name}:</span> {remark.remarks}
                        </p>
                      ))}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))
      )}
    </div>
  )
}
