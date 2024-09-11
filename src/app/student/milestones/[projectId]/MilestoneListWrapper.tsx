'use client'

import { useState } from 'react'
import { MilestoneList, ExtendedMilestone } from './MilestoneList'

interface MilestoneListWrapperProps {
  milestones: ExtendedMilestone[]
  currentUserEmail: string
}

export function MilestoneListWrapper({ milestones, currentUserEmail }: MilestoneListWrapperProps) {
  const [localMilestones, setLocalMilestones] = useState(milestones)

  const handleMilestoneUpdate = () => {
    // In a real application, you'd probably want to fetch the updated milestones from the server here
    // For now, we'll just log a message
    console.log('Milestone updated')
  }

  return (
    <MilestoneList
      milestones={localMilestones}
      onMilestoneUpdate={handleMilestoneUpdate}
      currentUserEmail={currentUserEmail}
    />
  )
}
