import { getServerSession } from 'next-auth'
import Link from 'next/link'
import { Header } from '@/src/components/header'
import { TypographyH4 } from '@/src/components/typography'
import { Badge } from '@/src/components/ui/badge'
import { Button } from '@/src/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card'
import { authOptions } from '@/src/lib/auth'
import { getStudentAllocatedProject, getAvailableProjects } from '@/src/server/student'
import { AppealButton } from '@/src/components/student/appeal/AppealButton'
import { isAppealPeriod } from '@/src/lib/date'
import { prisma } from '@/src/lib/prisma'

const StudentAllocatedProjectPage = async () => {
  const session = await getServerSession(authOptions)
  const user = session?.user

  if (!user?.studentId) {
    return null
  }

  // Get active semester
  const activeSemester = await prisma.semester.findFirst({
    where: {
      active: true
    },
    select: {
      id: true
    }
  })

  if (!activeSemester) {
    return (
      <section className='space-y-6 py-6'>
        <Header title='Error' description='No active semester found.' />
        <div>
          <Link className='text-primary hover:underline' href='/student'>
            Back to dashboard
          </Link>
        </div>
      </section>
    )
  }

  try {
    // Get project for current semester
    const project = await prisma.project.findFirst({
      where: {
        programme: {
          semesterId: activeSemester.id
        },
        students: {
          some: {
            id: user.studentId
          }
        }
      },
      include: {
        faculties: {
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
        },
        programme: true,
        students: {
          include: {
            user: {
              select: {
                name: true
              }
            }
          }
        }
      }
    })

    const isInAppealPeriod = await isAppealPeriod()
    const availableProjects = await getAvailableProjects()

    if (!project) {
      return (
        <section className='space-y-6 py-6'>
          <Header title='Allocated Project Page!' description='See your allocated project here' />
          <div className='grid gap-2'>
            <p className='text-md text-secondary-foreground md:text-lg'>
              You have not been allocated to any project in the current semester
            </p>
            <div>
              <Link className='text-primary hover:underline' href='/student'>
                Back to dashboard
              </Link>
            </div>
          </div>
        </section>
      )
    }

    const projectData = {
      id: project.id,
      title: project.title,
      faculty: project.faculties[0]?.faculty.user.name || 'No faculty assigned',
      programme: project.programme.name,
      description: project.description || 'No description available',
      members: project.students.map((student) => student.user.name)
    }

    return (
      <section className='space-y-6 py-6'>
        <div className='flex flex-col gap-4'>
          <Header title='Allocated Project Page!' description='See your allocated project here' />
          <Card>
            <CardHeader>
              <CardTitle>{projectData.title}</CardTitle>
              <CardDescription className='text-md'>{projectData.faculty}</CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <Badge>{projectData.programme}</Badge>
              <div className='space-y-2'>
                <TypographyH4>Description:</TypographyH4>
                <p>{projectData.description}</p>
              </div>
              <div>
                <TypographyH4>Members:</TypographyH4>
                <ol className='my-2 ml-6 list-decimal [&>li]:mt-2'>
                  {projectData.members.map((member, i) => (
                    <li className='text-md' key={i}>
                      {member}
                    </li>
                  ))}
                </ol>
                {isInAppealPeriod && (
                  <div className='mt-6'>
                    <AppealButton
                      studentId={user.studentId}
                      currentProjectId={projectData.id}
                      availableProjects={availableProjects}
                    />
                    <Link href='/student/view-projects'>
                      <Button variant='secondary' className='mt-4 w-full sm:w-auto'>
                        View All Projects
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    )
  } catch (error) {
    console.error('Error fetching project:', error)
    return (
      <section className='space-y-6 py-6'>
        <Header title='Error' description='An error occurred while loading your project information.' />
        <div>
          <Link className='text-primary hover:underline' href='/student'>
            Back to dashboard
          </Link>
        </div>
      </section>
    )
  }
}

export default StudentAllocatedProjectPage
