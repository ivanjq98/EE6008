// src/app/faculty/projects/page.tsx
import { getServerSession } from 'next-auth'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { authOptions } from '@/src/lib/auth'
import { prisma } from '@/src/lib/prisma'

export default async function FacultyProjectsPage() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user.facultyId) {
    redirect('/login')
  }

  const projects = await prisma.project.findMany({
    where: {
      facultyId: session.user.facultyId
    },
    select: {
      id: true,
      title: true
    }
  })

  return (
    <div className='container mx-auto p-4'>
      <h1 className='mb-4 text-2xl font-bold'>Your Projects</h1>
      <ul className='space-y-2'>
        {projects.map((project) => (
          <li key={project.id} className='rounded border p-2'>
            <Link href={`/faculty/projects/${project.id}/students`} className='text-blue-500 hover:underline'>
              {project.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
