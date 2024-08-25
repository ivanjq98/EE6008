import { getServerSession } from 'next-auth'
import Link from 'next/link'

import { Header } from '@/src/components/header'
import { TypographyH4 } from '@/src/components/typography'
import { Badge } from '@/src/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card'
import { authOptions } from '@/src/lib/auth'
import { getStudentAllocatedProject } from '@/src/server/student'

const StudentAllocatedProjectPage = async () => {
  const session = await getServerSession(authOptions)
  const user = session?.user
  if (!user) return null
  if (!user.studentId) return null

  const data = await getStudentAllocatedProject(user.studentId)

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
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  )
}

export default StudentAllocatedProjectPage
