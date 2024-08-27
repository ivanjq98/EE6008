import { Suspense } from 'react'
import { prisma } from '@/src/lib/prisma'
import { columns } from './columns'
import { DataTable } from './data-table'

async function getStudentMarks() {
  const studentMarks = await prisma.student.findMany({
    include: {
      user: true,
      project: {
        include: {
          faculty: {
            include: {
              user: true
            }
          }
        }
      },
      Grade: true
    }
  })

  return studentMarks.map((student) => ({
    id: student.id,
    name: student.user.name,
    matriculationNumber: student.matriculationNumber,
    projectTitle: student.project?.title || 'Not Assigned',
    projectSupervisor: student.project?.faculty.user.name || 'N/A',
    totalScore: student.Grade.reduce((sum, grade) => sum + (grade.score ?? 0), 0)
  }))
}

export default async function StudentMarksOverviewPage() {
  const studentMarks = await getStudentMarks()

  return (
    <div className='container mx-auto py-10'>
      <h1 className='mb-5 text-2xl font-bold'>Student Marks Overview</h1>
      <Suspense fallback={<div>Loading...</div>}>
        <DataTable columns={columns} data={studentMarks} />
      </Suspense>
    </div>
  )
}
