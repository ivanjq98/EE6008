import { prisma } from '@/src/lib/prisma'

export async function isAppealPeriod(): Promise<boolean> {
  try {
    const currentDate = new Date()

    const activeSemester = await prisma.semester.findFirst({
      where: { active: true },
      include: { timeline: true }
    })

    if (!activeSemester || !activeSemester.timeline) {
      console.error('No active semester or timeline found')
      return false
    }

    const { studentRegistrationStart, studentRegistrationEnd } = activeSemester.timeline

    return currentDate >= studentRegistrationStart && currentDate <= studentRegistrationEnd
  } catch (error) {
    console.error('Error checking appeal period:', error)
    return false
  }
}

// You can add more date-related utility functions here if needed

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function getDateDifference(date1: Date, date2: Date): number {
  return Math.abs(date1.getTime() - date2.getTime()) / (1000 * 60 * 60 * 24)
}
