import { prisma } from '@/src/lib/prisma'
import { Grade, GradeType, Semester, SemesterTimeline } from '@prisma/client'

type GradeWithDetails = Grade & {
  semesterGradeType: GradeType & {
    semester: Semester & {
      timeline: SemesterTimeline | null
    }
  }
}

export const getStudentGradesAndTimeline = async (studentId: string) => {
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
          },
          faculty: true
        },
        orderBy: [{ semesterGradeType: { semester: { name: 'desc' } } }, { semesterGradeType: { name: 'asc' } }]
      },
      project: {
        include: {
          faculties: {
            include: {
              faculty: true
            }
          }
        }
      }
    }
  })

  const semester = await prisma.semester.findFirst({
    where: {
      active: true
    },
    select: {
      id: true,
      name: true,
      timeline: {
        select: {
          studentResultRelease: true
        }
      }
    }
  })

  const PASS_THRESHOLD = 50 // Adjust this value as needed

  const facultyRoleWeightages = await prisma.facultyRoleWeightage.findMany()
  const weightageObj = facultyRoleWeightages.reduce(
    (acc, curr) => {
      acc[curr.role] = curr.weightage / 100 // Convert to decimal
      return acc
    },
    {} as Record<string, number>
  )

  const gradesArray =
    student?.Grade.reduce(
      (acc, grade) => {
        const existingGrade = acc.find((g) => g.semesterGradeTypeId === grade.semesterGradeType.name)

        if (existingGrade) {
          if (student.project?.faculties.some((pf) => pf.faculty.id === grade.faculty.id && pf.role === 'SUPERVISOR')) {
            existingGrade.supervisorScore = grade.score
          } else if (
            student.project?.faculties.some((pf) => pf.faculty.id === grade.faculty.id && pf.role === 'MODERATOR')
          ) {
            existingGrade.moderatorScore = grade.score
          }

          if (existingGrade.supervisorScore !== null && existingGrade.moderatorScore !== null) {
            const weightedScore =
              existingGrade.supervisorScore * (weightageObj['SUPERVISOR'] || 0.7) +
              existingGrade.moderatorScore * (weightageObj['MODERATOR'] || 0.3)

            existingGrade.combinedScore = weightedScore
            const percentageScore = (weightedScore / existingGrade.weightage) * 100
            existingGrade.status = percentageScore >= PASS_THRESHOLD ? 'Pass' : 'Fail'
          }
        } else {
          acc.push({
            id: grade.id,
            semesterGradeTypeId: grade.semesterGradeType.name,
            weightage: grade.semesterGradeType.weightage,
            supervisorScore: student.project?.faculties.some(
              (pf) => pf.faculty.id === grade.faculty.id && pf.role === 'SUPERVISOR'
            )
              ? grade.score
              : null,
            moderatorScore: student.project?.faculties.some(
              (pf) => pf.faculty.id === grade.faculty.id && pf.role === 'MODERATOR'
            )
              ? grade.score
              : null,
            combinedScore: null,
            status: 'Pending'
          })
        }

        return acc
      },
      [] as Array<{
        id: string
        semesterGradeTypeId: string
        weightage: number
        supervisorScore: number | null
        moderatorScore: number | null
        combinedScore: number | null
        status: 'Pass' | 'Fail' | 'Pending'
      }>
    ) || []

  const studentResultRelease = semester?.timeline?.studentResultRelease

  return { gradesArray, semester }
}
