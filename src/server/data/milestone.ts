// src/app/actions/student/milestone.ts
'use server'

import { getServerSession } from 'next-auth'
import { prisma } from '@/src/lib/prisma'
import { authOptions } from '@/src/lib/auth'

interface CreateMilestoneData {
  projectId: string
  objective: string
  description?: string
  startDate: string
  endDate: string
  status: 'COMPLETED' | 'NOT_COMPLETED'
}

export async function createMilestone(data: CreateMilestoneData) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user.studentId) {
    return { status: 'ERROR', message: 'Unauthorized' }
  }

  try {
    const milestone = await prisma.milestone.create({
      data: {
        projectId: data.projectId,
        studentId: session.user.studentId,
        objective: data.objective,
        description: data.description,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        status: data.status
      }
    })

    return { status: 'SUCCESS', message: 'Milestone created successfully', data: milestone }
  } catch (error) {
    console.error('Error creating milestone:', error)
    return { status: 'ERROR', message: 'Failed to create milestone' }
  }
}
