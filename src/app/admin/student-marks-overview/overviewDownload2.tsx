'use client'

import { StudentMark } from './columns'

interface DownloadProps {
  formattedData: StudentMark[]
  assessmentComponents: string[]
}

export const downloadSupervisorModeratorMarks = ({ formattedData, assessmentComponents }: DownloadProps) => {
  // Create CSV content
  const headers = [
    'Student Name',
    'Project Title',
    'Semester',
    ...assessmentComponents.flatMap((component) => [`${component} Supervisor`, `${component} Moderator`]),
    'Total Score'
  ]
  const csvContent = [
    headers.join(','),
    ...formattedData.map((student) => {
      return [
        student.name,
        student.projectTitle,
        student.semester,
        ...assessmentComponents.flatMap((component) => {
          const grade = student[component] as {
            supervisor: number | null
            moderator: number | null
          }
          return [
            grade.supervisor !== null ? grade.supervisor.toFixed(2) : '',
            grade.moderator !== null ? grade.moderator.toFixed(2) : ''
          ]
        }),
        student.totalScore.toFixed(2)
      ].join(',')
    })
  ].join('\n')

  // Create Blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', 'supervisor_moderator_marks.csv')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}
