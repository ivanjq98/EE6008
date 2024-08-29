'use server'

import { getServerSession } from 'next-auth'
import { prisma } from '@/src/lib/prisma'
import { authOptions } from '@/src/lib/auth'

interface CreateRemarkData {
  milestoneId: string
  remarks: string
}

export async function createRemark(data: CreateRemarkData) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user.facultyId) {
    return { status: 'ERROR', message: 'Unauthorized' }
  }

  try {
    const remark = await prisma.remark.create({
      data: {
        milestoneId: data.milestoneId,
        facultyId: session.user.facultyId,
        remarks: data.remarks
      }
    })

    return { status: 'SUCCESS', message: 'Remark created successfully', data: remark }
  } catch (error) {
    console.error('Error creating remark:', error)
    return { status: 'ERROR', message: 'Failed to create remark' }
  }
}
