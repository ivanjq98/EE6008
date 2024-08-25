'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { prisma } from '@/src/lib/prisma'
import { CreateSemesterDataFormSchema, EditSemesterDataFormSchema } from '@/src/lib/schema'

export async function setActiveSemester(semesterId: string) {
  await prisma.semester.updateMany({
    data: {
      active: false
    },
    where: {
      active: true
    }
  })

  const response = await prisma.semester.update({
    data: {
      active: true
    },
    where: {
      id: semesterId
    }
  })

  revalidatePath('/admin/semesters')

  return {
    message: `${response.name} successfully set as active semester`,
    status: 'OK'
  }
}

export async function editSemester(data: z.infer<typeof EditSemesterDataFormSchema>) {
  const formData = EditSemesterDataFormSchema.parse(data)

  try {
    await prisma.semester.update({
      where: {
        id: formData.semesterId
      },
      data: {
        minimumGroupSize: formData.minimumGroupSize,
        maximumGroupSize: formData.maximumGroupSize,
        projectApplicationsLimit: formData.projectApplicationsLimit
      }
    })

    await prisma.semesterTimeline.update({
      where: {
        semesterId: formData.semesterId
      },
      data: {
        facultyProposalSubmissionStart: formData.facultyProposalSubmission.from,
        facultyProposalSubmissionEnd: formData.facultyProposalSubmission.to,
        facultyProposalReviewStart: formData.facultyProposalReview.from,
        facultyProposalReviewEnd: formData.facultyProposalReview.to,
        studentRegistrationStart: formData.studentRegistration.from,
        studentRegistrationEnd: formData.studentRegistration.to,
        facultyMarkEntryStart: formData.markEntry.from,
        facultyMarkEntryEnd: formData.markEntry.to,
        studentPeerReviewStart: formData.peerReview.from,
        studentResultReleased: formData.markRelease.date
      }
    })

    return { message: `Timeline updated successfully!`, status: 'OK' }
  } catch (error) {
    return { message: `${error}`, status: 'ERROR' }
  }
}

export async function createSemester(data: z.infer<typeof CreateSemesterDataFormSchema>) {
  const formData: z.infer<typeof CreateSemesterDataFormSchema> = CreateSemesterDataFormSchema.parse(data)

  try {
    const semester = await prisma.semester.create({
      data: {
        name: formData.semesterName,
        minimumGroupSize: formData.minimumGroupSize,
        maximumGroupSize: formData.maximumGroupSize,
        projectApplicationsLimit: formData.projectApplicationsLimit,
        timeline: {
          create: {
            facultyProposalSubmissionStart: formData.facultyProposalSubmission.from,
            facultyProposalSubmissionEnd: formData.facultyProposalSubmission.to,
            facultyProposalReviewStart: formData.facultyProposalReview.from,
            facultyProposalReviewEnd: formData.facultyProposalReview.to,
            studentRegistrationStart: formData.studentRegistration.from,
            studentRegistrationEnd: formData.studentRegistration.to,
            facultyMarkEntryStart: formData.markEntry.from,
            facultyMarkEntryEnd: formData.markEntry.to,
            studentPeerReviewStart: formData.peerReview.from,
            studentPeerReviewEnd: formData.peerReview.to,
            studentResultReleased: formData.markRelease.date
          }
        }
      }
    })

    const semesterId = semester.id
    const programmeData = formData.programmeDetails.map((programme) => {
      return {
        semesterId,
        leaderId: programme.faculty,
        name: programme.programmeName,
        programmeCode: programme.programCode
      }
    })
    await prisma.programme.createMany({
      data: programmeData
    })

    const assessmentFormatsData = formData.assessmentFormats.map((assessmentFormat) => {
      return {
        semesterId,
        name: assessmentFormat.name
      }
    })

    await prisma.gradeType.createMany({
      data: assessmentFormatsData
    })

    return {
      message: `Semester created successfully!`,
      status: 'OK',
      data: semester
    }
  } catch (error) {
    return { message: `${error}`, status: 'ERROR' }
  }
}
