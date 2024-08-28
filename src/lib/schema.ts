import { z } from 'zod'

export const EditSemesterDataFormSchema = z.object({
  semesterId: z.string(),
  minimumGroupSize: z.coerce.number().min(1),
  maximumGroupSize: z.coerce.number().min(1),
  projectApplicationsLimit: z.coerce.number().min(1),
  facultyProposalSubmission: z.object({
    from: z.date(),
    to: z.date()
  }),
  facultyProposalReview: z.object({
    from: z.date(),
    to: z.date()
  }),
  studentRegistration: z.object({
    from: z.date(),
    to: z.date()
  }),
  markEntry: z.object({
    from: z.date(),
    to: z.date()
  }),
  peerReview: z.object({
    from: z.date(),
    to: z.date()
  }),
  assessmentFormats: z
    .array(
      z.object({
        name: z.string().min(1, 'Format name is required'),
        weightage: z.number().min(0).max(100)
      })
    )
    .refine((formats) => formats.reduce((sum, format) => sum + format.weightage, 0) === 100, {
      message: 'Total weightage must be exactly 100%'
    }),
  studentResultRelease: z.date()
})
const semesterNameRegex = /^[0-9]{2}[S][0-9]{1}$/

export const CreateSemesterDataFormSchema = z.object({
  semesterName: z
    .string()
    .refine((value) => semesterNameRegex.test(value), 'Semester name must be in the format {YY}{S}{#}'),
  minimumGroupSize: z.coerce.number().min(1),
  maximumGroupSize: z.coerce.number().min(1),
  projectApplicationsLimit: z.coerce.number().min(1),
  facultyProposalSubmission: z.object({
    from: z.date(),
    to: z.date()
  }),
  facultyProposalReview: z.object({
    from: z.date(),
    to: z.date()
  }),
  studentRegistration: z.object({
    from: z.date(),
    to: z.date()
  }),
  markEntry: z.object({
    from: z.date(),
    to: z.date()
  }),
  peerReview: z.object({
    from: z.date(),
    to: z.date()
  }),
  programmeDetails: z
    .object({
      programmeName: z.string().min(1, { message: 'Programme name is required' }),
      faculty: z.string().min(1, { message: 'Faculty name is required' }),
      programCode: z.string().min(1)
    })
    .array()
    .min(1, { message: 'At least one programme is required' }),
  assessmentFormats: z.array(
    z.object({
      id: z.string().optional(),
      name: z.string().min(1, 'Assessment name is required'),
      weightage: z.number().min(0).max(100, 'Weightage must be between 0 and 100')
    })
  ),
  studentResultRelease: z.date()
})

export const AddProjectFormSchema = z.object({
  title: z
    .string()
    .min(2, {
      message: 'Title must be at least 2 characters.'
    })
    .max(50, {
      message: 'Title must not be longer than 50 characters.'
    }),
  programme: z.string().min(1, {
    message: 'Please select a programme'
  }),
  description: z.string().max(1000).min(1),
  venueId: z.string().nullable(),
  semesterId: z.string()
})

export const EditProjectFormSchema = z.object({
  title: z.string(),
  description: z.string(),
  semesterId: z.string(),
  projectId: z.string(),
  venueId: z.string().nullable()
})

export const AddStudentFormSchema = z.object({
  name: z.string().min(1, {
    message: 'Name is required.'
  }),
  email: z.string().min(1, {
    message: 'User email is required.'
  }),
  password: z.string().min(1, {
    message: 'User password is required.'
  }),
  matriculationNumber: z.string().min(1, {
    message: 'Matriculation number is required.'
  })
})

export const AddFacultyFormSchema = z.object({
  name: z.string().min(1, {
    message: 'Name is required.'
  }),
  email: z.string().min(1, {
    message: 'User email is required.'
  }),
  password: z.string().min(1, {
    message: 'User password is required.'
  })
})

export const UpdateStudentGradeFormSchema = z.object({
  studentGrades: z.array(
    z.object({
      studentName: z.string().min(1, { message: 'Student name is required' }),
      studentId: z.string().min(1, { message: 'Student ID is required' }),
      facultyId: z.string().min(1, { message: 'Faculty ID is required' }),
      matriculationNumber: z.string().min(1, { message: 'Matriculation number is required' }),
      projectId: z.string().min(1, { message: 'Project ID is required' }),
      grade: z.union([
        z.literal('', {
          errorMap: () => ({ message: 'Leave empty for no marks' })
        }),
        z.coerce.number().min(0).max(100, { message: 'Grade must be between 0 and 100' })
      ])
    })
  )
})

export const milestoneSchema = z.object({
  objective: z.string().min(1, 'Objective is required'),
  description: z.string().optional(),
  startDate: z.date(),
  endDate: z.date(),
  status: z.enum(['COMPLETED', 'NOT_COMPLETED'])
})
