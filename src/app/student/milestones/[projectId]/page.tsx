import { notFound, redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { StudentMilestoneForm } from './StudentMilestoneForm'
import { MilestoneList } from './MilestoneList'
import { prisma } from '@/src/lib/prisma'
import { authOptions } from '@/src/lib/auth'

interface PageProps {
  params: { projectId: string }
}

const StudentMilestonePage = async ({ params }: PageProps) => {
  const session = await getServerSession(authOptions)

  if (!session || !session.user.studentId) {
    redirect('/login')
  }

  try {
    const project = await prisma.project.findUnique({
      where: {
        id: params.projectId
      },
      include: {
        Milestone: {
          include: {
            student: {
              include: {
                user: {
                  select: {
                    name: true
                  }
                }
              }
            },
            Remark: {
              include: {
                faculty: {
                  include: {
                    user: {
                      select: {
                        name: true
                      }
                    }
                  }
                }
              }
            }
          },
          orderBy: {
            startDate: 'asc'
          }
        }
      }
    })

    if (!project) {
      notFound()
    }

    return (
      <div className='container mx-auto p-4'>
        <h1 className='mb-4 text-2xl font-bold'>{project.title}</h1>
        <MilestoneList milestones={project.Milestone} />
        <div className='mt-8'>
          <h2 className='mb-4 text-xl font-semibold'>Create New Milestone</h2>
          <StudentMilestoneForm projectId={project.id} />
        </div>
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

export default StudentMilestonePage
