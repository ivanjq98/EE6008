import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/src/lib/auth'
import { prisma } from '@/src/lib/prisma'
import { FacultyRemarkForm } from './FacultyRemarkForm'
import Link from 'next/link'
import { formatInTimeZone } from 'date-fns-tz'

interface PageProps {
  params: { projectId: string }
}

const formatMilestoneStatus = (status: string): string => {
  const statusMap: { [key: string]: string } = {
    NOT_STARTED: 'Not started (0%)',
    STARTED: 'Started (20%)',
    NEARLY_HALF: 'Nearly Half (40%)',
    HALF_WAY_THERE: 'Half Way There (60%)',
    ALMOST_DONE: 'Almost Done (80%)',
    COMPLETED: 'Completed (100%)'
  }
  return statusMap[status] || status
}

export default async function FacultyProjectMilestonesPage({ params }: PageProps) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user?.facultyId) {
    redirect('/login')
  }

  try {
    const project = await prisma.project.findUnique({
      where: {
        id: params.projectId,
        faculties: {
          some: {
            facultyId: session.user.facultyId
          }
        }
      },
      include: {
        students: {
          include: {
            user: true,
            Milestone: {
              include: {
                Remark: {
                  orderBy: {
                    updatedAt: 'desc'
                  }
                }
              }
            }
          }
        }
      }
    })

    if (!project) {
      return <div className='container mx-auto p-4'>Project not found or you don&apos;t have access to it.</div>
    }

    // Flatten and sort all milestones
    const allMilestones = project.students
      .flatMap((student) =>
        student.Milestone.map((milestone) => ({
          ...milestone,
          studentName: student.user.name
        }))
      )
      .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())

    return (
      <div className='container mx-auto p-4'>
        <h1 className='mb-4 text-2xl font-bold'>Milestones for {project.title}</h1>
        <Link
          href={`/faculty/projects/${params.projectId}/timeline`}
          className='mb-6 inline-block rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600'
        >
          View Project Timeline
        </Link>
        {allMilestones.map((milestone) => (
          <div key={milestone.id} className='mb-4 rounded border p-4'>
            <h2 className='text-lg font-semibold'>Objective: {milestone.objective}</h2>
            {milestone.description && <p className='text-gray-600'>Description: {milestone.description}</p>}

            <div className='mt-2 grid grid-cols-2 gap-2'>
              <p>
                <span className='font-medium'>Start Date:</span>{' '}
                {formatInTimeZone(milestone.startDate, 'Asia/Singapore', 'PPP h:mm a')}
              </p>
              <p>
                <span className='font-medium'>End Date:</span>{' '}
                {formatInTimeZone(milestone.endDate, 'Asia/Singapore', 'PPP h:mm a')}
              </p>
              <p>
                <span className='font-medium'>Status:</span> {formatMilestoneStatus(milestone.status)}
              </p>
              <p>
                <span className='font-medium'>Updated At:</span>{' '}
                {formatInTimeZone(milestone.updatedAt, 'Asia/Singapore', 'PPP h:mm a')}
              </p>
              <p>
                <span className='font-medium'>Student:</span> {milestone.studentName}
              </p>
            </div>
            {milestone.Remark.length > 0 && (
              <div className='mt-4'>
                <h4 className='font-semibold'>Previous Remarks:</h4>
                {milestone.Remark.map((remark) => (
                  <p key={remark.id} className='mt-1 text-gray-600'>
                    {remark.remarks} - {formatInTimeZone(remark.updatedAt, 'Asia/Singapore', 'PPP h:mm a')}
                  </p>
                ))}
              </div>
            )}
            <div className='mt-4'>
              <FacultyRemarkForm milestoneId={milestone.id} />
            </div>
          </div>
        ))}
      </div>
    )
  } catch (error) {
    console.error('Error fetching project data:', error)
    return <div className='container mx-auto p-4'>An error occurred while fetching project data.</div>
  }
}
