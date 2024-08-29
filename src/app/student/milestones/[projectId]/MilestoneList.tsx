'use client'

import { Milestone, Remark } from '@prisma/client'

interface ExtendedRemark extends Remark {
  faculty: {
    user: {
      name: string
    }
  }
}

interface ExtendedMilestone extends Milestone {
  Remark: ExtendedRemark[]
}

interface MilestoneListProps {
  milestones: ExtendedMilestone[]
}

export function MilestoneList({ milestones }: MilestoneListProps) {
  return (
    <div>
      <h2 className='mb-4 text-xl font-semibold'>Your Milestones</h2>
      {milestones.length === 0 ? (
        <p>No milestones created yet.</p>
      ) : (
        <ul className='space-y-4'>
          {milestones.map((milestone) => (
            <li key={milestone.id} className='rounded-md border p-4'>
              <h2 className='font-semibold'>Objective: {milestone.objective}</h2>
              {milestone.description && <p className='text-gray-600'>Description: {milestone.description}</p>}
              <p>Start Date: {new Date(milestone.startDate).toLocaleDateString()}</p>
              <p>End Date: {new Date(milestone.endDate).toLocaleDateString()}</p>
              <p>Status: {milestone.status}</p>
              {milestone.Remark && milestone.Remark.length > 0 && (
                <div className='mt-2'>
                  <h4 className='font-semibold'>Faculty Remarks:</h4>
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
      )}
    </div>
  )
}
