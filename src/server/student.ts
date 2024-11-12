import { prisma } from '../lib/prisma'

export const getAvailableProjects = async () => {
  const data = await prisma.project.findMany({
    where: {
      status: 'APPROVED',
      programme: {
        semester: {
          active: true
        }
      }
    },
    include: {
      faculty: {
        include: {
          user: {
            select: {
              name: true
            }
          }
        }
      },
      programme: {
        select: {
          name: true
        }
      }
    }
  })

  const projects = data.map((project) => ({
    id: project.id,
    projectCode: project.projectCode,
    title: project.title,
    description: project.description,
    programme: project.programme.name,
    faculty: project.faculty.user.name
  }))

  return projects
}

export const getStudentProjectPlan = async (studentId: string) => {
  const data = await prisma.projectPlan.findMany({
    where: {
      studentId: studentId
    },
    include: {
      Project: {
        include: {
          programme: {
            select: {
              name: true
            }
          },
          faculty: {
            include: {
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

  const sanitizedData = data.map((plan) => {
    return {
      id: plan.projectId,
      title: plan.Project.title,
      faculty: plan.Project.faculty.user.name,
      programme: plan.Project.programme.name
    }
  })

  return sanitizedData
}

export const getStudentProjectRegistration = async (studentId: string) => {
  const data = await prisma.registration.findMany({
    where: {
      studentId
    },
    include: {
      project: {
        include: {
          programme: {
            select: {
              name: true
            }
          },
          faculty: {
            include: {
              user: {
                select: {
                  name: true
                }
              }
            }
          }
        }
      }
    },
    orderBy: {
      priority: 'asc'
    }
  })

  const sanitizedData = data.map((project) => {
    return {
      id: project.projectId,
      title: project.project.title,
      priority: project.priority,
      faculty: project.project.faculty.user.name,
      programme: project.project.programme.name
    }
  })

  return sanitizedData
}

export const getStudentAllocatedProject = async (studentId: string) => {
  const data = await prisma.student.findUnique({
    where: {
      id: studentId
    },
    select: {
      project: {
        include: {
          programme: {
            select: {
              name: true
            }
          },
          faculty: {
            include: {
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

  if (!data) return null

  if (data.project === null) return null

  const projectMembers = await prisma.student.findMany({
    where: {
      projectId: data.project.id
    },
    select: {
      user: {
        select: {
          name: true
        }
      }
    }
  })

  const sanitizedData = {
    id: data.project.id,
    title: data.project.title,
    faculty: data.project.faculty.user.name,
    programme: data.project.programme.name,
    description: data.project.description,
    members: projectMembers.map((member) => member.user.name)
  }

  return sanitizedData
}
