import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/src/lib/auth'
import { createMilestone } from '@/src/server/data/milestone'

export async function POST(request: Request) {
  try {
    console.log('Milestone API route called')

    const session = await getServerSession(authOptions)
    console.log('Session:', session)

    if (!session || !session.user.studentId) {
      console.log('Unauthorized: No valid session or studentId')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    console.log('Request body:', body)

    const { projectId, objective, description, startDate, endDate, status } = body

    if (!projectId || !objective || !startDate || !endDate || !status) {
      console.log('Missing required fields')
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const milestone = await createMilestone({
      projectId,
      objective,
      description,
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
      status
    })

    console.log('Milestone created:', milestone)
    return NextResponse.json(milestone, { status: 201 })
  } catch (error) {
    console.error('Error in milestone API route:', error)
    return NextResponse.json(
      { error: 'Internal Server Error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
