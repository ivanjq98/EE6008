'use client'

import { Milestone } from '@prisma/client'

interface MilestoneListProps {
  milestones: Milestone[]
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
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
