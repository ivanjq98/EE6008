import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { Header } from '@/src/components/header'
import { AssignModeratorsTable } from '@/src/components/faculty/project-moderator/project-moderators-table'
import { authOptions } from '@/src/lib/auth'
import { prisma } from '@/src/lib/prisma'
import { Alert, AlertDescription, AlertTitle } from '@/src/components/ui/alert'
import { InfoIcon } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'

const AssignModeratorsPage = async () => {
  const session = await getServerSession(authOptions)
  const user = session?.user

  if (!user?.facultyId) {
    redirect('/login')
  }

  const activeSemester = await prisma.semester.findFirst({
    where: { active: true },
    include: {
      timeline: {
        select: {
          facultyMarkEntryStart: true,
          facultyMarkEntryEnd: true
        }
      }
    }
  })

  if (!activeSemester || !activeSemester.timeline) {
    return <Header title='Assign Moderators' description='No active semester found.' />
  }

  const currentDate = new Date()
  const reviewStart = new Date(activeSemester.timeline.facultyMarkEntryStart)
  const reviewEnd = new Date(activeSemester.timeline.facultyMarkEntryEnd)

  if (currentDate >= reviewStart) {
    return (
      <div className='container mx-auto p-4'>
        <Header title='Moderator Assignment Closed' description='The moderator assignment period has ended.' />
        <Alert>
          <InfoIcon className='h-4 w-4' />
          <AlertTitle>Assignment Period Ended</AlertTitle>
          <AlertDescription>
            The moderator assignment period ended on {format(reviewStart, 'PPP')} at {format(reviewStart, 'h:mm a')}.
            Mark entry period is now {currentDate > reviewEnd ? 'closed' : 'open'}.
          </AlertDescription>
        </Alert>
        <div className='mt-4'>
          <Link href='/faculty' className='text-primary hover:underline'>
            Return to dashboard
          </Link>
        </div>
      </div>
    )
  }

  const projects = await prisma.project.findMany({
    where: {
      programme: {
        leaderId: user.facultyId,
        semester: { active: true }
      },
      status: 'APPROVED' // Only fetch approved projects
    },
    include: {
      faculty: { select: { user: { select: { name: true } } } },
      faculties: {
        where: { role: 'MODERATOR' },
        include: { faculty: { select: { user: { select: { name: true } } } } }
      },
      programme: { select: { name: true } }
    }
  })

  const availableFaculty = await prisma.faculty.findMany({
    where: {
      NOT: { id: user.facultyId } // Exclude the program leader
    },
    select: {
      id: true,
      user: { select: { name: true } }
    }
  })

  const projectsData = projects.map((project) => ({
    id: project.id,
    title: project.title,
    supervisor: project.faculty.user.name,
    moderator: project.faculties.find((f) => f.role === 'MODERATOR')?.faculty.user.name || 'Not assigned',
    programme: project.programme.name
  }))

  const facultyOptions = availableFaculty.map((faculty) => ({
    value: faculty.id,
    label: faculty.user.name
  }))

  return (
    <div className='space-y-4'>
      <Header title='Assign Moderators' description='Assign moderators to approved projects' />
      <AssignModeratorsTable projects={projectsData} facultyOptions={facultyOptions} />
    </div>
  )
}

export default AssignModeratorsPage
