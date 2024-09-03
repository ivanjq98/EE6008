import { NextResponse } from 'next/server'
import { prisma } from '@/src/lib/prisma'

export async function POST(request: Request) {
  try {
    const { SUPERVISOR, MODERATOR } = await request.json()

    console.log('Received weightages:', { SUPERVISOR, MODERATOR })

    if (typeof SUPERVISOR !== 'number' || typeof MODERATOR !== 'number') {
      return NextResponse.json({ message: 'Invalid weightage values' }, { status: 400 })
    }

    if (SUPERVISOR + MODERATOR !== 100) {
      return NextResponse.json({ message: 'Weightages must add up to 100%' }, { status: 400 })
    }

    const [supervisorResult, moderatorResult] = await prisma.$transaction([
      prisma.facultyRoleWeightage.upsert({
        where: { role: 'SUPERVISOR' },
        update: { weightage: SUPERVISOR },
        create: { role: 'SUPERVISOR', weightage: SUPERVISOR }
      }),
      prisma.facultyRoleWeightage.upsert({
        where: { role: 'MODERATOR' },
        update: { weightage: MODERATOR },
        create: { role: 'MODERATOR', weightage: MODERATOR }
      })
    ])

    console.log('Updated weightages:', { supervisorResult, moderatorResult })

    return NextResponse.json({
      message: 'Weightages updated successfully',
      data: {
        SUPERVISOR: supervisorResult.weightage,
        MODERATOR: moderatorResult.weightage
      }
    })
  } catch (error) {
    console.error('Error updating weightages:', error)
    return NextResponse.json({ message: 'Failed to update weightages' }, { status: 500 })
  }
}
