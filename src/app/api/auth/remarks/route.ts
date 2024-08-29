import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/src/lib/auth'
import { prisma } from '@/src/lib/prisma'

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user.facultyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { milestoneId, remarks } = await request.json()

    const remark = await prisma.remark.create({
      data: {
        milestoneId,
        facultyId: session.user.facultyId,
        remarks
      }
    })

    return NextResponse.json(remark, { status: 201 })
  } catch (error) {
    console.error('Error creating remark:', error)
    return NextResponse.json({ error: 'Failed to create remark' }, { status: 500 })
  }
}
