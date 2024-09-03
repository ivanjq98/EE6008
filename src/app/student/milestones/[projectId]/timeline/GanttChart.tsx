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
  const statusColors = {
    NOT_STARTED: '#fb0509',
    STARTED: '#FFA500',
    NEARLY_HALF: '#b0b011',
    HALF_WAY_THERE: '#5bcd32',
    ALMOST_DONE: '#00d162',
    COMPLETED: '#009717'
  }

  const getPercentComplete = (status: string) => {
    switch (status) {
      case 'NOT_STARTED':
        return 0
      case 'STARTED':
        return 20
      case 'NEARLY_HALF':
        return 40
      case 'HALF_WAY_THERE':
        return 60
      case 'ALMOST_DONE':
        return 80
      case 'COMPLETED':
        return 100
      default:
        return 0
    }
  }

  const data = [
    [
      { type: 'string', label: 'Task ID' },
      { type: 'string', label: 'Task Name' },
      { type: 'string', label: 'Resource' },
      { type: 'date', label: 'Start Date' },
      { type: 'date', label: 'End Date' },
      { type: 'number', label: 'Duration' },
      { type: 'number', label: 'Percent Complete' },
      { type: 'string', label: 'Dependencies' },
      { type: 'string', role: 'style' }
    ],
    ...milestones.map((milestone) => {
      const color = statusColors[milestone.status as keyof typeof statusColors]
      console.log(`Milestone ID: ${milestone.id}, Status: ${milestone.status}, Color: ${color}`) // Debugging output
      return [
        milestone.id,
        milestone.objective,
        milestone.status,
        new Date(milestone.startDate),
        new Date(milestone.endDate),
        null,
        getPercentComplete(milestone.status),
        null,
        `color: ${color};`
      ]
    })
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
      barHeight: 30
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
      <h2>Legends:</h2>
      <div className='mt-4 grid grid-cols-2 gap-2 text-sm'>
        {Object.entries(statusColors).map(([status, color]) => (
          <div key={status} className='flex items-center'>
            <div className='mr-2 h-4 w-4' style={{ backgroundColor: color }}></div>
            <span>
              {status.replace(/_/g, ' ')} ({getPercentComplete(status)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
