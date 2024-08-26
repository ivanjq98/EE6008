import { getServerSession } from 'next-auth'

import { authOptions } from '@/src/lib/auth'
import { prisma } from '@/src/lib/prisma'

import { GradeForm } from './grade-form'

interface SectionGradeProps {
  studentsData: { name: string; id: string; matriculationNumber: string }[]
  projectId: string
  semesterGradeTypeId: string
}

const SectionGrade = async ({ studentsData, projectId, semesterGradeTypeId }: SectionGradeProps) => {
  const session = await getServerSession(authOptions)

  if (!session) return null

  const facultyId = session.user.facultyId

  if (facultyId === undefined) return null

  const gradesData = await prisma.grade.findMany({
    where: {
      projectId: projectId,
      semesterGradeTypeId: semesterGradeTypeId
    }
  })

  // Fetch the grade type information including weightage
  const gradeType = await prisma.gradeType.findUnique({
    where: {
      id: semesterGradeTypeId
    },
    select: {
      weightage: true
    }
  })

  if (!gradeType) {
    console.error('Grade type not found')
    return null
  }

  const sanitizedDefaultValue = studentsData.map((student) => {
    const studentGrade = gradesData.find((grade) => grade.studentId === student.id)
    return {
      studentId: student.id,
      studentName: student.name,
      facultyId: facultyId,
      projectId: projectId,
      name: student.name,
      grade: studentGrade?.score ? studentGrade.score : ('' as const),
      matriculationNumber: student.matriculationNumber
    }
  })

  console.log(sanitizedDefaultValue)

  return (
    <div>
      <GradeForm
        defaultValues={sanitizedDefaultValue}
        semesterGradeTypeId={semesterGradeTypeId}
        weightage={gradeType.weightage}
      />
    </div>
  )
}

export default SectionGrade
