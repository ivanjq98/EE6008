'use server'

import { getServerSession } from 'next-auth'
import { prisma } from '@/src/lib/prisma'
import { authOptions } from '@/src/lib/auth'
import { Milestone } from '@prisma/client'

interface CreateMilestoneData {
  projectId: string
  objective: string
  description?: string
  startDate: string
  endDate: string
  status: 'NOT_STARTED' | 'STARTED' | 'NEARLY_HALF' | 'HALF_WAY_THERE' | 'ALMOST_DONE' | 'COMPLETED'
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

export async function updateMilestone(id: string, data: Partial<Milestone>) {
  try {
    const updatedMilestone = await prisma.milestone.update({
      where: { id },
      data: {
        objective: data.objective,
        startDate: data.startDate,
        endDate: data.endDate,
        status: data.status
      }
    })
    return { status: 'SUCCESS', data: updatedMilestone }
  } catch (error) {
    console.error('Error updating milestone:', error)
    return { status: 'ERROR', message: 'Failed to update milestone' }
  }
}

export async function fetchProject(projectId: string) {
  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: {
        id: true,
        title: true
      }
    })
    return project
  } catch (error) {
    console.error('Error fetching project:', error)
    throw error
  }
}

export async function fetchMilestones(projectId: string) {
  try {
    const milestones = await prisma.milestone.findMany({
      where: { projectId: projectId },
      include: {
        student: {
          include: {
            user: {
              select: {
                name: true
              }
            }
          }
        },
        Remark: {
          include: {
            faculty: {
              include: {
                user: {
                  select: {
                    name: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        startDate: 'asc'
      }
    })
    return milestones
  } catch (error) {
    console.error('Error fetching milestones:', error)
    throw error
  }
}
