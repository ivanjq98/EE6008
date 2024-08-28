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
            }
          }
        }
      }
    })

    const semesters = await prisma.semester.findMany({
      select: { id: true, name: true }
    })

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
            acc[grade.semesterGradeType.name] = grade.score
            return acc
          },
          {} as Record<string, number>
        )

        const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0)

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
