'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { prisma } from '@/src/lib/prisma'
import { UpdateStudentGradeFormSchema } from '@/src/lib/schema'

export async function updateStudentGrade(
  data: z.infer<typeof UpdateStudentGradeFormSchema>,
  semesterGradeTypeId: string,
  facultyRole: string
) {
  const schema = z.object({
    studentGrades: z.array(
      z.object({
        studentName: z.string().min(1, { message: 'Student name is required' }),
        studentId: z.string().min(1, { message: 'Student ID is required' }),
        facultyId: z.string().min(1, { message: 'Faculty ID is required' }),
        matriculationNumber: z.string().min(1, { message: 'Matriculation number is required' }),
        projectId: z.string().min(1, { message: 'Project ID is required' }),
        grade: z.coerce.number().min(0).max(100, { message: 'Grade must be between 0 and 100' })
      })
    )
  })
  const formData: z.infer<typeof schema> = schema.parse(data)

  try {
    const sanitizedData = formData.studentGrades.map((entry) => {
      return prisma.grade.upsert({
        where: {
          studentId_projectId_facultyId_semesterGradeTypeId: {
            studentId: entry.studentId,
            projectId: entry.projectId,
            facultyId: entry.facultyId,
            semesterGradeTypeId
          }
        },
        update: {
          score: entry.grade
        },
        create: {
          score: entry.grade,
          studentId: entry.studentId,
          projectId: entry.projectId,
          facultyId: entry.facultyId,
          semesterGradeTypeId
        }
      })
    })

    await prisma.$transaction(sanitizedData)

    revalidatePath('/faculty/mark')

    return {
      message: `Grade updated successfully!`,
      status: 'OK',
      data
    }
  } catch (error) {
    return { message: `${error}`, status: 'ERROR' }
  }
}
