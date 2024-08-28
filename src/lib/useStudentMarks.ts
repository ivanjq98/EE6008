import { useState, useEffect } from 'react'
import { prisma } from '@/src/lib/prisma'

interface StudentMark {
  id: string
  [key: string]: number | string
}

export function useStudentMarks() {
  const [data, setData] = useState<StudentMark[] | null>(null)
  const [assessmentComponents, setAssessmentComponents] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const studentData = await prisma.student.findMany({
          include: {
            Grade: {
              include: {
                semesterGradeType: true
              }
            }
          }
        })

        const components = await prisma.gradeType.findMany({
          select: { name: true },
          distinct: ['name']
        })

        const formattedData = studentData.map((student) => {
          const grades = components.reduce(
            (acc, component) => {
              const grade = student.Grade.find((g) => g.semesterGradeType.name === component.name)
              acc[component.name] = grade?.score ?? 0
              return acc
            },
            {} as Record<string, number>
          )

          const totalScore = Object.values(grades).reduce((sum, score) => sum + score, 0)

          return {
            id: student.id,
            ...grades,
            totalScore
          }
        })

        setData(formattedData)
        setAssessmentComponents(components.map((c) => c.name))
      } catch (e) {
        setError(e instanceof Error ? e : new Error('An error occurred'))
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  return { data, assessmentComponents, isLoading, error }
}
