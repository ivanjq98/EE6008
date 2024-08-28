import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/src/lib/auth'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/src/components/ui/table'
import { Alert, AlertDescription, AlertTitle } from '@/src/components/ui/alert'
import { InfoIcon } from 'lucide-react'
import { format } from 'date-fns'
import { getStudentGradesAndTimeline } from './getStudentGradesAndTimeline'
import { GradeWithDetails } from './types'

export default async function StudentGradesPage() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    redirect('/login')
  }

  const studentId = session.user.id
  const { gradesBySemester, resultReleaseDate } = await getStudentGradesAndTimeline(studentId)

  console.log(resultReleaseDate) // Log the resultReleaseDate here

  const currentDate = new Date()

  return (
    <div className='container mx-auto py-10'>
      <h1 className='mb-5 text-2xl font-bold'>Your Grades</h1>

      {resultReleaseDate === null ? (
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

          {Object.keys(gradesBySemester).length === 0 ? (
            <Card>
              <CardContent className='pt-6'>
                <p>No grade information is available at this time.</p>
              </CardContent>
            </Card>
          ) : (
            Object.entries(gradesBySemester).map(([semester, grades]) => (
              <Card key={semester} className='mb-6'>
                <CardHeader>
                  <CardTitle>{semester}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Assessment Component</TableHead>
                        <TableHead>Grade</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {grades.map((grade: GradeWithDetails) => (
                        <TableRow key={grade.id}>
                          <TableCell>{grade.semesterGradeType.name}</TableCell>
                          <TableCell>{grade.score !== null ? grade.score.toString() : 'Pending'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            ))
          )}
        </>
      )}
    </div>
  )
}
