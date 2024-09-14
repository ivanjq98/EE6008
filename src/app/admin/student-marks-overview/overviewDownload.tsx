'use client'

import { Suspense, useCallback } from 'react'
import { StudentMark } from './columns'
import { ClientDataTable } from './ClientDataTable'
import { Button } from '@/src/components/ui/button'
import { Header } from '@/src/components/header'

interface StudentMarksOverviewPageProps {
  formattedData: StudentMark[]
  assessmentComponents: string[]
}

function calculateDiscrepancy(
  supervisorScore: number | null,
  moderatorScore: number | null,
  weightage: number
): string {
  if (supervisorScore === null || moderatorScore === null) return 'N/A'

  // const max = Math.max(supervisorScore, moderatorScore)
  // const min = Math.min(supervisorScore, moderatorScore)
  // const difference = max / min
  const score_difference = Math.abs(supervisorScore - moderatorScore)

  return `(${score_difference})`
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
        ...assessmentComponents.flatMap((component) => [`${component} (Weighted)`, `${component} (Discrepancy)`]),
        'Total Score'
      ]
      const csvContent = [
        headers.join(','),
        ...data.map((student) =>
          [
            student.name,
            student.projectTitle,
            student.semester,
            ...assessmentComponents.flatMap((component) => {
              const grade = student[component] as {
                supervisor: number | null
                moderator: number | null
                weighted: number | null
                weightage: number
              }
              const discrepancy = calculateDiscrepancy(grade.supervisor, grade.moderator, grade.weightage)
              return [grade.weighted !== null ? grade.weighted.toFixed(2) : '', discrepancy]
            }),
            student.totalScore.toFixed(2)
          ].join(',')
        )
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
      <Header
        title='Student Marks Overview'
        description='Download the CSV to view the marks discrepancy for each students components'
      />
      <div className='mb-5 flex items-center justify-between'>
        <Button onClick={() => downloadAllocationResults(formattedData)}>Download CSV</Button>
      </div>
      <Suspense fallback={<div>Loading...</div>}>
        <ClientDataTable assessmentComponents={assessmentComponents} data={formattedData} />
      </Suspense>
    </div>
  )
}
