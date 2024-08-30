'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { Prisma } from '@prisma/client'

import { prisma } from '@/src/lib/prisma'
import { AddProjectFormSchema, EditProjectFormSchema } from '@/src/lib/schema'

export async function addProject(data: z.infer<typeof AddProjectFormSchema>, facultyId: string) {
  const { description, programme, semesterId, title, venueId } = data
  try {
    const programmeData = await prisma.programme.findUnique({
      where: {
        name_semesterId: {
          name: programme,
          semesterId
        }
      },
      select: {
        id: true,
        programmeCode: true,
        semester: {
          select: {
            name: true
          }
        }
      }
    })

    if (!programmeData) {
      return { message: `Programme not found`, status: 'ERROR' }
    }

    const projectsUnderThisProgram = await prisma.project.findMany({
      where: {
        programmeId: programmeData.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    if (!programmeData.semester) {
      return { message: `Semester not found`, status: 'ERROR' }
    }

    const latestProjectCode = projectsUnderThisProgram[0]?.projectCode?.slice(1, 4) || '000'
    const semesterName = programmeData.semester.name
    const nextId = latestProjectCode === '000' ? '000' : Number(latestProjectCode) + 1
    const projectCode = `${programmeData.programmeCode}${nextId.toString().padStart(3, '0')}-${semesterName.slice(
      0,
      2
    )}${semesterName.slice(-1)}`

    const result = await prisma.$transaction(async (prisma) => {
      const projectData: Prisma.ProjectCreateInput = {
        title,
        description,
        status: 'PENDING',
        projectCode,
        programme: {
          connect: {
            id: programmeData.id
          }
        },
        venue: venueId
          ? {
              connect: {
                id: venueId
              }
            }
          : undefined,
        faculty: {
          connect: {
            id: facultyId
          }
        },
        faculties: {
          create: {
            faculty: {
              connect: {
                id: facultyId
              }
            },
            role: 'SUPERVISOR'
          }
        }
      }

      const project = await prisma.project.create({
        data: projectData,
        include: {
          faculties: true,
          faculty: true
        }
      })

      return project
    })

    revalidatePath('/faculty/my-proposal')
    revalidatePath('/faculty/view-all-projects')

    return {
      message: `Project proposal successfully created with faculty assigned as Supervisor!`,
      status: 'OK',
      data: result
    }
  } catch (error) {
    console.error('Error creating project:', error)
    return { message: `Failed to create project: ${error}`, status: 'ERROR' }
  }
}

export async function editProject(data: z.infer<typeof EditProjectFormSchema>) {
  const { description, semesterId, title, projectId } = data

  try {
    const data = await prisma.project.update({
      where: {
        id: projectId
      },
      data: {
        title,
        description,
        status: 'PENDING'
      }
    })

    return {
      message: `Project successfully updated!`,
      status: 'OK',
      data
    }
  } catch (error) {
    return { message: `${error}`, status: 'ERROR' }
  }
}

export async function deleteProject(id: string) {
  try {
    await prisma.project.delete({
      where: {
        id
      }
    })

    return {
      message: `Project successfully deleted!`,
      status: 'OK'
    }
  } catch (error) {
    return { message: `${error}`, status: 'ERROR' }
  }
}
