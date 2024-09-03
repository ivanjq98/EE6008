import { notFound } from 'next/navigation'

import { EditSemesterForm } from '@/src/components/admin/semester/edit-semester-form'
import { Header } from '@/src/components/header'
import { Badge } from '@/src/components/ui/badge'
import { prisma } from '@/src/lib/prisma'

const EditTimeline = async ({ params }: { params: { semester: string } }) => {
  if (!validateSemesterFormat(params.semester)) {
    return notFound()
  }

  const data = await prisma.semester.findUnique({
    where: {
      name: params.semester
    },
    include: {
      timeline: true
    }
  })

  const semesterId = data?.id

  const semesterTimelineData = data?.timeline

  let sanitizedDefaultValues

  if (!semesterId || !semesterTimelineData) {
    return (
      <div className='space-y-4'>
        <h1 className='text-3xl font-semibold'>Error: No timeline data found for {params.semester}.</h1>
        <h2 className='text-muted-foreground'>Start by creating timeline data for this semester</h2>
      </div>
    )
  } else {
    const gradeTypes = await prisma.gradeType.findMany({
      where: {
        semesterId: semesterId
      }
    })

    // Fetch faculty role weightages
    const facultyRoleWeightages = await prisma.facultyRoleWeightage.findMany()

    sanitizedDefaultValues = {
      minimumGroupSize: data.minimumGroupSize,
      maximumGroupSize: data.maximumGroupSize,
      projectApplicationsLimit: data.projectApplicationsLimit,
      semesterId: semesterId,
      facultyProposalSubmission: {
        from: semesterTimelineData.facultyProposalSubmissionStart,
        to: semesterTimelineData.facultyProposalSubmissionEnd
      },
      facultyProposalReview: {
        from: semesterTimelineData.facultyProposalReviewStart,
        to: semesterTimelineData.facultyProposalReviewEnd
      },
      studentRegistration: {
        from: semesterTimelineData.studentRegistrationStart,
        to: semesterTimelineData.studentRegistrationEnd
      },
      markEntry: {
        from: semesterTimelineData.facultyMarkEntryStart,
        to: semesterTimelineData.facultyMarkEntryEnd
      },
      peerReview: {
        from: semesterTimelineData.studentPeerReviewStart,
        to: semesterTimelineData.studentPeerReviewEnd
      },
      studentResultRelease: semesterTimelineData.studentResultRelease,
      assessmentFormats: gradeTypes.map((gradeType) => ({
        name: gradeType.name,
        weightage: gradeType.weightage
      })),
      facultyRoleWeightages: {
        SUPERVISOR: facultyRoleWeightages.find((w) => w.role === 'SUPERVISOR')?.weightage ?? 70,
        MODERATOR: facultyRoleWeightages.find((w) => w.role === 'MODERATOR')?.weightage ?? 30
      }
    }
  }

  return (
    <div className='space-y-4'>
      <Header title={`Edit ${params.semester} configurations`} description='Change the dates and times below!' />
      <EditSemesterForm defaultValues={sanitizedDefaultValues} semesterName={params.semester} />
    </div>
  )
}

export default EditTimeline

function validateSemesterFormat(semester: string) {
  if (semester.length !== 4) {
    return false
  }

  const startYear = semester.slice(0, 2)
  const semesterPart = semester.slice(3)

  if (/^\d{2}$/.test(startYear) && (semesterPart === '1' || semesterPart === '2')) {
    return true
  } else {
    return false
  }
}
