import { ColumnDef, SortingFn, Row } from '@tanstack/react-table'
import { useMemo } from 'react'

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
}
