// src/app/faculty/projects/[projectId]/students/page.tsx
import { getServerSession } from 'next-auth'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { authOptions } from '@/src/lib/auth'
import { prisma } from '@/src/lib/prisma'

interface PageProps {
  params: { projectId: string }
}

export default async function FacultyProjectStudentsPage({ params }: PageProps) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user.facultyId) {
    redirect('/login')
  }

  const project = await prisma.project.findUnique({
    where: {
      id: params.projectId,
      facultyId: session.user.facultyId
    },
    include: {
      students: {
        select: {
          id: true,
          user: {
            select: {
              name: true
            }
          }
        }
      }
    }
  })

  if (!project) {
    return <div className='container mx-auto p-4'>Project not found or you don't have access to it.</div>
  }

  return (
    <div className='container mx-auto p-4'>
      <h1 className='mb-4 text-2xl font-bold'>{project.title} - Students</h1>
      <ul className='space-y-2'>
        {project.students.map((student) => (
          <li key={student.id} className='rounded border p-2'>
            <Link
              href={`/faculty/projects/${params.projectId}/students/${student.id}/milestones`}
              className='text-blue-500 hover:underline'
            >
              {student.user.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
