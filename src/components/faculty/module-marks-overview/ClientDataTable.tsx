'use client'

import React, { useState, useMemo } from 'react'
import { useColumns, StudentMark } from './columns'
import { DataTable } from './data-table'
import { Input } from '@/src/components/ui/input'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/src/components/ui/select'
import { AlertTriangle, AlertCircle } from 'lucide-react'

interface ClientDataTableProps {
  assessmentComponents: string[]
  data: StudentMark[]
}

type DiscrepancyLevel = 'all' | 'high' | 'moderate' | 'low'

const calculateHighestDiscrepancy = (student: StudentMark): number => {
  let highestDiscrepancy = 0
  Object.entries(student).forEach(([key, value]) => {
    if (
      typeof value === 'object' &&
      value !== null &&
      'supervisor' in value &&
      'moderator' in value &&
      'weightage' in value
    ) {
      const { supervisor, moderator, weightage } = value
      if (supervisor !== null && moderator !== null) {
        const discrepancy = (Math.abs(supervisor - moderator) / weightage) * 100
        highestDiscrepancy = Math.max(highestDiscrepancy, discrepancy)
      }
    }
  })
  return highestDiscrepancy
}

export function ClientDataTable({ assessmentComponents, data }: ClientDataTableProps) {
  const columns = useColumns(assessmentComponents)
  const [nameFilter, setNameFilter] = useState('')
  const [semesterFilter, setSemesterFilter] = useState('')
  const [discrepancyFilter, setDiscrepancyFilter] = useState<DiscrepancyLevel>('all')

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const nameMatch = item.name.toLowerCase().includes(nameFilter.toLowerCase())
      const semesterMatch =
        semesterFilter === '' || semesterFilter === 'all' || String(item.semester) === semesterFilter

      const highestDiscrepancy = calculateHighestDiscrepancy(item)
      let discrepancyMatch = true
      switch (discrepancyFilter) {
        case 'high':
          discrepancyMatch = highestDiscrepancy >= 30
          break
        case 'moderate':
          discrepancyMatch = highestDiscrepancy > 15 && highestDiscrepancy < 30
          break
        case 'low':
          discrepancyMatch = highestDiscrepancy <= 15
          break
        default:
          discrepancyMatch = true
      }

      return nameMatch && semesterMatch && discrepancyMatch
    })
  }, [data, nameFilter, semesterFilter, discrepancyFilter])

  const semesters = useMemo(() => {
    const uniqueSemesters = new Set(data.map((item) => String(item.semester)))
    return Array.from(uniqueSemesters).sort()
  }, [data])

  return (
    <div>
      <div className='mb-4 flex space-x-4'>
        <Input
          placeholder='Filter by name'
          value={nameFilter}
          onChange={(e) => setNameFilter(e.target.value)}
          className='max-w-sm'
        />
        <Select value={semesterFilter} onValueChange={setSemesterFilter}>
          <SelectTrigger className='max-w-sm'>
            <SelectValue placeholder='Select a semester' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All Semesters</SelectItem>
            {semesters.map((semester) => (
              <SelectItem key={semester} value={semester}>
                {semester}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={discrepancyFilter} onValueChange={(value) => setDiscrepancyFilter(value as DiscrepancyLevel)}>
          <SelectTrigger className='max-w-sm'>
            <SelectValue placeholder='Select discrepancy level' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All Levels</SelectItem>
            <SelectItem value='high'>
              <div className='flex items-center'>
                <AlertTriangle className='mr-2' size={16} />
                High Discrepancy
              </div>
            </SelectItem>
            <SelectItem value='moderate'>
              <div className='flex items-center'>
                <AlertCircle className='mr-2' size={16} />
                Moderate Discrepancy
              </div>
            </SelectItem>
            <SelectItem value='low'>
              <div className='flex items-center'>Low Discrepancy</div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      {filteredData.length > 0 ? <DataTable columns={columns} data={filteredData} /> : <p>No data available.</p>}
    </div>
  )
}
