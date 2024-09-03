import { ColumnDef } from '@tanstack/react-table'

export type StudentMark = {
  id: string
  name: string
  projectTitle: string
  semester: string
  totalScore: number
  [key: string]: string | number | { supervisor: number | null; moderator: number | null; weighted: number | null }
}

export const useColumns = (assessmentComponents: string[]): ColumnDef<StudentMark>[] => [
  {
    accessorKey: 'name',
    header: 'Student Name'
  },
  {
    accessorKey: 'projectTitle',
    header: 'Project Title'
  },
  {
    accessorKey: 'semester',
    header: 'Semester'
  },
  ...assessmentComponents.map((component) => ({
    accessorKey: component,
    header: component,
    cell: ({ row }) => {
      const grades = row.getValue(component) as {
        supervisor: number | null
        moderator: number | null
        weighted: number | null
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
    cell: ({ row }) => {
      const score = row.getValue('totalScore') as number
      return <div className='text-right font-medium'>{score.toFixed(2)}</div>
    }
  }
]
