'use client'

import { Suspense, useCallback } from 'react'
import { StudentMark } from './columns'
import { ClientDataTable } from './ClientDataTable'
import { Button } from '@/src/components/ui/button'

interface StudentMarksOverviewPageProps {
  formattedData: StudentMark[]
  assessmentComponents: string[]
}

const calculateMaxDiscrepancy = (student: StudentMark, components: string[]): number => {
  let maxDiscrepancy = 0
  components.forEach((component) => {
    const grade = student[component] as {
      supervisor: number | null
      moderator: number | null
      weighted: number | null
      weightage: number
    }
    if (grade.supervisor !== null && grade.moderator !== null) {
      const discrepancy = (Math.abs(grade.supervisor - grade.moderator) / grade.weightage) * 100
      maxDiscrepancy = Math.max(maxDiscrepancy, discrepancy)
    }
  })
  return maxDiscrepancy
}

export default function StudentMarksOverviewPage({
  formattedData,
  assessmentComponents
}: StudentMarksOverviewPageProps) {
  const downloadAllocationResults = useCallback(
    (data: StudentMark[]) => {
      // Create CSV content
      const headers = [
        'Student Name',
        'Project Title',
        'Semester',
        ...assessmentComponents,
        'Total Score',
        'Max Discrepancy (%)'
      ]
      const csvContent = [
        headers.join(','),
        ...data.map((student) => {
          const maxDiscrepancy = calculateMaxDiscrepancy(student, assessmentComponents)
          return [
            student.name,
            student.projectTitle,
            student.semester,
            ...assessmentComponents.map((component) => {
              const grade = student[component] as {
                supervisor: number | null
                moderator: number | null
                weighted: number | null
              }
              return grade.weighted !== null ? grade.weighted.toFixed(2) : ''
            }),
            student.totalScore.toFixed(2),
            maxDiscrepancy.toFixed(2)
          ].join(',')
        })
      ].join('\n')

      // Create Blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob)
        link.setAttribute('href', url)
        link.setAttribute('download', 'student_marks_overview.csv')
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    },
    [assessmentComponents]
  )

  return (
    <div className='container mx-auto py-10'>
      <div className='mb-5 flex items-center justify-between'>
        <Button onClick={() => downloadAllocationResults(formattedData)}>Download CSV</Button>
      </div>
      <Suspense fallback={<div>Loading...</div>}>
        <ClientDataTable assessmentComponents={assessmentComponents} data={formattedData} />
      </Suspense>
    </div>
  )
}
