<<<<<<< HEAD
import { ColumnDef, SortingFn, Row } from '@tanstack/react-table'
import { useMemo } from 'react'
=======
import React from 'react'
import { ColumnDef, Row } from '@tanstack/react-table'
import { AlertTriangle, AlertCircle } from 'lucide-react'
>>>>>>> security

export type StudentMark = {
  id: string
  name: string
  projectTitle: string
  semester: string
  totalScore: number
  [key: string]:
    | string
    | number
    | {
<<<<<<< HEAD
        supervisor: number | null
        moderator: number | null
        weighted: number | null
        weightage: number | null
        maximumScore: number | null
      }
}

export function useColumns(assessmentComponents: string[]): ColumnDef<StudentMark>[] {
  return useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'Student Name',
        sortingFn: 'alphanumeric' as const
      },
      {
        accessorKey: 'projectTitle',
        header: 'Project Title',
        sortingFn: 'alphanumeric' as const
      },
      {
        accessorKey: 'semester',
        header: 'Semester'
      },
      ...assessmentComponents.map((component) => ({
        accessorKey: component,
        header: component,
        cell: ({ row }: { row: Row<StudentMark> }) => {
          const grades = row.getValue(component) as {
            supervisor: number | null
            moderator: number | null
            weighted: number | null
            weightage: number | null
            maximumScore: number | null
          }
          return (
            <div className='space-y-1'>
              <div>Supervisor: {grades.supervisor !== null ? grades.supervisor.toFixed(2) : 'N/A'}</div>
              <div>Moderator: {grades.moderator !== null ? grades.moderator.toFixed(2) : 'N/A'}</div>
              <div>Weighted: {grades.weighted !== null ? grades.weighted.toFixed(2) : 'N/A'}</div>
            </div>
          )
        }
      })),
      {
        accessorKey: 'totalScore',
        header: 'Total Score',
        sortingFn: 'alphanumeric' as const,
        cell: ({ row }: { row: Row<StudentMark> }) => {
          const score = row.getValue('totalScore') as number
          return <div className='text-right font-medium'>{score.toFixed(2)}</div>
        }
      }
    ],
    [assessmentComponents]
  )
=======
        supervisor: number | null
        moderator: number | null
        weighted: number | null
        weightage: number
      }
}

const NameWithDiscrepancyIcon: React.FC<{ row: Row<StudentMark> }> = ({ row }) => {
  const studentData = row.original
  let highestDiscrepancy = 0

  Object.keys(studentData).forEach((key) => {
    if (typeof studentData[key] === 'object' && studentData[key] !== null) {
      const component = studentData[key] as { supervisor: number | null; moderator: number | null; weightage: number }
      if (component.supervisor !== null && component.moderator !== null) {
        const discrepancy = calculateDiscrepancy(component.supervisor, component.moderator, component.weightage)
        if (discrepancy !== null && discrepancy > highestDiscrepancy) {
          highestDiscrepancy = discrepancy
        }
      }
    }
  })

  return <div className='flex items-center'>{studentData.name}</div>
}

export const useColumns = (assessmentComponents: string[]): ColumnDef<StudentMark>[] => [
  {
    accessorKey: 'name',
    header: 'Student Name',
    cell: ({ row }) => <NameWithDiscrepancyIcon row={row} />
  },
  {
    accessorKey: 'projectTitle',
    header: 'Project Title'
  },

  ...assessmentComponents.map((component) => ({
    accessorKey: component,
    header: component,
    cell: ({ row }: { row: Row<StudentMark> }) => {
      const grades = row.getValue(component) as {
        supervisor: number | null
        moderator: number | null
        weighted: number | null
        weightage: number
      }
      const discrepancy = calculateDiscrepancy(grades.supervisor, grades.moderator, grades.weightage)
      const discrepancyColor = getDiscrepancyColor(discrepancy)

      return (
        <div className='space-y-1'>
          <div>Supervisor: {grades.supervisor !== null ? `${grades.supervisor.toFixed(2)} ` : 'N/A'}</div>
          <div>Moderator: {grades.moderator !== null ? `${grades.moderator.toFixed(2)} ` : 'N/A'}</div>
          <div>Weighted: {grades.weighted !== null ? `${grades.weighted.toFixed(2)} ` : 'N/A'}</div>
          <div style={{ color: discrepancyColor }}>
            Discrepancy: {discrepancy !== null ? `${discrepancy.toFixed(2)}%` : 'N/A'}
          </div>
        </div>
      )
    }
  })),
  {
    accessorKey: 'totalScore',
    header: 'Total Score',
    cell: ({ row }: { row: Row<StudentMark> }) => {
      const score = row.getValue('totalScore') as number
      return <div className='text-right font-medium'>{score.toFixed(2)}</div>
    }
  }
]

const calculateDiscrepancy = (
  supervisorMark: number | null,
  moderatorMark: number | null,
  weightage: number
): number | null => {
  if (supervisorMark === null || moderatorMark === null) return null
  const difference = Math.abs(supervisorMark - moderatorMark)
  return (difference / weightage) * 100
}

const getDiscrepancyColor = (discrepancy: number | null): string => {
  if (discrepancy === null) return 'inherit'
  if (discrepancy <= 15) return 'green'
  if (discrepancy <= 30) return 'orange'
  return 'red'
>>>>>>> security
}
