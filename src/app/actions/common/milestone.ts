'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { prisma } from '@/src/lib/prisma'
import { AddMilestoneFormSchema, EditMilestoneFormSchema } from '@/src/lib/schema'

// Function to add a milestone
export async function addMilestone(data: z.infer<typeof AddMilestoneFormSchema>, projectId: string) {
  const { objective, description, startAt, endAt, status } = data
  try {
    // Create a new milestone in the database
    const milestone = await prisma.milestone.create({
      data: {
        objective,
        description,
        startAt,
        endAt,
        status,
        project: {
          connect: {
            id: projectId
          }
        }
      }
    })

    // Revalidate paths if necessary
    revalidatePath('/milestones')
    revalidatePath('/milestones/view-all')

    return {
      message: `Milestone successfully created!`,
      status: 'OK',
      data: milestone
    }
  } catch (error) {
    return { message: `${error}`, status: 'ERROR' }
  }
}

// Function to edit a milestone
export async function editMilestone(data: z.infer<typeof EditMilestoneFormSchema>) {
  const { objective, description, startAt, endAt, status, milestoneId } = data

  try {
    const updatedMilestone = await prisma.milestone.update({
      where: {
        id: milestoneId
      },
      data: {
        objective,
        description,
        startAt,
        endAt,
        status
      }
    })

    return {
      message: `Milestone successfully updated!`,
      status: 'OK',
      data: updatedMilestone
    }
  } catch (error) {
    return { message: `${error}`, status: 'ERROR' }
  }
}

// Function to delete a milestone
export async function deleteMilestone(id: string) {
  try {
    await prisma.milestone.delete({
      where: {
        id
      }
    })

    return {
      message: `Milestone successfully deleted!`,
      status: 'OK'
    }
  } catch (error) {
    return { message: `${error}`, status: 'ERROR' }
  }
}
