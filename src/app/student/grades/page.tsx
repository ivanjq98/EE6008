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

  const student = await prisma.student.findUnique({
    where: { id: session.user.studentId },
    include: {
      Grade: {
        include: {
          semesterGradeType: true,
          faculty: true
        }
      },
      project: {
        include: {
          faculties: {
            include: {
              faculty: true
            }
          }
        }
      }
    }
  })

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

  const PASS_THRESHOLD = 60

  const facultyRoleWeightages = await prisma.facultyRoleWeightage.findMany()
  const weightageObj = facultyRoleWeightages.reduce(
    (acc, curr) => {
      acc[curr.role] = curr.weightage / 100
      return acc
    },
    {} as Record<string, number>
  )

  const gradesArray =
    student?.Grade.reduce(
      (acc, grade) => {
        const existingGrade = acc.find((g) => g.semesterGradeTypeId === grade.semesterGradeType.name)

        if (existingGrade) {
          if (student.project?.faculties.some((pf) => pf.faculty.id === grade.faculty.id && pf.role === 'SUPERVISOR')) {
            existingGrade.supervisorScore = grade.score
          } else if (
            student.project?.faculties.some((pf) => pf.faculty.id === grade.faculty.id && pf.role === 'MODERATOR')
          ) {
            existingGrade.moderatorScore = grade.score
          }

          if (existingGrade.supervisorScore !== null && existingGrade.moderatorScore !== null) {
            const weightedScore =
              existingGrade.supervisorScore * (weightageObj['SUPERVISOR'] || 0.7) +
              existingGrade.moderatorScore * (weightageObj['MODERATOR'] || 0.3)

            existingGrade.combinedScore = weightedScore
            // Calculate percentage score based on weightage
            const percentageScore = (weightedScore / grade.semesterGradeType.weightage) * 100
            existingGrade.status = percentageScore >= PASS_THRESHOLD ? 'Pass' : 'Fail'
          }
        } else {
          acc.push({
            id: grade.id,
            semesterGradeTypeId: grade.semesterGradeType.name,
            weightage: grade.semesterGradeType.weightage,
            supervisorScore: student.project?.faculties.some(
              (pf) => pf.faculty.id === grade.faculty.id && pf.role === 'SUPERVISOR'
            )
              ? grade.score
              : null,
            moderatorScore: student.project?.faculties.some(
              (pf) => pf.faculty.id === grade.faculty.id && pf.role === 'MODERATOR'
            )
              ? grade.score
              : null,
            combinedScore: null,
            status: 'Pending'
          })
        }

        return acc
      },
      [] as Array<{
        id: string
        semesterGradeTypeId: string
        weightage: number
        supervisorScore: number | null
        moderatorScore: number | null
        combinedScore: number | null
        status: 'Pass' | 'Fail' | 'Pending'
      }>
    ) || []

  // Calculate total score
  const totalScore = gradesArray.reduce((sum, grade) => {
    if (grade.combinedScore === null) return sum
    return sum + grade.combinedScore
  }, 0)

  const finalStatus = totalScore >= PASS_THRESHOLD ? 'Pass' : 'Fail'

  const currentDate = new Date()
  const resultReleaseDate = semester?.timeline?.studentResultRelease

  return (
    <div className='container mx-auto py-10'>
      <h1 className='mb-5 text-2xl font-bold'>Your Project Status</h1>

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
            {format(resultReleaseDate, 'HH:mm:ss')}. Please check back after this date and time to view your status.
          </AlertDescription>
        </Alert>
      ) : (
        <>
          <Alert className='mb-6'>
            <InfoIcon className='h-4 w-4' />
            <AlertTitle>Results Released</AlertTitle>
            <AlertDescription>
              The final results have been released. You can now view your status below.
            </AlertDescription>
          </Alert>

          {gradesArray.length === 0 ? (
            <Card>
              <CardContent className='pt-6'>
                <p>No status information is available at this time.</p>
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
                      <TableHead>Module</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>{student?.project?.title || 'No project assigned'}</TableCell>
                      <TableCell className={finalStatus === 'Pass' ? 'text-green-600' : 'text-red-600'}>
                        {finalStatus}
                      </TableCell>
                    </TableRow>
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

// <Alert className='mb-6'>
// <InfoIcon className='h-4 w-4' />
// <AlertTitle>Results Released</AlertTitle>
// <AlertDescription>
//   The final results have been released. You can now view your grades below.
// </AlertDescription>
// </Alert>

// {gradesArray.length === 0 ? (
// <Card>
//   <CardContent className='pt-6'>
//     <p>No grade information is available at this time.</p>
//   </CardContent>
// </Card>
// ) : (
// <>
//   <Card className='mb-6'>
//     <CardHeader>
//       <CardTitle>{semester.name}</CardTitle>
//     </CardHeader>
//     <CardContent>
//       <Table>
//         <TableHeader>
//           <TableRow>
//             <TableHead>Assessment Component</TableHead>
//             <TableHead>Weightage</TableHead>
//             <TableHead>Score</TableHead>
//             <TableHead>Status</TableHead>
//           </TableRow>
//         </TableHeader>
//         <TableBody>
//           {gradesArray.map((grade) => (
//             <TableRow key={grade.id}>
//               <TableCell>{grade.semesterGradeTypeId}</TableCell>
//               <TableCell>{grade.weightage}%</TableCell>
//               <TableCell>
//                 {grade.combinedScore !== null ? grade.combinedScore.toFixed(1) : 'Pending'}
//               </TableCell>
//               <TableCell
//                 className={
//                   grade.status === 'Pass'
//                     ? 'text-green-600'
//                     : grade.status === 'Fail'
//                     ? 'text-red-600'
//                     : ''
//                 }
//               >
//                 {grade.status}
//               </TableCell>
//             </TableRow>
//           ))
