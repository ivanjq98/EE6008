import { format } from 'date-fns'

import { TypographyH4 } from '@/src/components/typography'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/src/components/ui/table'
import { prisma } from '@/src/lib/prisma'

export async function SemesterTimeline() {
  const semesterData = await prisma.semester.findFirst({
    where: {
      active: true
    },
    include: {
      timeline: true
    }
  })

  const semesterTimelineData = semesterData?.timeline

  if (!semesterTimelineData) {
    return <div>No timeline data exist for this semester</div>
  }

  const timelineData = [
    {
      title: 'Faculty proposal submission',
      from: new Date(semesterTimelineData.facultyProposalSubmissionStart),
      to: new Date(semesterTimelineData.facultyProposalSubmissionEnd)
    },
    {
      title: 'Proposal review',
      from: new Date(semesterTimelineData.facultyProposalReviewStart),
      to: new Date(semesterTimelineData.facultyProposalReviewEnd)
    },
    {
      title: 'Student selection',
      from: new Date(semesterTimelineData.studentRegistrationStart),
      to: new Date(semesterTimelineData.studentRegistrationEnd)
    },
    {
      title: 'Mark entry',
      from: new Date(semesterTimelineData.facultyMarkEntryStart),
      to: new Date(semesterTimelineData.facultyMarkEntryEnd)
    },
    {
      title: 'Peer review',
      from: new Date(semesterTimelineData.studentPeerReviewStart),
      to: new Date(semesterTimelineData.studentPeerReviewEnd)
    },
    {
      title: 'Release Result',
      from: new Date(semesterTimelineData.studentResultRelease),
      to: new Date(semesterTimelineData.studentResultRelease)
    }
  ]

  return (
    <>
      <TypographyH4>{semesterData.name} semester timeline</TypographyH4>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Period</TableHead>
            <TableHead>From</TableHead>
            <TableHead>To</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {timelineData.map((period, index) => (
            <TableRow key={index}>
              <TableCell>{period.title}</TableCell>
              <TableCell>{format(period.from, 'PPP HH:mm:ss')}</TableCell>
              <TableCell>
                {period.from.getTime() === period.to.getTime() ? '-' : format(period.to, 'PPP HH:mm:ss')}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  )
}
