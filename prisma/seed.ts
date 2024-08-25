import { hash } from 'bcrypt'

import { faker } from '@faker-js/faker'
import { PrismaClient, ProjectStatus, UserRole } from '@prisma/client'

import { facultyUsersData, studentUsersData } from './seed-data'

const prisma = new PrismaClient()

async function userSeed() {
  // const password: string = await hash('test', 12)
  const password: string = 'test'

  // create student user
  await prisma.$transaction(
    studentUsersData.map((student) =>
      prisma.student.create({
        data: {
          matriculationNumber: student.matriculationNumber,
          user: {
            create: {
              email: student.email,
              name: student.fullName,
              password,
              role: UserRole.STUDENT
            }
          }
        }
      })
    )
  )

  // create faculty users
  await prisma.$transaction(
    facultyUsersData.map((faculty) =>
      prisma.faculty.create({
        data: {
          user: {
            create: {
              email: faculty.email,
              name: faculty.name,
              password,
              role: UserRole.FACULTY
            }
          }
        }
      })
    )
  )

  // create admin users
  await prisma.admin.create({
    data: {
      user: {
        create: {
          name: 'Hau Wai Ping',
          email: 'admin@ntu.edu.sg',
          password,
          role: UserRole.ADMIN
        }
      }
    }
  })
}

async function projectSeed() {
  const semesterData = await prisma.semester.findFirst({
    where: {
      active: true
    }
  })

  if (!semesterData) {
    console.error('No active semester found')
    return null
  }
  console.log('Semester Data:', semesterData)

  const activeSemesterId = semesterData.id

  // Get faculty users id
  const facultyUsers = await prisma.user.findMany({
    where: {
      role: UserRole.FACULTY
    },

    select: {
      faculty: {
        select: {
          id: true
        }
      }
    }
  })

  const facultyUsersId = facultyUsers.map((user) => user.faculty?.id)

  // get all existing programme id for the active semester
  const programmes = await prisma.programme.findMany({
    where: {
      semesterId: activeSemesterId
    },
    select: {
      id: true,
      programmeCode: true
    }
  })

  if (!programmes) {
    return null
  }

  const venueData = await prisma.venue.findMany({
    where: {
      semesterId: activeSemesterId
    },
    select: {
      id: true
    }
  })

  const venueDataId = venueData.filter((venue) => venue.id)

  const getRandomNumber = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min

  const generateRandomProjectData = (
    facultyUsers: (string | undefined)[],
    programmes: { id: string; programmeCode: string }[]
  ) => {
    // Generate random indices within the bounds of the arrays
    const randomFacultyIndex = getRandomNumber(0, facultyUsers.length - 1)
    const randomProgrammeIndex = getRandomNumber(0, programmes.length - 1)
    const randomVenueIndex = getRandomNumber(0, venueDataId.length - 1)

    // Select random faculty and programme using the generated indices
    const randomFaculty = facultyUsersId[randomFacultyIndex] as string
    const randomProgramme = programmes[randomProgrammeIndex]
    const randomVenue = venueDataId[randomVenueIndex]

    return {
      title: faker.person.jobTitle(),
      description: faker.lorem.paragraph(7),
      programmeId: randomProgramme.id,
      programmeCode: randomProgramme.programmeCode,
      venueId: randomVenue.id,
      semesterId: activeSemesterId,
      semesterName: semesterData.name,
      facultyId: randomFaculty
    }
  }

  // generate projects data
  const projectData = []
  for (let i = 0; i < 30; i++) {
    projectData.push(generateRandomProjectData(facultyUsersId, programmes))
  }

  // Use Promise.all to create or update all users concurrently
  const projectPromises = projectData.map((data) => {
    return async () => {
      const { description, programmeId, semesterId, title, venueId, semesterName, programmeCode, facultyId } = data
      const projectsUnderThisProgram = await prisma.project.findMany({
        where: {
          programmeId
        },
        orderBy: {
          createdAt: 'desc'
        }
      })

      const latestProjectCode = projectsUnderThisProgram[0]?.projectCode?.slice(1, 4)
      const nextId = latestProjectCode === undefined ? '000' : Number(latestProjectCode) + 1
      const projectCode = `${programmeCode}${nextId.toString().padStart(3, '0')}-${semesterName.slice(
        0,
        2
      )}${semesterName.slice(-1)}`

      await prisma.project.create({
        data: {
          title,
          description,
          status: ProjectStatus.APPROVED,
          projectCode,
          venueId,
          facultyId,
          programmeId
        }
      })
    }
  })

  for (const promiseFunction of projectPromises) {
    await promiseFunction()
  }
}

async function projectRegistrationSeed() {
  const students = await prisma.student.findMany({
    select: {
      id: true
    }
  })

  const projects = await prisma.project.findMany({
    select: {
      id: true
    },
    where: {
      programme: {
        semester: {
          active: true
        }
      }
    }
  })

  const getRandomNumber = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min

  let projectRegistrationsData: {
    studentId: string
    projectId: string
    priority: number
  }[] = []

  for (let i = 0; i < students.length; i++) {
    const student = students[i]
    const studentProjects = []
    const numberOfProjects = getRandomNumber(3, 5)
    const set = new Set()
    for (let j = 0; j < numberOfProjects; j++) {
      let randomProjectIndex = getRandomNumber(0, projects.length - 1)
      if (set.has(randomProjectIndex)) {
        randomProjectIndex = getRandomNumber(0, projects.length - 1)
      }
      set.add(randomProjectIndex)
      const randomProject = projects[randomProjectIndex]
      studentProjects.push({
        studentId: student.id,
        projectId: randomProject.id,
        priority: j + 1
      })
    }
    projectRegistrationsData = [...projectRegistrationsData, ...studentProjects]
  }

  await prisma.registration.createMany({
    data: projectRegistrationsData,
    skipDuplicates: true
  })
}

projectSeed()
  .then(() => projectRegistrationSeed())
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
