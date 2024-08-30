import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/src/lib/auth'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/src/components/ui/table'
import { Alert, AlertDescription, AlertTitle } from '@/src/components/ui/alert'
import { InfoIcon } from 'lucide-react'
import { format } from 'date-fns'
import { getStudentGradesAndTimeline } from './getStudentGradesAndTimeline'
import { Grade, GradeType, Semester, SemesterTimeline } from '@prisma/client'
import { prisma } from '@/src/lib/prisma'

export default async function StudentGradesPage() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    redirect('/login')
  }

  const studentId = session.user.id
  // const { gradesArray, semester } = await getStudentGradesAndTimeline(studentId)

  // console.log('Grades Array', gradesArray) // Log the grades here
  // console.log('Semester', semester) // Log the grades here

  const results = await prisma.student.findUnique({
    where: { id: session.user.studentId },
    include: {
      Grade: {
        include: {
          semesterGradeType: true // This will include the GradeType information
        }
      }
    }
  })

  console.log('ivan; ivan_test', results)

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

  const gradesArray = results?.Grade.map((grade) => ({
    id: grade.id,
    score: grade.score,
    semesterGradeTypeId: grade.semesterGradeType.name,
    weightage: grade.semesterGradeType.weightage
  }))

  const currentDate = new Date()
  const resultReleaseDate = semester?.timeline?.studentResultRelease

  const getScoreLabel = (score: number, weightage: number) => {
    const normalizedScore = (score / weightage) * 100
    if (normalizedScore >= 80) return 'A'
    if (normalizedScore >= 70) return 'B'
    if (normalizedScore >= 60) return 'C'
    if (normalizedScore >= 50) return 'D'
    return 'F'
  }

  return (
    <div className='container mx-auto py-10'>
      <h1 className='mb-5 text-2xl font-bold'>Your Grades</h1>

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
            {format(resultReleaseDate, 'HH:mm:ss')}. Please check back after this date and time to view your grades.
          </AlertDescription>
        </Alert>
      ) : (
        <>
          <Alert className='mb-6'>
            <InfoIcon className='h-4 w-4' />
            <AlertTitle>Results Released</AlertTitle>
            <AlertDescription>
              The final results have been released. You can now view your grades below.
            </AlertDescription>
          </Alert>

          {!gradesArray || gradesArray.length === 0 ? (
            <Card>
              <CardContent className='pt-6'>
                <p>No grade information is available at this time.</p>
              </CardContent>
            </Card>
          ) : (
            <Card className='mb-6'>
              <CardHeader>
                <CardTitle>{semester.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Assessment Component</TableHead>
                      <TableHead>Weightage</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Grade</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {gradesArray.map((grade) => (
                      <TableRow key={grade.id}>
                        <TableCell>{grade.semesterGradeTypeId}</TableCell>
                        <TableCell>{grade.weightage}%</TableCell>
                        <TableCell>{grade.score !== null ? grade.score.toString() : 'Pending'}</TableCell>
                        <TableCell>
                          {grade.score !== null ? getScoreLabel(grade.score, grade.weightage) : 'Pending'}
                        </TableCell>{' '}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
