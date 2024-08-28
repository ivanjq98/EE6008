'use client'

import React, { useMemo } from 'react'
import { prisma } from '@/src/lib/prisma'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/src/components/ui/select'

interface StatisticsProps {
  data: any[] // Replace 'any' with your actual data type
  assessmentComponents: string[]
}

function calculateStatistics(scores: number[]) {
  scores.sort((a, b) => a - b)
  const length = scores.length
  const mean = scores.reduce((sum, score) => sum + score, 0) / length
  const median = length % 2 === 0 ? (scores[length / 2 - 1] + scores[length / 2]) / 2 : scores[Math.floor(length / 2)]
  const mode = scores.reduce(
    (a, b, i, arr) => (arr.filter((v) => v === a).length >= arr.filter((v) => v === b).length ? a : b),
    arr[0]
  )
  const min = scores[0]
  const max = scores[length - 1]
  const q1 = scores[Math.floor(length * 0.25)]
  const q3 = scores[Math.floor(length * 0.75)]
  const stdDev = Math.sqrt(scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / length)

  return { mean, median, mode, min, max, q1, q3, stdDev }
}

function createHistogramData(scores: number[], bins = 10) {
  const min = Math.min(...scores)
  const max = Math.max(...scores)
  const binSize = (max - min) / bins
  const histogram = Array(bins).fill(0)

  scores.forEach((score) => {
    const binIndex = Math.min(Math.floor((score - min) / binSize), bins - 1)
    histogram[binIndex]++
  })

  return histogram.map((count, index) => ({
    binStart: min + index * binSize,
    binEnd: min + (index + 1) * binSize,
    count
  }))
}

export default function Statistics({ data, assessmentComponents }: StatisticsProps) {
  const [selectedComponent, setSelectedComponent] = React.useState('totalScore')

  const statistics = useMemo(() => {
    const scores = data.map((item) => item[selectedComponent])
    return calculateStatistics(scores)
  }, [data, selectedComponent])

  const histogramData = useMemo(() => {
    const scores = data.map((item) => item[selectedComponent])
    return createHistogramData(scores)
  }, [data, selectedComponent])

  return (
    <div className='container mx-auto py-10'>
      <h1 className='mb-5 text-2xl font-bold'>Score Statistics</h1>

      <Select value={selectedComponent} onValueChange={setSelectedComponent}>
        <SelectTrigger className='mb-5 w-[200px]'>
          <SelectValue placeholder='Select component' />
        </SelectTrigger>
        <SelectContent>
          {assessmentComponents.map((component) => (
            <SelectItem key={component} value={component}>
              {component}
            </SelectItem>
          ))}
          <SelectItem value='totalScore'>Total Score</SelectItem>
        </SelectContent>
      </Select>

      <div className='mb-10 grid grid-cols-2 gap-4'>
        <div>
          <h2 className='mb-3 text-xl font-semibold'>Statistics</h2>
          <p>Mean: {statistics.mean.toFixed(2)}</p>
          <p>Median: {statistics.median.toFixed(2)}</p>
          <p>Mode: {statistics.mode.toFixed(2)}</p>
          <p>Min: {statistics.min.toFixed(2)}</p>
          <p>Max: {statistics.max.toFixed(2)}</p>
          <p>25% Percentile: {statistics.q1.toFixed(2)}</p>
          <p>75% Percentile: {statistics.q3.toFixed(2)}</p>
          <p>Standard Deviation: {statistics.stdDev.toFixed(2)}</p>
        </div>
        <div>
          <h2 className='mb-3 text-xl font-semibold'>Histogram</h2>
          <ResponsiveContainer width='100%' height={300}>
            <BarChart data={histogramData}>
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis dataKey='binStart' />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey='count' fill='#8884d8' />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

export async function getServerSideProps() {
  const data = await prisma.student.findMany({
    include: {
      Grade: {
        include: {
          semesterGradeType: true
        }
      }
    }
  })

  const assessmentComponents = await prisma.gradeType.findMany({
    select: { name: true },
    distinct: ['name']
  })

  const formattedData = data.map((student) => {
    const grades = assessmentComponents.reduce(
      (acc, component) => {
        const grade = student.Grade.find((g) => g.semesterGradeType.name === component.name)
        acc[component.name] = grade?.score ?? 0
        return acc
      },
      {} as Record<string, number>
    )

    const totalScore = Object.values(grades).reduce((sum, score) => sum + score, 0)

    return {
      id: student.id,
      ...grades,
      totalScore
    }
  })

  return {
    props: {
      data: formattedData,
      assessmentComponents: assessmentComponents.map((c) => c.name)
    }
  }
}
