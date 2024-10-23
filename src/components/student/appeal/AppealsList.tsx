'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/src/components/ui/table'
import { Button } from '@/src/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/src/components/ui/dialog'
import { Label } from '@/src/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/components/ui/select'
import { toast } from 'sonner'

interface Appeal {
  id: string
  student: {
    user: {
      name: string
      email: string
    }
  }
  currentProject: {
    title: string
  }
  requestedProject: {
    title: string
  }
  reason: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  createdAt: Date
}

interface Project {
  id: string
  title: string
}

interface AppealsListProps {
  appeals: Appeal[]
  projects: Project[]
}
async function updateAppealStatus(appealId: string, action: 'approve' | 'reject') {
  const response = await fetch(`/api/admin/appeals/${appealId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action })
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message || 'Failed to update appeal')
  }

  return response.json()
}

export function AppealsList({ appeals, projects }: AppealsListProps) {
  const [localAppeals, setLocalAppeals] = useState(appeals)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isReasonModalOpen, setIsReasonModalOpen] = useState(false)
  const [selectedAppeal, setSelectedAppeal] = useState<Appeal | null>(null)
  const [editStatus, setEditStatus] = useState<'APPROVED' | 'REJECTED'>('APPROVED')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const handleAppealAction = async (appealId: string, action: 'approve' | 'reject') => {
    setIsSubmitting(true)
    try {
      const result = await updateAppealStatus(appealId, action)

      if (result.status === 'ERROR') {
        toast.error(result.message)
      } else {
        setLocalAppeals((prevAppeals) =>
          prevAppeals.map((appeal) => (appeal.id === appealId ? { ...appeal, status: result.status } : appeal))
        )

        toast.success(`Appeal has been ${action}ed successfully.`, {
          description: 'The appeal status has been updated.'
        })

        router.refresh()
      }
    } catch (error) {
      console.error('Error updating appeal:', error)
      toast.error('Failed to update appeal', {
        description: error instanceof Error ? error.message : 'Please try again.'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (appeal: Appeal) => {
    setSelectedAppeal(appeal)
    setEditStatus(appeal.status === 'PENDING' ? 'APPROVED' : appeal.status)
    setIsEditModalOpen(true)
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedAppeal) return

    setIsSubmitting(true)
    try {
      const result = await updateAppealStatus(selectedAppeal.id, editStatus.toLowerCase() as 'approve' | 'reject')

      if (result.status === 'ERROR') {
        toast.error(result.message)
      } else {
        setLocalAppeals((prevAppeals) =>
          prevAppeals.map((appeal) => (appeal.id === selectedAppeal.id ? { ...appeal, status: result.status } : appeal))
        )

        toast.success('Appeal status has been updated successfully.', {
          description: `The appeal is now ${editStatus}.`
        })

        setIsEditModalOpen(false)
        setSelectedAppeal(null)
        router.refresh()
      }
    } catch (error) {
      console.error('Error updating appeal:', error)
      toast.error('Failed to update appeal', {
        description: error instanceof Error ? error.message : 'Please try again.'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleViewReason = (appeal: Appeal) => {
    setSelectedAppeal(appeal)
    setIsReasonModalOpen(true)
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Student</TableHead>
            <TableHead>Current Project</TableHead>
            <TableHead>Requested Project</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date Submitted</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {localAppeals.map((appeal) => (
            <TableRow key={appeal.id}>
              <TableCell>
                {appeal.student.user.name}
                <br />
                <span className='text-sm text-gray-500'>{appeal.student.user.email}</span>
              </TableCell>
              <TableCell>{appeal.currentProject.title}</TableCell>
              <TableCell>{appeal.requestedProject.title}</TableCell>
              <TableCell>{appeal.status}</TableCell>
              <TableCell>{new Date(appeal.createdAt).toLocaleString()}</TableCell>

              <TableCell className='space-y-2'>
                <Button
                  onClick={() => handleViewReason(appeal)}
                  variant='outline'
                  className='w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                >
                  View Reason
                </Button>
                {appeal.status === 'PENDING' && (
                  <div className='flex space-x-2'>
                    <Button
                      onClick={() => handleAppealAction(appeal.id, 'approve')}
                      className='flex-1 bg-green-600 hover:bg-green-700 focus:ring-green-500'
                    >
                      Approve
                    </Button>
                    <Button
                      onClick={() => handleAppealAction(appeal.id, 'reject')}
                      variant='destructive'
                      className='flex-1'
                    >
                      Reject
                    </Button>
                  </div>
                )}
                {appeal.status !== 'PENDING' && (
                  <Button onClick={() => handleEdit(appeal)} variant='outline' className='w-full'>
                    Edit Status
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={isReasonModalOpen} onOpenChange={setIsReasonModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Appeal Reason</DialogTitle>
          </DialogHeader>
          <p>{selectedAppeal?.reason}</p>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Appeal Status</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit}>
            <div className='grid gap-4 py-4'>
              <div className='grid grid-cols-4 items-center gap-4'>
                <Label htmlFor='status' className='text-right'>
                  Status
                </Label>
                <Select onValueChange={(value: 'APPROVED' | 'REJECTED') => setEditStatus(value)} value={editStatus}>
                  <SelectTrigger className='col-span-3'>
                    <SelectValue placeholder='Select status' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='APPROVED'>Approved</SelectItem>
                    <SelectItem value='REJECTED'>Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type='submit'>Save changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
