// src/components/faculty/grade/section-grade.tsx
import { getServerSession } from 'next-auth'
import { authOptions } from '@/src/lib/auth'
import { prisma } from '@/src/lib/prisma'
import { GradeForm } from './grade-form'

interface SectionGradeProps {
  studentsData: { name: string; id: string; matriculationNumber: string }[]
  projectId: string
  semesterGradeTypeId: string
  facultyId?: string
  facultyRole: 'SUPERVISOR' | 'MODERATOR'
}

const SectionGrade = async ({
  studentsData,
  projectId,
  semesterGradeTypeId,
  facultyId,
  facultyRole
}: SectionGradeProps) => {
  const gradesData = await prisma.grade.findMany({
    where: {
      projectId: projectId,
      semesterGradeTypeId: semesterGradeTypeId,
      faculty: {
        id: facultyId,
        ProjectFaculty: {
          some: {
            projectId: projectId,
            role: facultyRole
          }
        }
      }
    },
    include: {
      faculty: {
        include: {
          ProjectFaculty: true
        }
      }
    }
  })

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
      facultyId: facultyId ?? '', // Provide a default empty
      projectId: projectId,
      grade: studentGrade?.score != null ? (studentGrade.score as number) : ('' as const),
      matriculationNumber: student.matriculationNumber
    }
  })

  return (
    <div>
      <GradeForm
        defaultValues={sanitizedDefaultValue}
        semesterGradeTypeId={semesterGradeTypeId}
        weightage={gradeType.weightage}
        facultyRole={facultyRole}
      />
    </div>
  )
}

export default SectionGrade
