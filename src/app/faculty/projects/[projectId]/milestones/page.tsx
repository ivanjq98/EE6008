import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/src/lib/auth'
import { prisma } from '@/src/lib/prisma'
import { FacultyRemarkForm } from './FacultyRemarkForm'
import Link from 'next/link'

interface PageProps {
  params: { projectId: string }
}

export default async function FacultyProjectMilestonesPage({ params }: PageProps) {
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

  if (!project) {
    return <div className='container mx-auto p-4'>Project not found</div>
  }

  return (
    <div className='container mx-auto p-4'>
      <h1 className='mb-4 text-2xl font-bold'>Milestones for {project.title}</h1>
      <Link
        href={`/faculty/projects/${params.projectId}/timeline`}
        className='mb-6 inline-block rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600'
      >
        View Project Timeline
      </Link>
      {project.students.map((student, studentIndex) => (
        <div key={student.id} className='mb-8'>
          <h2 className='mb-4 rounded bg-gray-100 p-2 text-xl font-semibold'>Student: {student.user.name}</h2>
          {student.Milestone.length > 0 ? (
            student.Milestone.map((milestone) => (
              <div key={milestone.id} className='mb-4 rounded border p-4'>
                <h3 className='text-lg font-semibold'>{milestone.objective}</h3>
                <p className='mt-2 text-gray-600'>{milestone.description}</p>
                <div className='mt-2 grid grid-cols-2 gap-2'>
                  <p>
                    <span className='font-medium'>Start Date:</span> {milestone.startDate.toLocaleDateString()}
                  </p>
                  <p>
                    <span className='font-medium'>End Date:</span> {milestone.endDate.toLocaleDateString()}
                  </p>
                  <p>
                    <span className='font-medium'>Status:</span> {milestone.status}
                  </p>
                </div>
                {milestone.Remark && milestone.Remark.length > 0 && (
                  <div className='mt-4'>
                    <h4 className='font-semibold'>Previous Remarks:</h4>
                    {milestone.Remark.map((remark, index) => (
                      <p key={index} className='mt-1 text-gray-600'>
                        {remark.remarks}
                      </p>
                    ))}
                  </div>
                )}
                <div className='mt-4'>
                  <FacultyRemarkForm milestoneId={milestone.id} />
                </div>
              </div>
            ))
          ) : (
            <p className='italic text-gray-600'>No milestones created yet for this student.</p>
          )}
          {studentIndex < project.students.length - 1 && <hr className='my-8 border-gray-300' />}
        </div>
      ))}
    </div>
  )
}
