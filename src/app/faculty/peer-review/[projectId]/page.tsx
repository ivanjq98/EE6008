import React from 'react'
import { getServerSession } from 'next-auth'
import Link from 'next/link'

import { Header } from '@/src/components/header'
import { TypographyP } from '@/src/components/typography'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/src/components/ui/table'
import { authOptions } from '@/src/lib/auth'
import { prisma } from '@/src/lib/prisma'
import { Prisma } from '@prisma/client'

type ProjectWithReviews = Prisma.ProjectGetPayload<{
  include: {
    students: {
      include: {
        user: true
        ReviewerPeerReviews: {
          include: {
            reviewee: {
              include: {
                user: true
              }
            }
          }
        }
      }
    }
  }
}>

const ProjectPeerReviewPage = async ({ params }: { params: { projectId: string } }) => {
  const session = await getServerSession(authOptions)
  const user = session?.user

  if (!user || !user.facultyId) return null

  const { projectId } = params

  const project = (await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      students: {
        include: {
          user: true,
          ReviewerPeerReviews: {
            include: {
              reviewee: {
                include: {
                  user: true
                }
              }
            }
          }
        }
      }
    }
  })) as ProjectWithReviews | null

  if (!project) {
    return (
      <div className='space-y-4'>
        <Header title='Project Not Found' description='The requested project does not exist.' />
        <Link className='text-primary hover:underline' href='/faculty/mark'>
          Back to Marking Page
        </Link>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      <Header title={`Peer Reviews for ${project.title}`} description='View student peer reviews for this project.' />

      {project.students.map((student) => (
        <div key={student.id} className='space-y-4'>
          <TypographyP>
            <strong>{student.user.name}'s Reviews:</strong>
          </TypographyP>

          {student.ReviewerPeerReviews.length === 0 ? (
            <TypographyP>No reviews given by this student.</TypographyP>
          ) : (
            <Table>
              <TableCaption>Peer reviews given by {student.user.name}</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Reviewee</TableHead>
                  <TableHead>Rank</TableHead>
                  <TableHead>Last Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {student.ReviewerPeerReviews.map((review) => (
                  <TableRow key={review.id}>
                    <TableCell>{review.reviewee.user.name}</TableCell>
                    <TableCell>{review.rank}</TableCell>
                    <TableCell>{new Date(review.updatedAt).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      ))}

      <div>
        <Link className='text-primary hover:underline' href='/faculty/mark'>
          Back to Marking Page
        </Link>
      </div>
    </div>
  )
}

export default ProjectPeerReviewPage
