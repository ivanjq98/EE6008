'use client'

import { Expand } from 'lucide-react'

import { TypographyH4, TypographyP } from '@/src/components/typography'
import { Button } from '@/src/components/ui/button'
import { Separator } from '@/src/components/ui/separator'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from '@/src/components/ui/sheet'
import { Row } from '@tanstack/react-table'

import { Project } from './columns'

interface DataTableRowActionsProps<TData> {
  row: Row<TData>
}

export function DataTableRowActions<TData>({ row }: DataTableRowActionsProps<TData>) {
  const projectData = row.original as Project

  const { title, description, supervisor, moderator, id, programme, projectCode, semester } = projectData

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant='link'>
          <Expand size={14} />
        </Button>
      </SheetTrigger>
      <SheetContent className='max-h-screen overflow-y-auto'>
        <SheetHeader>
          <SheetTitle>Project Detail</SheetTitle>
          <SheetDescription>View project details</SheetDescription>
        </SheetHeader>
        <div className='grid gap-4 py-4'>
          <div className='space-y-2'>
            <TypographyH4>Title:</TypographyH4>
            <TypographyP>{title}</TypographyP>
            <Separator />
          </div>
          <div className='space-y-2'>
            <TypographyH4>Project Code:</TypographyH4>
            <TypographyP>{projectCode}</TypographyP>
            <Separator />
          </div>
          <div className='space-y-2'>
            <TypographyH4>Programme:</TypographyH4>
            <TypographyP>{programme}</TypographyP>
            <Separator />
          </div>
          <div className='space-y-2'>
            <TypographyH4>Semester:</TypographyH4>
            <TypographyP>{semester}</TypographyP>
            <Separator />
          </div>
          <div className='space-y-2'>
            <TypographyH4>Supervisor:</TypographyH4>
            <TypographyP>{supervisor}</TypographyP>
            <Separator />
          </div>
          <div className='space-y-2'>
            <TypographyH4>Moderator:</TypographyH4>
            <TypographyP>{moderator}</TypographyP>
            <Separator />
          </div>
          <div className='space-y-2'>
            <TypographyH4>Description:</TypographyH4>
            <TypographyP>{description}</TypographyP>
            <Separator />
          </div>
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button>Close</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
