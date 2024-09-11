import { prisma } from '@/src/lib/prisma'
import StatisticsClient from './StatisticsClient'

export default async function StatisticsPage() {
  try {
    const studentData = await prisma.student.findMany({
      include: {
        user: true,
        Grade: {
          include: {
            semesterGradeType: {
              include: {
                semester: true
              }
            },
            faculty: {
              include: {
                ProjectFaculty: true
              }
            }
          }
        }
      }
    })

    const semesters = await prisma.semester.findMany({
      select: { id: true, name: true }
    })

    const facultyRoleWeightages = await prisma.facultyRoleWeightage.findMany()
    const weightageObj = facultyRoleWeightages.reduce(
      (acc, curr) => {
        acc[curr.role] = curr.weightage / 100 // Convert to decimal
        return acc
      },
      {} as Record<string, number>
    )

    const formattedData = studentData.flatMap((student) =>
      semesters.map((semester) => {
        const semesterGrades = student.Grade.filter((grade) => grade.semesterGradeType.semesterId === semester.id)

        const baseData = {
          id: `${student.id}-${semester.id}`,
          studentId: student.id,
          studentName: student.user.name,
          semesterId: semester.id,
          semesterName: semester.name
        }

        const scores = semesterGrades.reduce(
          (acc, grade) => {
            const componentName = grade.semesterGradeType.name
            if (!acc[componentName]) {
              acc[componentName] = { supervisor: 0, moderator: 0, weighted: 0 }
            }

            const role = grade.faculty.ProjectFaculty[0]?.role
            if (role === 'SUPERVISOR') {
              acc[componentName].supervisor = grade.score || 0
            } else if (role === 'MODERATOR') {
              acc[componentName].moderator = grade.score || 0
            }

            // Recalculate weighted score with swapped weightages
            acc[componentName].weighted =
              acc[componentName].supervisor * (weightageObj['SUPERVISOR'] || 0.3) +
              acc[componentName].moderator * (weightageObj['MODERATOR'] || 0.7)

            return acc
          },
          {} as Record<string, { supervisor: number; moderator: number; weighted: number }>
        )

        const totalScore = Object.values(scores).reduce((sum, score) => sum + score.weighted, 0)

        return {
          ...baseData,
          ...scores,
          totalScore
        }
      })
    )

    const assessmentComponentsBySemester = semesters.reduce(
      (acc, semester) => {
        acc[semester.id] = Array.from(
          new Set(
            formattedData
              .filter((data) => data.semesterId === semester.id)
              .flatMap((data) =>
                Object.keys(data).filter(
                  (key) =>
                    key !== 'id' &&
                    key !== 'studentId' &&
                    key !== 'studentName' &&
                    key !== 'semesterId' &&
                    key !== 'semesterName' &&
                    key !== 'totalScore'
                )
              )
          )
        )
        return acc
      },
      {} as Record<string, string[]>
    )

    return (
      <StatisticsClient
        data={formattedData}
        assessmentComponentsBySemester={assessmentComponentsBySemester}
        semesters={semesters}
      />
    )
  } catch (error) {
    console.error('Error fetching data:', error)
    return <div>Error fetching data. Please check the console for more information.</div>
  }
}
