import { prisma } from '@/src/lib/prisma'
import StatisticsClient from './StatisticsClient'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/src/lib/auth'
import { redirect } from 'next/navigation'

type ValidFacultyRole = 'SUPERVISOR' | 'MODERATOR'

export default async function StatisticsPage() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user.facultyId) {
    redirect('/login')
  }

  try {
    const facultyProjects = await prisma.projectFaculty.findMany({
      where: {
        facultyId: session.user.facultyId,
        role: {
          in: ['SUPERVISOR', 'MODERATOR']
        }
      },
      select: {
        projectId: true,
        role: true,
        project: {
          select: {
            title: true
          }
        }
      }
    })

    // Filter and type assert the faculty projects
    const validFacultyProjects = facultyProjects
      .filter(
        (project): project is { projectId: string; role: ValidFacultyRole; project: { title: string } } =>
          project.role === 'SUPERVISOR' || project.role === 'MODERATOR'
      )
      .map((project) => ({
        projectId: project.projectId,
        role: project.role,
        projectTitle: project.project.title
      }))

    const projectIds = validFacultyProjects.map((fp) => fp.projectId)

    const studentData = await prisma.student.findMany({
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
            },
            faculty: true
          },
          where: {
            faculty: {
              id: session.user.facultyId
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
          semesterName: semester.name,
          projectId: student.projectId!,
          projectTitle: student.project?.title || 'Not Assigned'
        }

        const scores = semesterGrades.reduce(
          (acc, grade) => {
            acc[grade.semesterGradeType.name] = grade.score || 0
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
                    key !== 'totalScore' &&
                    key !== 'projectId' &&
                    key !== 'projectTitle'
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
        facultyProjects={validFacultyProjects}
      />
    )
  } catch (error) {
    console.error('Error fetching data:', error)
    return <div>Error fetching data. Please check the console for more information.</div>
  }
}
