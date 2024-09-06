'use client'

import React, { useState } from 'react'
import { Milestone, Remark, Student } from '@prisma/client'
import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/components/ui/select'
import { updateMilestone, deleteMilestone } from '@/src/server/data/milestone'
import { toast } from 'sonner'
import { X } from 'lucide-react'

interface ExtendedRemark extends Remark {
  faculty: {
    user: {
      name: string
    }
  }
}

interface ExtendedMilestone extends Milestone {
  Remark: ExtendedRemark[]
  student: {
    user: {
      name: string
      email: string
    }
  }
}

interface MilestoneListProps {
  milestones: ExtendedMilestone[]
  onMilestoneUpdate: () => void
  currentUserEmail: string // Add this prop
}

export function MilestoneList({ milestones, onMilestoneUpdate, currentUserEmail }: MilestoneListProps) {
  const [editingMilestone, setEditingMilestone] = useState<string | null>(null)
  const [editedData, setEditedData] = useState<Partial<ExtendedMilestone>>({})
  const [isLoading, setIsLoading] = useState(false)

  const handleEdit = (milestone: ExtendedMilestone) => {
    setEditingMilestone(milestone.id)
    setEditedData({
      objective: milestone.objective,
      startDate: milestone.startDate,
      endDate: milestone.endDate,
      status: milestone.status
    })
  }

  const handleSave = async (milestone: ExtendedMilestone) => {
    setIsLoading(true)
    try {
      const result = await updateMilestone(milestone.id, editedData)
      if (result.status === 'ERROR') {
        throw new Error(result.message)
      }
      toast.success('Milestone updated successfully')
      setEditingMilestone(null)
      onMilestoneUpdate()
    } catch (error) {
      console.error('Error updating milestone:', error)
      toast.error('Failed to update milestone. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setEditingMilestone(null)
    setEditedData({})
  }

  const handleDelete = async (milestone: ExtendedMilestone) => {
    if (window.confirm('Are you sure you want to delete this milestone?')) {
      setIsLoading(true)
      try {
        const result = await deleteMilestone(milestone.id)
        if (result.status === 'ERROR') {
          throw new Error(result.message)
        }
        toast.success('Milestone deleted successfully')
        onMilestoneUpdate()
      } catch (error) {
        console.error('Error deleting milestone:', error)
        toast.error('Failed to delete milestone. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }
  }

  const isCreator = (milestone: ExtendedMilestone) => {
    return currentUserEmail === milestone.student.user.email
  }

  return (
    <div>
      <h2 className='mb-4 text-xl font-semibold'>Project Milestones</h2>
      {milestones.length === 0 ? (
        <p>No milestones created yet.</p>
      ) : (
        milestones.map((milestone) => (
          <div key={milestone.id} className='relative mb-4 rounded-md border p-4'>
            {isCreator(milestone) && (
              <Button
                onClick={() => handleDelete(milestone)}
                className='absolute right-2 top-2'
                variant='ghost'
                size='icon'
              >
                <X className='h-4 w-4' />
              </Button>
            )}
            {editingMilestone === milestone.id ? (
              <>
                <Input
                  value={editedData.objective || ''}
                  onChange={(e) => setEditedData({ ...editedData, objective: e.target.value })}
                  placeholder='Objective'
                  className='mb-2'
                />
                <Input
                  type='date'
                  value={editedData.startDate?.toISOString().split('T')[0] || ''}
                  onChange={(e) => setEditedData({ ...editedData, startDate: new Date(e.target.value) })}
                  className='mb-2'
                />
                <Input
                  type='date'
                  value={editedData.endDate?.toISOString().split('T')[0] || ''}
                  onChange={(e) => setEditedData({ ...editedData, endDate: new Date(e.target.value) })}
                  className='mb-2'
                />
                <Select
                  value={editedData.status || ''}
                  onValueChange={(value) => setEditedData({ ...editedData, status: value as Milestone['status'] })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select status' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='NOT_STARTED'>Not Started</SelectItem>
                    <SelectItem value='STARTED'>Started</SelectItem>
                    <SelectItem value='NEARLY_HALF'>Nearly Half</SelectItem>
                    <SelectItem value='HALF_WAY_THERE'>Half Way There</SelectItem>
                    <SelectItem value='ALMOST_DONE'>Almost Done</SelectItem>
                    <SelectItem value='COMPLETED'>Completed</SelectItem>
                  </SelectContent>
                </Select>
                <div className='mt-2'>
                  <Button onClick={() => handleSave(milestone)} className='mr-2' disabled={isLoading}>
                    {isLoading ? 'Saving...' : 'Save'}
                  </Button>
                  <Button onClick={handleCancel} variant='outline' disabled={isLoading}>
                    Cancel
                  </Button>
                </div>
              </>
            ) : (
              <>
                <h4 className='font-semibold'>Objective: {milestone.objective}</h4>
                {milestone.description && <p className='text-gray-600'>Description: {milestone.description}</p>}
                <p>Start Date: {new Date(milestone.startDate).toLocaleDateString()}</p>
                <p>End Date: {new Date(milestone.endDate).toLocaleDateString()}</p>
                <p>Status: {milestone.status}</p>
                <p className='text-sm text-gray-500'>Created by: {milestone.student.user.name}</p>
                <Button onClick={() => handleEdit(milestone)} className='mt-2'>
                  Edit
                </Button>
              </>
            )}
            {milestone.Remark && milestone.Remark.length > 0 && (
              <div className='mt-2'>
                <h5 className='font-semibold'>Faculty Remarks:</h5>
                {milestone.Remark.map((remark, index) => (
                  <p key={index} className='text-gray-600'>
                    <span className='font-medium'>{remark.faculty.user.name}:</span> {remark.remarks}
                  </p>
                ))}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  )
}
