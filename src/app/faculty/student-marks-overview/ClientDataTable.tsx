'use client'

import React, { useState, useMemo } from 'react'
import { useColumns, StudentMark, FacultyRole } from './columns'
import { DataTable } from './data-table'
import { Input } from '@/src/components/ui/input'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/src/components/ui/select'

interface ClientDataTableProps {
  assessmentComponents: string[]
  data: StudentMark[] // Changed from (StudentMark & { facultyRole: FacultyRole })[]
}

export function ClientDataTable({ assessmentComponents, data }: ClientDataTableProps) {
  const columns = useColumns(assessmentComponents)
  const [nameFilter, setNameFilter] = useState('')
  const [semesterFilter, setSemesterFilter] = useState('')
  const [roleFilter, setRoleFilter] = useState<FacultyRole | 'ALL'>('ALL')

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const nameMatch = item.name.toLowerCase().includes(nameFilter.toLowerCase())
      const semesterMatch =
        semesterFilter === '' || semesterFilter === 'all' || String(item.semester) === semesterFilter
      const roleMatch = roleFilter === 'ALL' || item.facultyRole === roleFilter
      return nameMatch && semesterMatch && roleMatch
    })
  }, [data, nameFilter, semesterFilter, roleFilter])

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
        <Select value={roleFilter} onValueChange={(value) => setRoleFilter(value as FacultyRole | 'ALL')}>
          <SelectTrigger className='max-w-sm'>
            <SelectValue placeholder='Select a role' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='ALL'>All Roles</SelectItem>
            <SelectItem value='SUPERVISOR'>Supervisor</SelectItem>
            <SelectItem value='MODERATOR'>Moderator</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {filteredData.length > 0 ? (
        <DataTable columns={columns} data={filteredData} />
      ) : (
        <p>No data available for your projects.</p>
      )}
    </div>
  )
}
