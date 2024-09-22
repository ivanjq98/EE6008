'use client'

import React, { useEffect, useMemo, useState } from 'react'
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

  const statusColors = useMemo(
    () => ({
      COMPLETED: '#009717',
      IN_PROGRESS: '#FFA500'
    }),
    []
  )

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
            milestone.status === 'COMPLETED' ? 'Completed' : 'Not Completed',
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
  }, [milestones, statusColors])

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
      palette: Object.values(statusColors)
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
        <div className='flex items-center'>
          <div className='mr-2 h-4 w-4' style={{ backgroundColor: statusColors.IN_PROGRESS }}></div>
          <span>In Progress (0-99%)</span>
        </div>
        <div className='flex items-center'>
          <div className='mr-2 h-4 w-4' style={{ backgroundColor: statusColors.COMPLETED }}></div>
          <span>Completed (100%)</span>
        </div>
      </div>
    </div>
  )
}
