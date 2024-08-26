'use client'

import React from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { updateStudentGrade } from '@/src/app/actions/faculty/mark'
import { Button } from '@/src/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/src/components/ui/form'
import { Input } from '@/src/components/ui/input'
import { UpdateStudentGradeFormSchema } from '@/src/lib/schema'
import { cn } from '@/src/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'

interface GradeFormProps {
  defaultValues: {
    studentId: string
    facultyId: string
    projectId: string
    grade: number | ''
    studentName: string
    matriculationNumber: string
  }[]
  semesterGradeTypeId: string
  weightage: number
}

const getScoreLabel = (score: number, weightage: number) => {
  const normalizedScore = (score / weightage) * 100
  if (normalizedScore >= 80) return 'A'
  if (normalizedScore >= 70) return 'B'
  if (normalizedScore >= 60) return 'C'
  if (normalizedScore >= 50) return 'D'
  return 'F'
}

export function GradeForm({ defaultValues, semesterGradeTypeId, weightage }: GradeFormProps) {
  const form = useForm<z.infer<typeof UpdateStudentGradeFormSchema>>({
    resolver: zodResolver(UpdateStudentGradeFormSchema),
    defaultValues: { studentGrades: defaultValues }
  })

  const { fields, append, remove } = useFieldArray({
    name: 'studentGrades',
    control: form.control
  })

  async function onSubmit(values: z.infer<typeof UpdateStudentGradeFormSchema>) {
    const filteredValues = values.studentGrades.filter((student) => student.grade !== '')
    values.studentGrades = filteredValues

    const result = await updateStudentGrade(values, semesterGradeTypeId)
    if (result.status === 'ERROR') {
      toast.error(result.message)
    } else {
      toast.success(result.message)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
        <div className='space-y-2'>
          <div className='grid items-center gap-x-4 gap-y-4 px-1 md:grid-cols-12'>
            <div className='hidden gap-x-4 md:col-span-12 md:grid md:grid-cols-12'>
              <div className={cn('md:col-span-4 md:block')}>
                <FormLabel>Name</FormLabel>
              </div>
              <div className={cn('md:col-span-3 md:block')}>
                <FormLabel>Matric No.</FormLabel>
              </div>
              <div className={cn('text-right md:col-span-3 md:block')}>
                <FormLabel>Grade</FormLabel>
              </div>
              <div className={cn('text-right md:col-span-2 md:block')}>
                <FormLabel>Score Label</FormLabel>
              </div>
            </div>
            {fields.map((field, index) => (
              <React.Fragment key={field.id}>
                <div className='text-sm md:col-span-4'>{form.getValues(`studentGrades.${index}.studentName`)}</div>
                <div className='text-sm md:col-span-3'>
                  {form.getValues(`studentGrades.${index}.matriculationNumber`)}
                </div>
                <FormField
                  control={form.control}
                  name={`studentGrades.${index}.grade`}
                  render={({ field }) => (
                    <FormItem className='flex justify-end md:col-span-3'>
                      <FormControl>
                        <Input className='w-20 text-right' {...field} type='number' min={0} max={weightage} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className='text-right text-sm md:col-span-2'>
                  {form.watch(`studentGrades.${index}.grade`) !== ''
                    ? getScoreLabel(Number(form.watch(`studentGrades.${index}.grade`)) || 0, weightage)
                    : '-'}
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>

        <FormDescription>
          Leave empty for no marks, grade must be between the range from 0 to {weightage}
        </FormDescription>
        <Button type='submit'>Submit</Button>
      </form>
    </Form>
  )
}
