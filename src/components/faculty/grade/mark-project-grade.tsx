import React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/src/components/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/src/components/ui/table'
import SectionGrade from '@/src/components/faculty/grade/section-grade'

interface Student {
  id: string
  name: string
  matriculationNumber: string
  totalScore?: number
  grade?: string
}

interface GradeType {
  id: string
  name: string
  weightage: number
}

type FacultyRole = 'SUPERVISOR' | 'MODERATOR'

interface MarkProjectGradeProps {
  projectId: string
  students: Student[]
  gradeTypes: GradeType[]
  totalScores: Student[]
  facultyRole: FacultyRole
}

const getGrade = (score: number): string => {
  if (score >= 80) return 'A'
  if (score >= 70) return 'B'
  if (score >= 60) return 'C'
  if (score >= 50) return 'D'
  return 'F'
}

export const MarkProjectGrade: React.FC<MarkProjectGradeProps> = ({
  projectId,
  students,
  gradeTypes,
  totalScores,
  facultyRole
}) => {
  if (gradeTypes.length === 0) {
    return <div>No grade types available.</div>
  }

  return (
    <Tabs defaultValue={gradeTypes[0].name}>
      <TabsList>
        {gradeTypes.map((gradeType) => (
          <TabsTrigger value={gradeType.name} key={gradeType.id}>
            {gradeType.name} ({gradeType.weightage}%)
          </TabsTrigger>
        ))}
        <TabsTrigger value='total-scores'>Total Scores</TabsTrigger>
      </TabsList>
      {gradeTypes.map((gradeType) => (
        <TabsContent value={gradeType.name} key={gradeType.id}>
          <SectionGrade
            studentsData={students}
            projectId={projectId}
            semesterGradeTypeId={gradeType.id}
            facultyRole={facultyRole}
          />
        </TabsContent>
      ))}
      <TabsContent value='total-scores'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Matriculation Number</TableHead>
              <TableHead className='text-right'>Total Score</TableHead>
              <TableHead className='text-right'>Grade</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {totalScores.map((student) => (
              <TableRow key={student.id}>
                <TableCell>{student.name}</TableCell>
                <TableCell>{student.matriculationNumber}</TableCell>
                <TableCell className='text-right'>{student.totalScore?.toFixed(2) ?? 'N/A'}</TableCell>
                <TableCell className='text-right'>{student.grade ?? 'N/A'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TabsContent>
    </Tabs>
  )
}
