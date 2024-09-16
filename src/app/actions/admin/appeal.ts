import { prisma } from '@/src/lib/prisma'

export async function updateAppealStatus(appealId: string, action: 'approve' | 'reject') {
  const appeal = await prisma.projectAppeal.findUnique({
    where: { id: appealId },
    include: { student: true, requestedProject: true }
  })

  if (!appeal) {
    throw new Error('Appeal not found')
  }

  const updatedAppeal = await prisma.projectAppeal.update({
    where: { id: appealId },
    data: { status: action === 'approve' ? 'APPROVED' : 'REJECTED' }
  })

  if (action === 'approve') {
    await prisma.student.update({
      where: { id: appeal.student.id },
      data: { projectId: appeal.requestedProject.id }
    })
  }

  return updatedAppeal
}
