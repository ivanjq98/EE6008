import { notFound, redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { prisma } from '@/src/lib/prisma'
import { authOptions } from '@/src/lib/auth'
import { GanttChart } from '@/src/components/student/timeline/GanttChart'

interface PageProps {
  params: { projectId: string }
}

const StudentGanttChartPage = async ({ params }: PageProps) => {
  const session = await getServerSession(authOptions)

  if (!session || !session.user.studentId) {
    redirect('/login')
  }

  try {
    const project = await prisma.project.findUnique({
      where: {
        id: params.projectId,
        students: {
          some: {
            id: session.user.studentId
          }
        }
      },
      include: {
        students: {
          include: {
            user: true,
            Milestone: {
              orderBy: {
                startDate: 'asc'
              }
            }
          }
        },
        programme: {
          include: {
            semester: {
              include: {
                timeline: true
              }
            }
          }
        }
      }
    })

    if (!project) {
      notFound()
    }

    const timeline = project.programme.semester.timeline

    if (!timeline) {
      return <div>Semester timeline not found</div>
    }

    const allMilestones = project.students.flatMap((student) =>
      student.Milestone.map((milestone) => ({
        ...milestone,
        studentName: student.user.name
      }))
    )

    return (
      <div className='container mx-auto p-4'>
        <h1 className='mb-4 text-2xl font-bold'>{project.title} - Timeline</h1>
        <GanttChart
          milestones={allMilestones}
          startDate={timeline.studentRegistrationStart}
          endDate={timeline.studentResultRelease}
        />
      </div>
    )
  } catch (error) {
    console.error('Error fetching project:', error)
    return (
      <div className='container mx-auto p-4'>
        <h1 className='mb-4 text-2xl font-bold'>Error</h1>
        <p>An error occurred while loading the project. Please try again later.</p>
      </div>
    )
  }
}

export default StudentGanttChartPage
