'use client'

import { z } from 'zod'
import { ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from './data-table-column-header'
import { DataTableRowActions } from './data-table-row-actions'

export const projectSchema = z.object({
  id: z.string(),
  title: z.string(),
  programme: z.string(),
  supervisor: z.string(),
  moderator: z.string(),
  semester: z.string(),
  description: z.string(),
  projectCode: z.string(),
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'COMPLETED'])
})

export type Project = z.infer<typeof projectSchema>

export const columns: ColumnDef<Project>[] = [
  {
    enableSorting: false,
    accessorKey: 'projectCode',
    header: ({ column }) => {
      return <DataTableColumnHeader column={column} title='Project Code' />
    },
    cell: ({ row }) => <div className='capitalize'>{row.getValue('projectCode')}</div>
  },
  {
    accessorKey: 'title',
    header: ({ column }) => {
      return <DataTableColumnHeader column={column} title='Title' />
    },
    cell: ({ row }) => <div className='capitalize'>{row.getValue('title')}</div>
  },
  {
    enableSorting: false,
    accessorKey: 'semester',
    header: ({ column }) => {
      return <DataTableColumnHeader column={column} title='Semester' />
    },
    cell: ({ row }) => <div className='capitalize'>{row.getValue('semester')}</div>,
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    }
  },
  {
    enableSorting: false,
    accessorKey: 'supervisor',
    header: ({ column }) => {
      return <DataTableColumnHeader column={column} title='Supervisor' />
    },
    cell: ({ row }) => <div className='capitalize'>{row.getValue('supervisor')}</div>
  },
  {
    enableSorting: false,
    accessorKey: 'moderator',
    header: ({ column }) => {
      return <DataTableColumnHeader column={column} title='Moderator' />
    },
    cell: ({ row }) => <div className='capitalize'>{row.getValue('moderator')}</div>
  },
  {
    enableSorting: false,
    accessorKey: 'programme',
    header: ({ column }) => {
      return <DataTableColumnHeader column={column} title='Programme' />
    },
    cell: ({ row }) => {
      return <div className='capitalize'>{row.getValue('programme')}</div>
    }
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => {
      return <DataTableRowActions row={row} />
    }
  }
]
