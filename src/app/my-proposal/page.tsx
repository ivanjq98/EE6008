import _ from 'lodash'
import { getServerSession } from 'next-auth'

import { columns } from '@/src/components/faculty/view-my-projects-table/columns'
import { DataTable } from '@/src/components/faculty/view-my-projects-table/data-table'
import { Header } from '@/src/components/header'
import { authOptions } from '@/src/lib/auth'
import { prisma } from '@/src/lib/prisma'

const CreateProposal = async () => {
  const session = await getServerSession(authOptions)
  const user = session?.user

  if (!user) return null

  const data = await prisma.project.findMany({
    where: { facultyId: user.facultyId },
    include: {
      programme: {
        select: {
          semester: {
            select: {
              name: true
            }
          },
          name: true,
          leader: {
            select: {
              user: {
                select: {
                  name: true
                }
              }
            }
          }
        }
      }
    }
  })

  const semesterOptions = _.uniq(data.map((project) => project.programme?.semester?.name))

  const semesterOptionsSanitized = semesterOptions.map((semester) => ({
    label: semester,
    value: semester
  }))

  const projectSanitized = data.map((project) => {
    return {
      id: project.id,
      title: project.title,
      status: project.status,
      semester: project.programme?.semester?.name,
      programme: project.programme?.name,
      reviewer: project.programme?.leader?.user?.name,
      reviewMessage: project.reviewMessage
    }
  })

  return (
    <div className='space-y-4'>
      <Header title='View your proposal' description='Check the status of your project below' />

      <DataTable columns={columns} data={projectSanitized} semesterOptions={semesterOptionsSanitized} />
    </div>
  )
}

export default CreateProposal
