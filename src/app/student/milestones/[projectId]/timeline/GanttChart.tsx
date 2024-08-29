'use client'

import React from 'react'
import { Chart } from 'react-google-charts'
import { Milestone } from '@prisma/client'

interface GanttChartProps {
  milestones: Milestone[]
  startDate: Date
  endDate: Date
}

export function GanttChart({ milestones, startDate, endDate }: GanttChartProps) {
  const completedColor = '#34A853'
  const notCompletedColor = '#fb0509'

  const data = [
    [
      { type: 'string', label: 'Task ID' },
      { type: 'string', label: 'Task Name' },
      { type: 'string', label: 'Resource' },
      { type: 'date', label: 'Start Date' },
      { type: 'date', label: 'End Date' },
      { type: 'number', label: 'Duration' },
      { type: 'number', label: 'Percent Complete' },
      { type: 'string', label: 'Dependencies' }
    ],
    ...milestones.map((milestone, index) => [
      milestone.id,
      milestone.objective,
      milestone.status === 'COMPLETED' ? 'Completed' : 'Not Completed',
      milestone.startDate,
      milestone.endDate,
      null,
      milestone.status === 'COMPLETED' ? 100 : 0,
      null
    ])
  ]

  const options = {
    height: 400,
    gantt: {
      trackHeight: 50,
      labelStyle: {
        fontName: 'Arial',
        fontSize: 12
      },
      barCornerRadius: 3,
      barHeight: 30,
      palette: [
        {
          color: completedColor,
          dark: completedColor,
          light: completedColor
        },
        {
          color: notCompletedColor,
          dark: notCompletedColor,
          light: notCompletedColor
        }
      ]
    },
    legend: {
      position: 'top',
      alignment: 'center'
    },
    tooltip: { isHtml: true }
  }

  return (
    <div>
      <Chart chartType='Gantt' width='100%' height='400px' data={data} options={options} />
      <div className='mt-4 text-sm'>
        <div className='flex items-center'>
          <div className='mr-2 h-4 w-4' style={{ backgroundColor: completedColor }}></div>
          <span>Completed</span>
        </div>
        <div className='mt-1 flex items-center'>
          <div className='mr-2 h-4 w-4' style={{ backgroundColor: notCompletedColor }}></div>
          <span>Not Completed</span>
        </div>
      </div>
    </div>
  )
}
