import _ from 'lodash'
import { getServerSession } from 'next-auth'
import Link from 'next/link'

import { Header } from '@/src/components/header'
import { TypographyP } from '@/src/components/typography'
import { authOptions } from '@/src/lib/auth'
import { prisma } from '@/src/lib/prisma'
import { ProjectStatus } from '@prisma/client'

const MarkPage = async () => {
  const session = await getServerSession(authOptions)
  const user = session?.user

  if (!user || !user.facultyId) return null

  const activeSemester = await prisma.semester.findFirst({
    where: {
      active: true
    },
    include: {
      timeline: {
        select: {
          facultyMarkEntryStart: true,
          facultyMarkEntryEnd: true
        }
      }
    }
  })

  const notMarkingPeriodJSX = (
    <div className='space-y-4'>
      <Header title='Marking' description='You can only mark projects during the faculty mark entry period' />
      <div>
        <Link className='text-primary hover:underline' href={'/faculty'}>
          Back to dashboard
        </Link>
      </div>
    </div>
  )

  // check if the current date is between the faculty mark entry start and end date
  if (!activeSemester || !activeSemester.timeline) return notMarkingPeriodJSX

  const currentDate = new Date()
  const facultyMarkEntryStart = new Date(activeSemester.timeline.facultyMarkEntryStart)
  const facultyMarkEntryEnd = new Date(activeSemester.timeline.facultyMarkEntryEnd)

  if (currentDate < facultyMarkEntryStart || currentDate > facultyMarkEntryEnd) return notMarkingPeriodJSX

  const projectsWithRoles = await prisma.projectFaculty.findMany({
    where: {
      facultyId: user.facultyId,
      project: {
        status: ProjectStatus.APPROVED,
        programme: {
          semester: {
            active: true
          }
        }
      }
    },
    include: {
      project: true
    }
  })

  return (
    <div className='space-y-4'>
      <Header title='Marking' description='Grade your student here.' />

      <div>
        <TypographyP>Select project to grade:</TypographyP>
        <ol className='my-4 ml-6 list-decimal [&>li]:mt-2'>
          {projectsWithRoles.map(({ project, role }) => (
            <li key={project.id}>
              <Link className='underline-offset-4 hover:underline' href={`/faculty/mark/${project.id}`}>
                {project.title} - {role === 'SUPERVISOR' ? 'Supervisor' : 'Moderator'}
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}

export default MarkPage
