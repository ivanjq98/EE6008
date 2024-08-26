import _ from 'lodash'
import { getServerSession } from 'next-auth'
import Link from 'next/link'

import SectionGrade from '@/src/components/faculty/grade/section-grade'
import { Header } from '@/src/components/header'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/src/components/tabs'
import { Button } from '@/src/components/ui/button'
import { authOptions } from '@/src/lib/auth'
import { prisma } from '@/src/lib/prisma'

const MarkProjectPage = async ({ params }: { params: { slug: string } }) => {
  const session = await getServerSession(authOptions)

  if (!session) return null

  const projectDetail = await prisma.project.findUnique({
    where: {
      id: params.slug
    },
    include: {
      programme: {
        select: {
          name: true,
          semesterId: true,
          leaderId: true
        }
      },
      students: {
        select: {
          id: true,
          matriculationNumber: true,
          user: {
            select: {
              name: true
            }
          }
        }
      }
    }
  })

  if (!projectDetail) {
    return (
      <div className='space-y-8'>
        <Header title='Marking' description='Grade your student here.' />
        <div>Project not found.</div>
        <div>
          <Link href='/faculty/mark'>
            <Button>Back to grading page</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (
    projectDetail.facultyId !== session.user.facultyId &&
    projectDetail.programme.leaderId !== session.user.facultyId
  ) {
    return (
      <div>
        <Header title='Marking' description='Grade your student here.' />
        <div>You are not authorized to access this page.</div>
      </div>
    )
  }

  const projectStudents = projectDetail.students.map((student) => ({
    name: student.user.name,
    id: student.id,
    matriculationNumber: student.matriculationNumber
  }))

  const semesterGradeType = await prisma.gradeType.findMany({
    where: {
      semesterId: projectDetail.programme.semesterId
    },
    select: {
      name: true,
      id: true,
      weightage: true
    }
  })

  return (
    <div className='space-y-8'>
      <Header title='Marking' description='Grade your student here.' />

      <Tabs defaultValue={semesterGradeType[0].name || undefined}>
        <TabsList>
          {semesterGradeType.map((grade) => (
            <TabsTrigger value={grade.name} key={grade.id}>
              {grade.name} ({grade.weightage}%)
            </TabsTrigger>
          ))}
        </TabsList>
        {semesterGradeType.map((grade) => (
          <TabsContent value={grade.name} key={grade.id}>
            <SectionGrade studentsData={projectStudents} projectId={projectDetail.id} semesterGradeTypeId={grade.id} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}

export default MarkProjectPage
