import { Suspense } from 'react'
import { prisma } from '@/src/lib/prisma'
import { StudentMark } from '@/src/components/admin/student-marks-overview/columns'
import { ClientDataTable } from '@/src/components/admin/student-marks-overview/ClientDataTable'
import StudentMarksOverviewPage from '@/src/components/admin/student-marks-overview/overviewDownload'
import { downloadSupervisorModeratorMarks } from '@/src/components/admin/student-marks-overview/overviewDownload2'
import { Header } from '@/src/components/header'

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

async function getStudentMarks(currentSemesterId: string) {
  const studentMarks = await prisma.student.findMany({
    where: {
      projectId: { not: null }
    },
    include: {
      user: true,
      project: {
        include: {
          faculties: {
            include: {
              faculty: true
            }
          }
        }
      },
      Grade: {
        include: {
          semesterGradeType: {
            include: {
              semester: true
            }
          },
          faculty: true
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

  const facultyRoleWeightages = await prisma.facultyRoleWeightage.findMany()
  const weightageObj = facultyRoleWeightages.reduce(
    (acc, curr) => {
      acc[curr.role] = curr.weightage / 100 // Convert to decimal
      return acc
    },
    {} as Record<string, number>
  )

  const formattedData: StudentMark[] = studentMarks.map((student) => {
    const grades = {} as Record<
      string,
      { supervisor: number | null; moderator: number | null; weighted: number | null; weightage: number }
    >

    assessmentComponents.forEach((component) => {
      const supervisorGrade = student.Grade.find(
        (g) =>
          g.semesterGradeType.name === component.name &&
          student.project?.faculties.some((pf) => pf.faculty.id === g.faculty.id && pf.role === 'SUPERVISOR')
      )
      const moderatorGrade = student.Grade.find(
        (g) =>
          g.semesterGradeType.name === component.name &&
          student.project?.faculties.some((pf) => pf.faculty.id === g.faculty.id && pf.role === 'MODERATOR')
      )

      const supervisorScore = supervisorGrade?.score ?? null
      const moderatorScore = moderatorGrade?.score ?? null
      const weightage = supervisorGrade?.semesterGradeType.weightage ?? 0

      let weightedScore = null
      if (supervisorScore !== null && moderatorScore !== null) {
        weightedScore =
          supervisorScore * (weightageObj['SUPERVISOR'] || 0.7) + moderatorScore * (weightageObj['MODERATOR'] || 0.3)
      }

      grades[component.name] = {
        supervisor: supervisorScore,
        moderator: moderatorScore,
        weighted: weightedScore,
        weightage: weightage
      }
    })

    const totalScore = Object.values(grades).reduce((sum, grade) => sum + (grade.weighted ?? 0), 0)
    const semester = student.Grade[0]?.semesterGradeType.semester.name || 'Unknown'

    return {
      id: student.id,
      name: student.user.name,
      projectTitle: student.project?.title || 'Not Assigned',
      semester,
      ...grades,
      totalScore
    }
  })

  return { formattedData, assessmentComponents: assessmentComponents.map((c) => c.name) }
}

export default async function StudentMarksOverviewPageWrapper() {
  const currentSemesterId = await getCurrentSemesterId()
  const { formattedData, assessmentComponents } = await getStudentMarks(currentSemesterId)

  return (
    <div className='container mx-auto py-10'>
      <Header
        title='Student Marks Overview'
        description='Download the CSV to view the marks discrepancy for each students components'
      />
      <Suspense fallback={<div>Loading...</div>}>
        <StudentMarksOverviewPage
          formattedData={formattedData}
          assessmentComponents={assessmentComponents}
          downloadSupervisorModeratorMarks={downloadSupervisorModeratorMarks}
        />
      </Suspense>
    </div>
  )
}
