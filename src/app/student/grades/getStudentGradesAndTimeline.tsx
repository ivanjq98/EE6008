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
          }
        },
        orderBy: [{ semesterGradeType: { semester: { name: 'desc' } } }, { semesterGradeType: { name: 'asc' } }]
      }
    }
  })

  const results = await prisma.student.findUnique({
    where: { id: 'b7c95900-5b48-4218-8b91-40a78abfbfbc' },
    include: {
      Grade: {
        include: {
          semesterGradeType: true // This will include the GradeType information
        }
      }
    }
  })

  console.log('xinruixgao; results', results)

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

  const gradesArray = results?.Grade.map((grade) => ({
    id: grade.id,
    score: grade.score,
    semesterGradeTypeId: grade.semesterGradeType.name,
    weightage: grade.semesterGradeType.weightage
  }))

  console.log('xinruixgao; gradesArray test', gradesArray)

  const studentResultRelease = semester?.timeline?.studentResultRelease

  if (studentResultRelease) {
    const formattedDate = studentResultRelease.toISOString().split('T')[0]
    console.log('ivan; studentResultRelease', formattedDate)
  } else {
    console.log('ivan; studentResultRelease not found')
  }
  if (!student || !semester) {
    return { gradesBySemester: {}, resultReleaseDate: null }
  }

  const resultReleaseDate = semester.timeline?.studentResultRelease ?? null

  console.log('ivan; semesterGradeTest', resultReleaseDate)

  return { gradesArray, semester }
}
