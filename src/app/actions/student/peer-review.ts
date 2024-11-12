'use server'

import { revalidatePath } from 'next/cache'

import { prisma } from '@/src/lib/prisma'

export async function reviewPeers(
  projects: { revieweeId: string; rank: number }[],
  studentId: string,
  projectId: string
) {
  console.log(studentId, projectId)
  try {
    // delete existing peer review if available
    await prisma.peerReview.deleteMany({
      where: {
        projectId: projectId,
        reviewerId: studentId
      }
    })

    const res = await prisma.peerReview.createMany({
      data: projects.map((project) => ({
        projectId: projectId,
        revieweeId: project.revieweeId,
        reviewerId: studentId,
        rank: project.rank
      })),
      skipDuplicates: true
    })

    revalidatePath('/student/peer-review/')

    return {
      message: `Your peer review has been submitted!`,
      status: 'OK',
      data: res
    }
  } catch (error) {
    return { message: `${error}`, status: 'ERROR' }
  }
}
