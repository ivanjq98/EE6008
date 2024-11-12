import { prisma } from '@/src/lib/prisma'
import StatisticsClient from './StatisticsClient'
import { Header } from '@/src/components/header'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/src/lib/auth'
import { redirect } from 'next/navigation'

export default async function StatisticsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.facultyId) {
    redirect('/login')
  }

  try {
    // Get active semester
    const activeSemester = await prisma.semester.findFirst({
      where: { active: true },
      select: { id: true }
    })

    if (!activeSemester) {
      return (
        <div className='container mx-auto p-4'>
          <Header title='Error' description='No active semester found.' />
        </div>
      )
    }

    // Check if user is a module leader
    const leaderProgram = await prisma.programme.findFirst({
      where: {
        leaderId: session.user.facultyId,
        semesterId: activeSemester.id
      },
      select: { id: true }
    })

    if (!leaderProgram) {
      return (
        <div className='container mx-auto p-4'>
          <Header title='Access Denied' description='You do not have module leader access for the current semester.' />
        </div>
      )
    }

    // Get students from the leader's programme
    const studentData = await prisma.student.findMany({
      where: {
        projectId: { not: null },
        project: {
          programme: {
            id: leaderProgram.id,
            semesterId: activeSemester.id
          }
        }
      },
      include: {
        user: {
          select: {
            name: true
          }
        },
        project: {
          include: {
            faculties: {
              include: {
                faculty: {
                  select: {
                    id: true,
                    user: {
                      select: {
                        name: true
                      }
                    }
                  }
                }
              }
            }
          }
        },
        Grade: {
          where: {
            semesterGradeType: {
              semesterId: activeSemester.id
            }
          },
          include: {
            semesterGradeType: {
              include: {
                semester: true
              }
            },
            faculty: {
              select: {
                id: true,
                user: {
                  select: {
                    name: true
                  }
                }
              }
            }
          }
        }
      }
    })

    const semesters = await prisma.semester.findMany({
      where: {
        id: activeSemester.id
      },
      select: {
        id: true,
        name: true
      }
    })

    const facultyRoleWeightages = await prisma.facultyRoleWeightage.findMany()
    const weightageObj = facultyRoleWeightages.reduce(
      (acc, curr) => {
        acc[curr.role] = curr.weightage / 100
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

            const facultyRole = student.project?.faculties.find((pf) => pf.faculty.id === grade.faculty.id)?.role

            if (facultyRole === 'SUPERVISOR') {
              acc[componentName].supervisor = grade.score || 0
            } else if (facultyRole === 'MODERATOR') {
              acc[componentName].moderator = grade.score || 0
            }

            acc[componentName].weighted =
              acc[componentName].supervisor * (weightageObj['SUPERVISOR'] || 0.7) +
              acc[componentName].moderator * (weightageObj['MODERATOR'] || 0.3)

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

    if (formattedData.length === 0) {
      return (
        <div className='container mx-auto p-4'>
          <Header
            title='Statistics'
            description='No student data available for your programme in the current semester.'
          />
        </div>
      )
    }

    return (
      <div className='container mx-auto p-4'>
        <Header title='Programme Statistics' description="View statistics for your programme's students" />
        <StatisticsClient
          data={formattedData}
          assessmentComponentsBySemester={assessmentComponentsBySemester}
          semesters={semesters}
        />
      </div>
    )
  } catch (error) {
    console.error('Error fetching statistics:', error)
    return (
      <div className='container mx-auto p-4'>
        <Header title='Error' description='An error occurred while loading statistics. Please try again later.' />
      </div>
    )
  }
}
