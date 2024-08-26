import { format } from 'date-fns/format'

import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/src/components/ui/table'
import { prisma } from '@/src/lib/prisma'

export async function TimelineTable({
  searchParams
}: {
  searchParams?: {
    semester: string
  }
}) {
  const semester = searchParams?.semester

  if (!semester) {
    return (
      <Table>
        <TableCaption>Select a semester</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Period</TableHead>
            <TableHead>From</TableHead>
            <TableHead>To</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody></TableBody>
      </Table>
    )
  }
  const semesterData = await prisma.semester.findUnique({
    where: {
      name: semester
    },
    include: {
      timeline: true
    }
  })

  const semesterTimelineData = semesterData?.timeline

  if (!semesterTimelineData) {
    return <div>No timeline data exist for this semesteer</div>
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
      title: 'Result Release',
      from: new Date(semesterTimelineData.studentResultRelease),
      to: null
    }
  ]

  return (
    <>
      <h1 className='text-lg font-semibold md:text-xl'>Timeline</h1>
      <Table>
        <TableCaption>{semester} semester timeline</TableCaption>
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
              <TableCell>{period.to ? format(period.to, 'PPP HH:mm:ss') : 'N/A'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  )
}
