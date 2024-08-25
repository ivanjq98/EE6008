// src/components/GanttChart.tsx

import React from 'react'
import { Gantt as ReactGantt } from 'react-gantt-chart' // Replace with your Gantt chart library

interface Task {
  id: string
  title: string
  start: string // Format: YYYY-MM-DD
  end: string // Format: YYYY-MM-DD
  progress: number
}

interface GanttChartProps {
  tasks: Task[]
}

const GanttChart: React.FC<GanttChartProps> = ({ tasks }) => {
  const formattedTasks = tasks.map((task) => ({
    id: task.id,
    title: task.title,
    start: new Date(task.start),
    end: new Date(task.end),
    progress: task.progress
  }))

  return (
    <div style={{ height: '600px' }}>
      {' '}
      {/* Adjust height as needed */}
      <ReactGantt tasks={formattedTasks} />
    </div>
  )
}

export default GanttChart
