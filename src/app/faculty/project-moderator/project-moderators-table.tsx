'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/src/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/components/ui/select'
import { Button } from '@/src/components/ui/button'
import { assignModerator } from '@/src/app/actions/faculty/assignModerator'

interface Project {
  id: string
  title: string
  supervisor: string
  moderator: string
  programme: string
}

interface FacultyOption {
  value: string
  label: string
}

interface AssignModeratorsTableProps {
  projects: Project[]
  facultyOptions: FacultyOption[]
}

export function AssignModeratorsTable({ projects, facultyOptions }: AssignModeratorsTableProps) {
  const [selections, setSelections] = useState<{ [key: string]: string }>({})
  const [assignments, setAssignments] = useState<{ [key: string]: string }>({})
  const router = useRouter()

  const handleAssign = async (projectId: string) => {
    const moderatorId = selections[projectId]
    if (!moderatorId) {
      toast.error('Please select a moderator')
      return
    }

    console.log('Assigning moderator:', { projectId, moderatorId })

    try {
      const result = await assignModerator({ projectId, moderatorId })

      if (result.status === 'ERROR') {
        console.error('Error from server:', result.message)
        toast.error(result.message)
      } else {
        console.log('Moderator assigned successfully:', result.data)
        toast.success('Moderator assigned successfully!')
        setAssignments((prev) => ({ ...prev, [projectId]: moderatorId }))
        router.refresh()
      }
    } catch (error) {
      console.error('Error assigning moderator:', error)
      toast.error('Failed to assign moderator. Please try again.')
    }
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Project Title</TableHead>
          <TableHead>Supervisor</TableHead>
          <TableHead>Current Moderator</TableHead>
          <TableHead>Programme</TableHead>
          <TableHead>Assign Moderator</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {projects.map((project) => (
          <TableRow key={project.id}>
            <TableCell>{project.title}</TableCell>
            <TableCell>{project.supervisor}</TableCell>
            <TableCell>
              {assignments[project.id]
                ? facultyOptions.find((f) => f.value === assignments[project.id])?.label
                : project.moderator}
            </TableCell>
            <TableCell>{project.programme}</TableCell>
            <TableCell>
              <div className='flex items-center space-x-2'>
                <Select
                  onValueChange={(value) => setSelections((prev) => ({ ...prev, [project.id]: value }))}
                  value={selections[project.id]}
                >
                  <SelectTrigger className='w-[180px]'>
                    <SelectValue placeholder='Select moderator' />
                  </SelectTrigger>
                  <SelectContent>
                    {facultyOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={() => handleAssign(project.id)}>Assign</Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
