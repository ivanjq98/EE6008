'use client'
import { Input } from '@/src/components/ui/input'
import { Table } from '@tanstack/react-table'

import { DataTableFacetedFilter } from './data-table-faceted-filter'
import { DataTableViewOptions } from './data-table-view-options'

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  semesterOptions: { label: string; value: string }[]
}

export function DataTableToolbar<TData>({ table, semesterOptions }: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0

  return (
    <div className='flex items-center justify-between'>
      <div className='flex flex-1 items-center space-x-2'>
        <Input
          placeholder='Search projects...'
          value={(table.getColumn('projectTitle')?.getFilterValue() as string) ?? ''}
          onChange={(event) => table.getColumn('projectTitle')?.setFilterValue(event.target.value)}
          className='h-8 w-[150px] lg:w-[250px]'
        />
      </div>
      <DataTableViewOptions table={table} />
    </div>
  )
}
