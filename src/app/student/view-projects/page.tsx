import _ from 'lodash'
import { getServerSession } from 'next-auth'

import { columns } from '@/src/components/student/registration/registration-table/columns'
import { DataTable } from '@/src/components/student/registration/registration-table/data-table'
import { Header } from '@/src/components/header'
import { authOptions } from '@/src/lib/auth'
import { prisma } from '@/src/lib/prisma'
import { Project } from '@/src/components/student/registration/registration-table/columns'

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

const ViewRegistrationPage = async () => {
  const session = await getServerSession(authOptions)
  const user = session?.user

  if (!user) return null

  try {
    const currentSemesterId = await getCurrentSemesterId()

    // Fetch projects with their programme and semester information, filtered by current semester
    const projects = await prisma.project.findMany({
      where: {
        programme: {
          semester: {
            id: currentSemesterId
          }
        }
      },
      select: {
        id: true,
        title: true,
        description: true,
        projectCode: true,
        programme: {
          select: {
            name: true,
            semester: {
              select: {
                id: true,
                name: true,
                maximumGroupSize: true
              }
            }
          }
        }
      }
    })

    // Fetch students taking projects
    const studentsInProjects = await prisma.student.findMany({
      where: {
        projectId: { not: null }
      },
      select: {
        projectId: true,
        matriculationNumber: true,
        user: {
          select: {
            name: true
          }
        }
      }
    })

    // Group students by project
    const studentsTakingProject = _.groupBy(studentsInProjects, 'projectId')

    // Fetch registrations
    const registrations = await prisma.registration.findMany({
      where: {
        project: {
          programme: {
            semester: {
              id: currentSemesterId
            }
          }
        }
      },
      include: {
        student: {
          select: {
            matriculationNumber: true,
            user: {
              select: {
                name: true
              }
            }
          }
        },
        project: {
          select: {
            id: true
          }
        }
      }
    })

    // Group registrations by project
    const registrationsByProject = _.groupBy(registrations, 'project.id')

    // Fetch appeals
    const appeals = await prisma.projectAppeal.findMany({
      where: {
        status: 'PENDING',
        requestedProject: {
          programme: {
            semester: {
              id: currentSemesterId
            }
          }
        }
      },
      select: {
        currentProjectId: true,
        requestedProjectId: true
      }
    })

    const appealsIn = _.groupBy(appeals, 'requestedProjectId')

    const currentSemester = projects[0]?.programme?.semester

    const projectSanitized: Project[] = projects.map((project) => {
      const projectRegistrations = registrationsByProject[project.id] || []
      const totalSignUps = projectRegistrations.length
      const maximumGroupSize = project.programme?.semester?.maximumGroupSize || 0

      // Count students actually allocated to this project
      const allocatedStudents = studentsTakingProject[project.id]?.length || 0

      const vacancy = Math.max(0, maximumGroupSize - allocatedStudents)
      const waitlist = appealsIn[project.id]?.length || 0

      const vacancywaitlist = `${vacancy} / ${waitlist}`

      return {
        projectId: project.id,
        projectCode: project.projectCode,
        projectTitle: project.title,
        totalSignUps: totalSignUps,
        vacancywaitlist: vacancywaitlist,
        semester: project.programme?.semester?.name || 'Unknown',
        registrantDetails: projectRegistrations.map((reg) => ({
          matriculationNumber: reg.student.matriculationNumber,
          name: reg.student.user.name,
          priority: reg.priority
        }))
      }
    })

    return (
      <div className='space-y-4'>
        <Header title='View Projects' description={`Project List for ${currentSemester?.name || 'Current Semester'}`} />
        <DataTable
          columns={columns}
          data={projectSanitized}
          semesterOptions={currentSemester ? [{ label: currentSemester.name, value: currentSemester.id }] : []}
        />
      </div>
    )
  } catch (error) {
    console.error('Error fetching data:', error)
    return <div>An error occurred while fetching data. Please try again later.</div>
  }
}

export default ViewRegistrationPage
