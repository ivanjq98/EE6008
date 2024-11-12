'use client'

import { z } from 'zod'

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/src/components/ui/tooltip'
import { ColumnDef } from '@tanstack/react-table'

import { DataTableColumnHeader } from './data-table-column-header'
import { DataTableRowActions } from './data-table-row-actions'

export const projectSchema = z.object({
  projectId: z.string(),
  projectTitle: z.string(),
  projectCode: z.string(),
  totalSignUps: z.number(),
  vacancywaitlist: z.string(),
  semester: z.string(),

  registrantDetails: z.array(
    z.object({
      matriculationNumber: z.string(),
      name: z.string(),
      priority: z.number()
    })
  )
})

export type Project = z.infer<typeof projectSchema>

export const columns: ColumnDef<Project>[] = [
  {
    enableSorting: false,
    accessorKey: 'semester',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Semester' />,
    cell: ({ row }) => <div className='capitalize'>{row.getValue('semester')}</div>,
    filterFn: (row, id, value) => value.includes(row.getValue(id))
  },
  {
    accessorKey: 'projectCode',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Project Code' />,
    cell: ({ row }) => <div>{row.getValue('projectCode')}</div>
  },
  {
    accessorKey: 'projectTitle',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Title' />,
    cell: ({ row }) => <div>{row.getValue('projectTitle')}</div>
  },

  {
    accessorKey: 'totalSignUps',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Total Project Choices' />,
    cell: ({ row }) => <div>{row.getValue('totalSignUps')}</div>
  },
  {
    accessorKey: 'vacancywaitlist',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Vacancy/Waitlist' />,
    cell: ({ row }) => <div>{row.getValue('vacancywaitlist')}</div>
  },
  {
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />
  }
]
