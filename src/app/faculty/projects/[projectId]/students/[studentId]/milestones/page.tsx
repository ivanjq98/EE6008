import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/src/lib/auth'
import { prisma } from '@/src/lib/prisma'
import { FacultyRemarkForm } from '@/src/app/faculty/projects/[projectId]/students/[studentId]/milestones/FacultyRemarkForm'
import Link from 'next/link'

interface PageProps {
  params: { projectId: string; studentId: string }
}

export default async function FacultyStudentMilestonesPage({ params }: PageProps) {
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
        where: {
          id: params.studentId
        },
        include: {
          user: true,
          Milestone: {
            orderBy: {
              startDate: 'asc'
            },
            include: {
              Remark: true
            }
          }
        }
      }
    }
  })

  if (!project || project.students.length === 0) {
    return <div className='container mx-auto p-4'>Project or student not found</div>
  }

  const student = project.students[0]

  return (
    <div className='container mx-auto p-4'>
      <h1 className='mb-4 text-2xl font-bold'>Remarks for {project.title}</h1>
      <div className='mb-2 flex items-center justify-between'>
        <h2 className='text-xl font-semibold'>Student: {student.user.name}</h2>
        <Link
          href={`/faculty/projects/${params.projectId}/students/${params.studentId}/timeline`}
          className='rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600'
        >
          Timeline
        </Link>
      </div>
      {student.Milestone.map((milestone) => (
        <div key={milestone.id} className='mb-4 rounded border p-4'>
          <h3 className='font-semibold'>{milestone.objective}</h3>
          <p className='text-gray-600'>{milestone.description}</p>
          <p>Start Date: {milestone.startDate.toLocaleDateString()}</p>
          <p>End Date: {milestone.endDate.toLocaleDateString()}</p>
          <p>Status: {milestone.status}</p>
          {milestone.Remark && milestone.Remark.length > 0 ? (
            <div className='mt-2'>
              <h4 className='font-semibold'>Previous Remarks:</h4>
              {milestone.Remark.map((remark, index) => (
                <p key={index} className='text-gray-600'>
                  {remark.remarks}
                </p>
              ))}
            </div>
          ) : null}
          <FacultyRemarkForm milestoneId={milestone.id} />
        </div>
      ))}
    </div>
  )
}
