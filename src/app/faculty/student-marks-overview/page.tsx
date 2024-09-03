import { Suspense } from 'react'
import { prisma } from '@/src/lib/prisma'
import { StudentMark } from './columns'
import { ClientDataTable } from './ClientDataTable'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/src/lib/auth'
import { redirect } from 'next/navigation'
import { FacultyRole } from './columns'

async function getCurrentSemesterId() {
  const currentSemester = await prisma.semester.findFirst({
    where: { active: true },
    select: { id: true }
  })

  if (!currentSemester) {
    throw new Error('No active semester found')
  }

  return currentSemester.id
}

async function getFacultyProjects(facultyId: string) {
  return await prisma.projectFaculty.findMany({
    where: {
      facultyId: facultyId,
      role: {
        in: ['SUPERVISOR', 'MODERATOR']
      }
    },
    select: {
      projectId: true,
      role: true
    }
  })
}

async function getStudentMarks(currentSemesterId: string, facultyProjects: { projectId: string; role: string }[]) {
  const projectIds = facultyProjects.map((fp) => fp.projectId)

  const studentMarks = await prisma.student.findMany({
    where: {
      projectId: { in: projectIds }
    },
    include: {
      user: true,
      project: true,
      Grade: {
        include: {
          semesterGradeType: {
            include: {
              semester: true
            }
          }
        },
        where: {
          semesterGradeType: {
            semesterId: currentSemesterId
          }
        }
      }
    }
  })

  const assessmentComponents = await prisma.gradeType.findMany({
    where: {
      semesterId: currentSemesterId
    },
    select: { name: true },
    distinct: ['name']
  })

  const formattedData: StudentMark[] = studentMarks.map((student) => {
    const grades = assessmentComponents.reduce(
      (acc, component) => {
        const grade = student.Grade.find((g) => g.semesterGradeType.name === component.name)
        acc[component.name] = grade?.score ?? 0
        return acc
      },
      {} as Record<string, number>
    )

    const totalScore = Object.values(grades).reduce((sum, score) => sum + score, 0)
    const semester = student.Grade[0]?.semesterGradeType.semester.name || 'Unknown'

    // Find the matching faculty project and get the role
    const facultyProject = facultyProjects.find((fp) => fp.projectId === student.projectId)
    const facultyRole = facultyProject ? facultyProject.role : 'Unknown'

    return {
      id: student.id,
      name: student.user.name,
      projectTitle: student.project?.title || 'Not Assigned',
      projectId: student.projectId!,
      semester,
      ...grades,
      totalScore,
      facultyRole
    }
  })

  return { formattedData, assessmentComponents: assessmentComponents.map((c) => c.name) }
}

export default async function StudentMarksOverviewPage() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user.facultyId) {
    redirect('/login')
  }

  const currentSemesterId = await getCurrentSemesterId()
  const facultyProjects = await getFacultyProjects(session.user.facultyId)
  const { formattedData, assessmentComponents } = await getStudentMarks(currentSemesterId, facultyProjects)

  return (
    <div className='container mx-auto py-10'>
      <h1 className='mb-5 text-2xl font-bold'>Student Marks Overview</h1>
      <Suspense fallback={<div>Loading...</div>}>
        <ClientDataTable assessmentComponents={assessmentComponents} data={formattedData} />
      </Suspense>
    </div>
  )
}
