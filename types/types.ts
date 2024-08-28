import { Grade, Semester, SemesterTimeline, SemesterGradeType } from '@prisma/client'

export type GradeWithSemester = Grade & {
  semesterGradeType: SemesterGradeType & {
    semester: Semester & {
      timeline:
        | (SemesterTimeline & {
            studentResultRelease: Date | null
          })
        | null
    }
  }
}
