import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { Header } from '@/src/components/header'
import { AssignModeratorsTable } from '@/src/app/faculty/project-moderator/project-moderators-table'
import { authOptions } from '@/src/lib/auth'
import { prisma } from '@/src/lib/prisma'

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
          facultyProposalReviewStart: true,
          facultyProposalReviewEnd: true
        }
      }
    }
  })

  if (!activeSemester || !activeSemester.timeline) {
    return <Header title='Assign Moderators' description='No active semester found.' />
  }

  const currentDate = new Date()
  const reviewStart = new Date(activeSemester.timeline.facultyProposalReviewStart)
  const reviewEnd = new Date(activeSemester.timeline.facultyProposalReviewEnd)

  if (currentDate < reviewStart || currentDate > reviewEnd) {
    return <Header title='Assign Moderators' description='Moderator assignment is not open at this time.' />
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
