'use client'

import React, { useEffect, useState } from 'react'
import { Chart } from 'react-google-charts'
import { Milestone } from '@prisma/client'

interface GanttChartProps {
  milestones: Milestone[]
  startDate: Date
  endDate: Date
}

export function GanttChart({ milestones, startDate, endDate }: GanttChartProps) {
  const [error, setError] = useState<string | null>(null)
  const [chartData, setChartData] = useState<any[]>([])

  const statusColors: { [key: string]: string } = {
    STARTED: '#FFA500',
    NEARLY_HALF: '#b0b011',
    HALF_WAY_THERE: '#5bcd32',
    ALMOST_DONE: '#00d162',
    COMPLETED: '#009717',
    NOT_STARTED: '#fb0509'
  }

  const defaultColor = '#808080' // Gray color for unknown status

  const getPercentComplete = (status: string): number => {
    const percentMap: { [key: string]: number } = {
      NOT_STARTED: 0,
      STARTED: 20,
      NEARLY_HALF: 40,
      HALF_WAY_THERE: 60,
      ALMOST_DONE: 80,
      COMPLETED: 100
    }
    return percentMap[status] || 0
  }

  useEffect(() => {
    try {
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
        ...milestones.map((milestone) => {
          console.log(`Processing milestone:`, JSON.stringify(milestone, null, 2))
          if (!milestone.status) {
            console.warn(`Milestone ${milestone.id} has no status`)
          }
          if (!(milestone.status in statusColors)) {
            console.warn(`Unknown status: ${milestone.status} for milestone ${milestone.id}`)
          }
          return [
            milestone.id,
            milestone.objective,
            milestone.status || 'UNKNOWN',
            new Date(milestone.startDate),
            new Date(milestone.endDate),
            null,
            getPercentComplete(milestone.status),
            null
          ]
        })
      ]
      setChartData(data)
      setError(null)
    } catch (err) {
      console.error('Error processing milestone data:', err)
      setError('Error processing milestone data. Check console for details.')
    }
  }, [milestones])

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
      palette: Object.values(statusColors).concat(defaultColor)
    },
    legend: {
      position: 'none'
    },
    tooltip: { isHtml: true }
  }

  if (error) {
    return <div className='text-red-500'>{error}</div>
  }

  return (
    <div>
      <Chart chartType='Gantt' width='100%' height='400px' data={chartData} options={options} chartLanguage='en' />
      <h2 className='mt-4 font-semibold'>Legend:</h2>
      <div className='mt-2 grid grid-cols-2 gap-2 text-sm'>
        {Object.entries(statusColors).map(([status, color]) => (
          <div key={status} className='flex items-center'>
            <div className='mr-2 h-4 w-4' style={{ backgroundColor: color }}></div>
            <span>
              {status.replace(/_/g, ' ')} ({getPercentComplete(status)}%)
            </span>
          </div>
        ))}
        <div className='flex items-center'>
          <div className='mr-2 h-4 w-4' style={{ backgroundColor: defaultColor }}></div>
          <span>Unknown Status</span>
        </div>
      </div>
    </div>
  )
}
