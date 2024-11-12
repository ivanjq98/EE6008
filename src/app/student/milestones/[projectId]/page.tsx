import { notFound, redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { StudentMilestoneForm } from './StudentMilestoneForm'
import { MilestoneListWrapper } from './MilestoneListWrapper'
import { prisma } from '@/src/lib/prisma'
import { authOptions } from '@/src/lib/auth'
import { ExtendedMilestone } from './MilestoneList'
import Link from 'next/link'
import { Button } from '@/src/components/ui/button'
import { Header } from '@/src/components/header'

interface PageProps {
  params: { projectId: string }
}

const StudentMilestonePage = async ({ params }: PageProps) => {
  const session = await getServerSession(authOptions)

  if (!session?.user?.studentId || !session?.user?.email) {
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
                    name: true,
                    email: true
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
                        name: true,
                        email: true
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
        <Header title={project.title} description='Manage your project milestones and view timeline' />

        <div className='mb-6 flex items-center justify-between'>
          <Link href={`/student/gantt-chart/`}>
            <Button variant='secondary'>View Gantt Chart</Button>
          </Link>
        </div>

        <MilestoneListWrapper
          milestones={project.Milestone as ExtendedMilestone[]}
          currentUserEmail={session.user.email}
        />

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
        <Header title='Error' description='An error occurred while loading the project. Please try again later.' />
      </div>
    )
  }
}

export default StudentMilestonePage
