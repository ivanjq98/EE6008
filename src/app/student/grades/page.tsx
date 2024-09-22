import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/src/lib/auth'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/src/components/ui/table'
import { Alert, AlertDescription, AlertTitle } from '@/src/components/ui/alert'
import { InfoIcon } from 'lucide-react'
import { format } from 'date-fns'
import { prisma } from '@/src/lib/prisma'
import { Grade, Project, Student, User } from '@prisma/client'

type ExtendedFaculty = {
  id: string
  userId: string
  createdAt: Date
  updatedAt: Date
  user: User
  Grade: Grade[]
}

type ExtendedProject = Project & {
  faculties: {
    facultyId: string
    projectId: string
    role: 'SUPERVISOR' | 'MODERATOR'
    faculty: ExtendedFaculty
  }[]
}

type ExtendedStudent = Student & {
  Grade: (Grade & {
    semesterGradeType: { name: string; weightage: number }
    faculty: ExtendedFaculty
  })[]
  project: ExtendedProject | null
}

export default async function StudentGradesPage() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    redirect('/login')
  }

  const student = (await prisma.student.findUnique({
    where: { id: session.user.studentId },
    include: {
      Grade: {
        include: {
          semesterGradeType: true,
          faculty: {
            include: {
              Grade: true,
              user: true
            }
          }
        }
      },
      project: {
        include: {
          faculties: {
            include: {
              faculty: {
                include: {
                  Grade: true,
                  user: true
                }
              }
            }
          }
        }
      }
    }
  })) as ExtendedStudent | null

  const semester = await prisma.semester.findFirst({
    where: {
      active: true
    },
    select: {
      id: true,
      name: true,
      timeline: {
        select: {
          studentResultRelease: true
        }
      }
    }
  })

  const PASS_THRESHOLD = 60 // Adjust this value as needed

  const facultyRoleWeightages = await prisma.facultyRoleWeightage.findMany()
  const weightageObj = facultyRoleWeightages.reduce(
    (acc, curr) => {
      acc[curr.role] = curr.weightage / 100 // Convert to decimal
      return acc
    },
    {} as Record<string, number>
  )

  let totalScore = 0
  let totalWeightage = 0

  student?.Grade.forEach((grade) => {
    const supervisorScore =
      student.project?.faculties
        .find((pf) => pf.faculty.id === grade.faculty.id && pf.role === 'SUPERVISOR')
        ?.faculty.Grade.find((g) => g.studentId === student.id)?.score ?? 0

    const moderatorScore =
      student.project?.faculties
        .find((pf) => pf.faculty.id === grade.faculty.id && pf.role === 'MODERATOR')
        ?.faculty.Grade.find((g) => g.studentId === student.id)?.score ?? 0

    const weightedScore =
      supervisorScore * (weightageObj['SUPERVISOR'] || 0.7) + moderatorScore * (weightageObj['MODERATOR'] || 0.3)

    totalScore += weightedScore * (grade.semesterGradeType.weightage / 100)
    totalWeightage += grade.semesterGradeType.weightage
  })

  const finalPercentage = (totalScore / totalWeightage) * 100
  const finalStatus = finalPercentage >= PASS_THRESHOLD ? 'Pass' : 'Fail'

  const currentDate = new Date()
  const resultReleaseDate = semester?.timeline?.studentResultRelease

  return (
    <div className='container mx-auto py-10'>
      <h1 className='mb-5 text-2xl font-bold'>Your Project Grade</h1>

      {!semester || !resultReleaseDate ? (
        <Alert className='mb-6'>
          <InfoIcon className='h-4 w-4' />
          <AlertTitle>Results Not Available</AlertTitle>
          <AlertDescription>The result release date has not been set yet. Please check back later.</AlertDescription>
        </Alert>
      ) : currentDate < resultReleaseDate ? (
        <Alert className='mb-6'>
          <InfoIcon className='h-4 w-4' />
          <AlertTitle>Results Not Yet Released</AlertTitle>
          <AlertDescription>
            The final results will be released on {format(resultReleaseDate, 'PPP')} at{' '}
            {format(resultReleaseDate, 'HH:mm:ss')}. Please check back after this date and time to view your grade.
          </AlertDescription>
        </Alert>
      ) : (
        <>
          <Alert className='mb-6'>
            <InfoIcon className='h-4 w-4' />
            <AlertTitle>Results Released</AlertTitle>
            <AlertDescription>
              The final results have been released. You can now view your grade below.
            </AlertDescription>
          </Alert>

          <Card className='mb-6'>
            <CardHeader>
              <CardTitle>{semester.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Project</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>{student?.project?.title || 'No project assigned'}</TableCell>
                    <TableCell>{finalStatus}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
