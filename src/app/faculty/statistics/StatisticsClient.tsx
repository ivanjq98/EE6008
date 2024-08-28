'use client'

import React, { useMemo, useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Line } from 'recharts'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/src/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card'
import * as d3 from 'd3'

interface StudentMark {
  id: string
  studentId: string
  studentName: string
  semesterId: string
  semesterName: string
  [key: string]: number | string
}

interface Semester {
  id: string
  name: string
}

interface StatisticsClientProps {
  data: StudentMark[]
  assessmentComponentsBySemester: Record<string, string[]>
  semesters: Semester[]
}

function calculateStatistics(scores: number[]) {
  // Filter out zero scores
  const nonZeroScores = scores.filter((score) => score > 0)

  if (nonZeroScores.length === 0) return null

  nonZeroScores.sort((a, b) => a - b)
  const length = nonZeroScores.length
  const mean = nonZeroScores.reduce((sum, score) => sum + score, 0) / length
  const median =
    length % 2 === 0
      ? (nonZeroScores[length / 2 - 1] + nonZeroScores[length / 2]) / 2
      : nonZeroScores[Math.floor(length / 2)]
  const mode = nonZeroScores.reduce(
    (a, b, i, arr) => (arr.filter((v) => v === a).length >= arr.filter((v) => v === b).length ? a : b),
    nonZeroScores[0]
  )
  const min = nonZeroScores[0]
  const max = nonZeroScores[length - 1]
  const q1 = nonZeroScores[Math.floor(length * 0.25)]
  const q3 = nonZeroScores[Math.floor(length * 0.75)]
  const stdDev = Math.sqrt(nonZeroScores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / length)

  return { mean, median, mode, min, max, q1, q3, stdDev, count: length, totalCount: scores.length }
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

function kernelDensityEstimator(kernel: (v: number) => number, X: number[]) {
  return function (V: number[]) {
    return X.map((x) => [x, d3.mean(V, (v) => kernel(x - v)) ?? 0])
  }
}

function kernelEpanechnikov(k: number) {
  return (v: number) => (Math.abs((v /= k)) <= 1 ? (0.75 * (1 - v * v)) / k : 0)
}

export default function StatisticsClient({ data, assessmentComponentsBySemester, semesters }: StatisticsClientProps) {
  const [selectedSemester, setSelectedSemester] = useState('all')
  const [selectedComponent, setSelectedComponent] = useState('totalScore')

  const availableComponents = useMemo(() => {
    if (selectedSemester === 'all') {
      return ['totalScore', ...Array.from(new Set(Object.values(assessmentComponentsBySemester).flat()))]
    }
    return ['totalScore', ...(assessmentComponentsBySemester[selectedSemester] || [])]
  }, [selectedSemester, assessmentComponentsBySemester])

  useEffect(() => {
    if (!availableComponents.includes(selectedComponent)) {
      setSelectedComponent('totalScore')
    }
  }, [availableComponents, selectedComponent])

  const filteredData = useMemo(() => {
    return selectedSemester === 'all' ? data : data.filter((item) => item.semesterId === selectedSemester)
  }, [data, selectedSemester])

  const validData = useMemo(() => {
    return filteredData.filter((item) => {
      const score = Number(item[selectedComponent])
      return score !== null && score !== undefined && (selectedComponent === 'totalScore' ? score > 0 : true)
    })
  }, [filteredData, selectedComponent])

  const statistics = useMemo(() => {
    if (!filteredData || filteredData.length === 0) return null
    const scores = filteredData.map((item) => Number(item[selectedComponent]) || 0)
    return calculateStatistics(scores)
  }, [filteredData, selectedComponent])

  const histogramData = useMemo(() => {
    if (!filteredData || filteredData.length === 0) return []
    const scores = filteredData.map((item) => Number(item[selectedComponent]) || 0)
    return createHistogramData(scores)
  }, [filteredData, selectedComponent])

  return (
    <div className='container mx-auto py-10'>
      <h1 className='mb-5 text-2xl font-bold'>Score Statistics</h1>

      <div className='mb-5 flex space-x-4'>
        <Select value={selectedSemester} onValueChange={setSelectedSemester}>
          <SelectTrigger className='w-[200px]'>
            <SelectValue placeholder='Select semester' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All Semesters</SelectItem>
            {semesters.map((semester) => (
              <SelectItem key={semester.id} value={semester.id}>
                {semester.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedComponent} onValueChange={setSelectedComponent}>
          <SelectTrigger className='w-[200px]'>
            <SelectValue placeholder='Select component' />
          </SelectTrigger>
          <SelectContent>
            {availableComponents.map((component) => (
              <SelectItem key={component} value={component}>
                {component === 'totalScore' ? 'Total Score' : component}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className='mb-10 grid grid-cols-1 gap-4 md:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle>Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            {statistics ? (
              <>
                <p>Mean: {statistics.mean.toFixed(2)}</p>
                <p>Median: {statistics.median.toFixed(2)}</p>
                <p>Mode: {statistics.mode.toFixed(2)}</p>
                <p>Min: {statistics.min.toFixed(2)}</p>
                <p>Max: {statistics.max.toFixed(2)}</p>
                <p>25% Percentile: {statistics.q1.toFixed(2)}</p>
                <p>75% Percentile: {statistics.q3.toFixed(2)}</p>
                <p>Standard Deviation: {statistics.stdDev.toFixed(2)}</p>
                <p>Number of students with scores: {validData.length}</p>
                <p>Total number of students: {filteredData.length}</p>
              </>
            ) : (
              <p>No statistics available</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Histogram</CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
