import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/src/lib/prisma'
import { authOptions } from '@/src/lib/auth'
import { AppealsList } from '@/src/components/student/appeal/AppealsList'
import { Header } from '@/src/components/header'

export default async function AdminAppealsPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/login')
  }

  const [appeals, projects] = await Promise.all([
    prisma.projectAppeal.findMany({
      include: {
        student: {
          include: {
            user: true
          }
        },
        currentProject: true,
        requestedProject: true
      }
    }),
    prisma.project.findMany({
      select: {
        id: true,
        title: true
      }
    })
  ])

  return (
    <div className='space-y-4'>
      <Header title='Student Project Appeal' />
      <AppealsList appeals={appeals} projects={projects} />
    </div>
  )
}
