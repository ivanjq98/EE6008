// src/app/faculty/projects/page.tsx
import { getServerSession } from 'next-auth'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { authOptions } from '@/src/lib/auth'
import { prisma } from '@/src/lib/prisma'
import { Header } from '@/src/components/header'
import { TypographyP } from '@/src/components/typography'

export default async function FacultyProjectsPage() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user.facultyId) {
    redirect('/login')
  }

  const activeSemester = await prisma.semester.findFirst({
    where: {
      active: true
    },
    select: {
      id: true,
      name: true
    }
  })

  if (!activeSemester) {
    return (
      <div className='container mx-auto p-4'>
        <Header title='Error' description='No active semester found.' />
      </div>
    )
  }

  const projects = await prisma.project.findMany({
    where: {
      faculties: {
        some: {
          facultyId: session.user.facultyId
        }
      },
      programme: {
        semesterId: activeSemester.id
      }
    },
    select: {
      id: true,
      title: true
    }
  })


  return (
    <div className='container mx-auto p-4'>
      <Header
        title='Student Milestones & Remarks'
        description='Add remarks on student milestones and view their progress timeline.'
      />
      <TypographyP>Your Projects:</TypographyP>
      <ol className='my-4 ml-6 list-decimal [&>li]:mt-2'>
        {projects.map((project) => (
          <li key={project.id}>
            <Link href={`/faculty/projects/${project.id}/milestones`} className='underline-offset-4 hover:underline'>
              {project.title}
            </Link>
          </li>
        ))}
      </ol>
    </div>
  )
}
