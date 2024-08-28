import { prisma } from '@/src/lib/prisma'
import { Grade, GradeType, Semester, SemesterTimeline } from '@prisma/client'

type GradeWithDetails = Grade & {
  semesterGradeType: GradeType & {
    semester: Semester & {
      timeline: SemesterTimeline | null
    }
  }
}

export async function getStudentGradesAndTimeline(studentId: string) {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      Grade: {
        include: {
          semesterGradeType: {
            include: {
              semester: {
                include: {
                  timeline: true
                }
              }
            }
          }
        },
        orderBy: [{ semesterGradeType: { semester: { name: 'desc' } } }, { semesterGradeType: { name: 'asc' } }]
      }
    }
  })

  if (!student) {
    return { gradesBySemester: {}, resultReleaseDate: null }
  }

  // Find the most recent semester with a timeline
  const semestersWithTimeline = student.Grade.map((grade) => grade.semesterGradeType.semester).filter(
    (semester): semester is Semester & { timeline: SemesterTimeline } => semester.timeline !== null
  )

  const latestSemesterWithTimeline =
    semestersWithTimeline.length > 0
      ? semestersWithTimeline.reduce((latest, current) => (latest.name > current.name ? latest : current))
      : null

  const resultReleaseDate = latestSemesterWithTimeline?.timeline.studentResultRelease ?? null

  // Group grades by semester
  const gradesBySemester = student.Grade.reduce<Record<string, GradeWithDetails[]>>((acc, grade) => {
    const semesterName = grade.semesterGradeType.semester.name
    if (!acc[semesterName]) {
      acc[semesterName] = []
    }
    acc[semesterName].push(grade as GradeWithDetails)
    return acc
  }, {})

  return { gradesBySemester, resultReleaseDate }
}
