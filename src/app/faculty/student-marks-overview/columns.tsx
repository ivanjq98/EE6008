'use client'

import { ColumnDef, SortingFn } from '@tanstack/react-table'
import { useMemo } from 'react'

export type StudentMark = {
  id: string
  name: string
  projectTitle: string
  // semester: string
  totalScore: number
  [key: string]: string | number
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
        header: 'Project Name',
        sortingFn: 'alphanumeric' as const
      },
      // {
      //   accessorKey: 'semester',
      //   header: 'Semester',
      //   sortingFn: 'alphanumeric' as const
      // },
      ...assessmentComponents.map((component) => ({
        accessorKey: component,
        header: component,
        cell: ({ row }) => {
          const score = row.getValue(component) as number
          return <div className='text-right font-medium'>{score.toFixed(2)}</div>
        },
        sortingFn: 'alphanumeric' as const
      })),
      {
        accessorKey: 'totalScore',
        header: 'Final Score',
        cell: ({ row }) => {
          const score = row.getValue('totalScore') as number
          return <div className='text-right font-medium'>{score.toFixed(2)}</div>
        },
        sortingFn: 'alphanumeric' as const
      }
    ],
    [assessmentComponents]
  )
}
