import { notFound, redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { StudentMilestoneForm } from './StudentMilestoneForm'
import { MilestoneListWrapper } from './MilestoneListWrapper'
import { prisma } from '@/src/lib/prisma'
import { authOptions } from '@/src/lib/auth'
import { ExtendedMilestone } from './MilestoneList'
import { Header } from '@/src/components/header'
import { Card, CardContent } from '@/src/components/ui/card'
import Link from 'next/link'

interface PageProps {
  params: { projectId: string }
}

const StudentMilestonePage = async ({ params }: PageProps) => {
  const session = await getServerSession(authOptions)

  if (!session?.user?.studentId || !session?.user?.email) {
    redirect('/login')
  }

  try {
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

    const project = await prisma.project.findFirst({
      where: {
        id: params.projectId,
        programme: {
          semesterId: activeSemester.id
        }
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
      return (
        <section className='space-y-6 py-6'>
          <Header
            title='Milestone & Timeline'
            description="The requested project could not be found or you don't have access to it."
          />
          <div>
            <Link className='text-primary hover:underline' href='/student'>
              Back to dashboard
            </Link>
          </div>
        </section>
      )
    }

    return (
      <div className='container mx-auto p-4'>
        <Header title={project.title} description='Manage your project milestones and track progress' />

        <Card className='mt-6'>
          <CardContent className='p-6'>
            <MilestoneListWrapper
              milestones={project.Milestone as ExtendedMilestone[]}
              currentUserEmail={session.user.email}
            />
          </CardContent>
        </Card>

        <Card className='mt-8'>
          <CardContent className='p-6'>
            <h2 className='mb-4 text-xl font-semibold'>Create New Milestone</h2>
            <StudentMilestoneForm projectId={project.id} />
          </CardContent>
        </Card>
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
