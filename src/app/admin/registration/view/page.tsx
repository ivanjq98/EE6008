import _ from 'lodash'
import { getServerSession } from 'next-auth'

import { columns } from '@/src/components/admin/registration/registration-table/columns'
import { DataTable } from '@/src/components/admin/registration/registration-table/data-table'
import { Header } from '@/src/components/header'
import { authOptions } from '@/src/lib/auth'
import { prisma } from '@/src/lib/prisma'
import { Project } from '@/src/components/admin/registration/registration-table/columns'

const ViewRegistrationPage = async () => {
  const session = await getServerSession(authOptions)
  const user = session?.user

  if (!user) return null

  // Fetch projects with their programme and semester information
  const projects = await prisma.project.findMany({
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
    where: { status: 'PENDING' },
    select: {
      currentProjectId: true,
      requestedProjectId: true
    }
  })

  const appealsIn = _.groupBy(appeals, 'requestedProjectId')

  const semesterOptions = _.uniq(projects.map((p) => p.programme?.semester?.name)).filter(
    (semester): semester is string => semester !== undefined
  )

  const semesterOptionsSanitized = semesterOptions.map((semester) => ({
    label: semester,
    value: semester
  }))

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
      <Header title='Registration' description='Manage student project registration' />
      <DataTable columns={columns} data={projectSanitized} semesterOptions={semesterOptionsSanitized} />
    </div>
  )
}

export default ViewRegistrationPage
