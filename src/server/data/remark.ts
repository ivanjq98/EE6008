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
export async function updateRemark(remarkId: string, { remarks }: { remarks: string }) {
  try {
    const updatedRemark = await prisma.remark.update({
      where: { id: remarkId },
      data: { remarks }
    })
    return { status: 'SUCCESS', data: updatedRemark }
  } catch (error) {
    console.error('Error updating remark:', error)
    return { status: 'ERROR', message: 'Failed to update remark' }
  }
}

export async function fetchRemark(remarkId: string) {
  try {
    const remark = await prisma.remark.findUnique({
      where: { id: remarkId }
    })
    return remark
  } catch (error) {
    console.error('Error fetching remark:', error)
    throw new Error('Failed to fetch remark')
  }
}

export async function fetchRemarkByMilestoneId(milestoneId: string) {
  try {
    const remark = await prisma.remark.findFirst({
      where: { milestoneId }
    })
    return remark
  } catch (error) {
    console.error('Error fetching remark by milestone ID:', error)
    throw new Error('Failed to fetch remark by milestone ID')
  }
}
