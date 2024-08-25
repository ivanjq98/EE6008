import React from 'react'
import { TimelineCard } from './timeline-card' // Adjust the import path as needed

interface Timeline {
  id: string
  title: string
  milestonesCount: number
}

interface CardContainerProps {
  timelines: Timeline[]
  activeTimelineId: string | null
}

export function CardContainer({ timelines, activeTimelineId }: CardContainerProps) {
  return (
    <div className='grid gap-4'>
      {timelines.map((timeline, index) => (
        <TimelineCard key={timeline.id} timeline={timeline} index={index} isActive={timeline.id === activeTimelineId} />
      ))}
    </div>
  )
}
