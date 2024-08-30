'use server'

import { prisma } from '@/src/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/src/lib/auth'

interface AssignModeratorData {
  projectId: string
  moderatorId: string
}

export async function assignModerator(data: AssignModeratorData) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user.facultyId) {
    return { status: 'ERROR', message: 'Unauthorized' }
  }

  try {
    const { projectId, moderatorId } = data

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { programme: true }
    })

    if (!project || project.programme.leaderId !== session.user.facultyId) {
      return { status: 'ERROR', message: 'Unauthorized to assign moderator for this project' }
    }

    // Remove existing moderator if any
    await prisma.projectFaculty.deleteMany({
      where: {
        projectId: projectId,
        role: 'MODERATOR'
      }
    })

    // Assign the new moderator
    const newAssignment = await prisma.projectFaculty.create({
      data: {
        projectId: projectId,
        facultyId: moderatorId,
        role: 'MODERATOR'
      }
    })

    return {
      status: 'SUCCESS',
      message: 'Moderator assigned successfully',
      data: newAssignment
    }
  } catch (error) {
    console.error('Error assigning moderator:', error)
    return { status: 'ERROR', message: 'Failed to assign moderator' }
  }
}
