import { Grade, GradeType, Semester, SemesterTimeline } from '@prisma/client'

export type GradeWithDetails = Grade & {
  semesterGradeType: GradeType & {
    semester: Semester & {
      timeline: SemesterTimeline | null
    }
  }
}
