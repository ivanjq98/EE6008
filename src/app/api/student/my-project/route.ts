import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { prisma } from '@/src/lib/prisma'
import { authOptions } from '@/src/lib/auth'

const MAX_APPEALS = 3

export async function POST(request: Request) {
  try {
    console.log('Appeal submission/update API route called')

    const session = await getServerSession(authOptions)
    if (!session || !session.user?.studentId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { studentId, currentProjectId, requestedProjectId, reason, appealId } = body

    if (!studentId || !currentProjectId || !requestedProjectId || !reason) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (studentId !== session.user.studentId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check the number of existing appeals for this student
    const appealCount = await prisma.projectAppeal.count({
      where: { studentId: studentId }
    })

    let appeal
    if (appealId) {
      // Update existing appeal
      appeal = await prisma.projectAppeal.update({
        where: { id: appealId },
        data: {
          currentProjectId,
          requestedProjectId,
          reason,
          updatedAt: new Date()
        }
      })
      console.log('Appeal updated:', appeal)
    } else {
      // Create new appeal
      if (appealCount >= MAX_APPEALS) {
        return NextResponse.json({ error: 'Maximum number of appeals reached' }, { status: 400 })
      }
      appeal = await prisma.projectAppeal.create({
        data: {
          studentId,
          currentProjectId,
          requestedProjectId,
          reason,
          status: 'PENDING'
        }
      })
      console.log('New appeal created:', appeal)
    }

    return NextResponse.json(appeal, { status: 201 })
  } catch (error) {
    console.error('Error in appeal submission/update API route:', error)
    return NextResponse.json(
      { error: 'Internal Server Error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.studentId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId')

    if (!studentId) {
      return NextResponse.json({ error: 'Missing studentId' }, { status: 400 })
    }

    if (studentId !== session.user.studentId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const appeals = await prisma.projectAppeal.findMany({
      where: { studentId: studentId },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(appeals)
  } catch (error) {
    console.error('Error fetching appeals:', error)
    return NextResponse.json(
      { error: 'Internal Server Error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
