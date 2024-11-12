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

const StudentAllocatedProjectPage = async () => {
  const session = await getServerSession(authOptions)
  const user = session?.user
  if (!user) return null
  if (!user.studentId) return null

  const data = await getStudentAllocatedProject(user.studentId)
  const isInAppealPeriod = await isAppealPeriod()
  const availableProjects = await getAvailableProjects()

  return (
    <section className='space-y-6 py-6'>
      <div className='flex flex-col gap-4'>
        <Header title='Allocated Project Page!' description='See your allocated project here' />
        {data == null ? (
          <div className='grid gap-2'>
            <p className='text-md text-secondary-foreground md:text-lg'>You have not allocated to any project</p>
            <div>
              <Link className='text-primary hover:underline' href={'/student'}>
                Back to dashboard
              </Link>
            </div>
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>{data.title}</CardTitle>
              <CardDescription className='text-md'>{data.faculty}</CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <Badge>{data.programme}</Badge>
              <div className='space-y-2'>
                <TypographyH4>Description:</TypographyH4>
                <p>{data.description}</p>
              </div>
              <div>
                <TypographyH4>Members:</TypographyH4>
                <ol className='my-2 ml-6 list-decimal [&>li]:mt-2'>
                  {data.members.map((member, i) => (
                    <li className='text-md' key={i}>
                      {member}
                    </li>
                  ))}
                </ol>
                {isInAppealPeriod && (
                  <div className='mt-6'>
                    <AppealButton
                      studentId={user.studentId}
                      currentProjectId={data.id}
                      availableProjects={availableProjects}
                    />
                    <Link href='/student/view-projects'>
                      <Button
                        variant='secondary'
                        style={{ marginTop: '20px' }}
                        className='mt-2 inline-flex justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'
                      >
                        View All Projects
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  )
}

export default StudentAllocatedProjectPage
