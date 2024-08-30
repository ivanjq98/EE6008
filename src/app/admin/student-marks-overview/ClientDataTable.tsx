'use client'

import React, { useState, useMemo } from 'react'
import { useColumns, StudentMark } from './columns'
import { DataTable } from './data-table'
import { Input } from '@/src/components/ui/input'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/src/components/ui/select'

interface ClientDataTableProps {
  assessmentComponents: string[]
  data: StudentMark[]
}

export function ClientDataTable({ assessmentComponents, data }: ClientDataTableProps) {
  const columns = useColumns(assessmentComponents)
  const [nameFilter, setNameFilter] = useState('')
  const [semesterFilter, setSemesterFilter] = useState('')

  const semesters = useMemo(() => {
    const uniqueSemesters = new Set(data.map((item) => item.semester))
    return Array.from(uniqueSemesters).sort()
  }, [data])

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const nameMatch = item.name.toLowerCase().includes(nameFilter.toLowerCase())
      const semesterMatch = semesterFilter === '' || item.semester === semesterFilter
      return nameMatch && semesterMatch
    })
  }, [data, nameFilter, semesterFilter])

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
            <SelectItem value='all'>All Semesters</SelectItem> {/* Change the value to "all" */}
            {semesters.map((semester) => (
              <SelectItem key={semester} value={semester}>
                {semester}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <DataTable columns={columns} data={filteredData} />
    </div>
  )
}
