'use client'

import { ColumnDef } from '@tanstack/react-table'

type StudentMark = {
  id: string
  name: string
  matriculationNumber: string
  projectTitle: string
  projectSupervisor: string
  totalScore: number
  gradesCount: number
}

export const columns: ColumnDef<StudentMark>[] = [
  {
    accessorKey: 'name',
    header: 'Student Name'
  },
  {
    accessorKey: 'matriculationNumber',
    header: 'Matriculation Number'
  },
  {
    accessorKey: 'projectTitle',
    header: 'Project Title'
  },
  {
    accessorKey: 'projectSupervisor',
    header: 'Project Supervisor'
  },
  {
    accessorKey: 'totalScore',
    header: 'Total Score',
    cell: ({ row }) => {
      const score = parseFloat(row.getValue('totalScore'))
      return <div className='text-right font-medium'>{score.toFixed(2)}</div>
    }
  },
  {
    accessorKey: 'gradesCount',
    header: 'Number of Grades'
  }
]
