import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/src/lib/auth'
import { updateAppealStatus } from '@/src/app/actions/admin/appeal'

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    console.log('Appeal API route called')

    const session = await getServerSession(authOptions)
    console.log('Session:', session)

    if (!session || session.user.role !== 'ADMIN') {
      console.log('Unauthorized: No valid session or not an admin')
      return NextResponse.json({ status: 'ERROR', message: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    console.log('Request body:', body)

    const { action } = body
    const appealId = params.id

    if (!appealId || !action) {
      console.log('Missing required fields')
      return NextResponse.json({ status: 'ERROR', message: 'Missing required fields' }, { status: 400 })
    }

    const updatedAppeal = await updateAppealStatus(appealId, action)

    console.log('Appeal updated:', updatedAppeal)
    return NextResponse.json({ status: 'SUCCESS', data: updatedAppeal }, { status: 200 })
  } catch (error) {
    console.error('Error in appeal API route:', error)
    return NextResponse.json(
      {
        status: 'ERROR',
        message: 'Internal Server Error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
