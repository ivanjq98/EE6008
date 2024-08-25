// src/app/actions/student/milestone.ts
import { prisma } from '@/src/lib/prisma'

export async function createOrUpdateMilestone(
  milestoneId: string | null,
  studentId: string,
  projectId: string,
  objective: string,
  startAt: Date,
  endAt: Date,
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'
) {
  if (milestoneId) {
    // Update existing milestone
    return prisma.milestone.update({
      where: { id: milestoneId },
      data: {
        objective,
        startAt,
        endAt,
        status
      }
    })
  } else {
    // Create new milestone
    return prisma.milestone.create({
      data: {
        objective,
        studentId,
        projectId,
        startAt,
        endAt,
        status
      }
    })
  }
}
