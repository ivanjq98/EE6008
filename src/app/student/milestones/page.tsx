// src/app/student/milestones/page.tsx
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { prisma } from '@/src/lib/prisma'
import { authOptions } from '@/src/lib/auth'

export default async function MilestonesPage() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user.studentId) {
    redirect('/login')
  }

  // Fetch the student's current project
  const student = await prisma.student.findUnique({
    where: { id: session.user.studentId },
    include: { project: true }
  })

  if (student?.project) {
    // If the student has a project, redirect to that project's milestones
    redirect(`/student/milestones/${student.project.id}`)
  } else {
    // If the student doesn't have a project, you might want to redirect to a different page
    // or show a message saying they need to join a project first
    return <div>You need to join a project before viewing milestones.</div>
  }
}
