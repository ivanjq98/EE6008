import { getServerSession } from 'next-auth'
import Link from 'next/link'

import { Header } from '@/src/components/header'
import PeerReviewSection from '@/src/components/student/peer-review/peer-review-section'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/src/components/ui/table'
import { authOptions } from '@/src/lib/auth'
import { prisma } from '@/src/lib/prisma'

const PeerReview = async () => {
  const session = await getServerSession(authOptions)

  const studentId = session?.user.studentId

  if (!studentId) {
    return null
  }
  const activeSemester = await prisma.semester.findFirst({
    where: {
      active: true
    },
    include: {
      timeline: {
        select: {
          studentPeerReviewStart: true,
          studentPeerReviewEnd: true
        }
      }
    }
  })

  if (!activeSemester || !activeSemester.timeline)
    return <NoAccessToThePage message='You can only review projects during the student peer review period' />

  const currentDate = new Date()
  const peerReviewStartDate = new Date(activeSemester.timeline.studentPeerReviewStart)
  const peerReviewEndDate = new Date(activeSemester.timeline.studentPeerReviewEnd)

  if (currentDate < peerReviewStartDate || currentDate > peerReviewEndDate) {
    return <NoAccessToThePage message='You can only review projects during the student peer review period' />
  }

  const studentData = await prisma.student.findFirst({
    where: {
      id: studentId
    },
    select: {
      projectId: true
    }
  })

  if (!studentData?.projectId) {
    return <NoAccessToThePage message='You are not allocated to any project' />
  }

  const projectStudents = await prisma.student.findMany({
    where: {
      projectId: studentData.projectId
    },
    select: {
      id: true,
      user: {
        select: {
          name: true
        }
      }
    }
  })

  const peers = projectStudents
    .filter((student) => student.id !== studentId)
    .map((student) => ({
      id: student.id,
      name: student.user.name
    }))

  const peerReviewData = await prisma.peerReview.findMany({
    where: {
      projectId: studentData.projectId,
      reviewerId: studentId
    },
    select: {
      id: true,
      rank: true,
      reviewee: {
        select: {
          user: {
            select: {
              name: true
            }
          }
        }
      }
    },
    orderBy: {
      rank: 'asc'
    }
  })

  return (
    <section className='space-y-6 py-6'>
      <Header title='Peer Review' description='Rank your peers here.' />
      <PeerReviewSection peers={peers} reviewerId={studentId} projectId={studentData.projectId} />
    </section>
  )
}

export default PeerReview

const NoAccessToThePage = ({ message }: { message: string }) => {
  return (
    <section className='py-6'>
      <div className='space-y-4'>
        <Header title='Peer Review!' description={message} />
        <div>
          <Link className='text-primary hover:underline' href={'/student'}>
            Back to dashboard
          </Link>
        </div>
      </div>
    </section>
  )
}
