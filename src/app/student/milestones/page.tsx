// import { getServerSession } from 'next-auth'
// import Link from 'next/link'

// import { Header } from '@/src/components/header'
// // import milestoneForm from '@/src/components/student/milestones/milestone-form'
// import { authOptions } from '@/src/lib/auth'
// import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card'
// import { getStudentAllocatedProject } from '@/src/server/student'

// const MilestonePage = async () => {
//   const session = await getServerSession(authOptions)
//   const user = session?.user

//   if (!user || !user.studentId) {
//     return <NoAccessToThePage message='You must be logged in as a student to view this page.' />
//   }

//   const data = await getStudentAllocatedProject(user.studentId)

//   return (
//     <section className='space-y-6 py-6'>
//       <div className='flex flex-col gap-4'>
//         <Header title='Milestone Page!' description='Create and plan your objective here!' />
//         {data == null ? (
//           <div className='grid gap-2'>
//             <p className='text-md text-secondary-foreground md:text-lg'>You have not been allocated to any project</p>
//             <div>
//               <Link className='text-primary hover:underline' href='/student'>
//                 Back to dashboard
//               </Link>
//             </div>
//           </div>
//         ) : (
//           <Card>
//             <CardHeader>
//               <CardTitle>{data.title}</CardTitle>
//             </CardHeader>
//             <CardContent className='space-y-4'>
//               <MilestoneFormSection />
//             </CardContent>
//           </Card>
//         )}
//       </div>
//     </section>
//   )
// }

// export default MilestonePage

// const NoAccessToThePage = ({ message }: { message: string }) => {
//   return (
//     <section className='py-6'>
//       <div className='space-y-4'>
//         <Header title='Access Denied' description={message} />
//         <div>
//           <Link className='text-primary hover:underline' href='/student'>
//             Back to dashboard
//           </Link>
//         </div>
//       </div>
//     </section>
//   )
// }

import { getServerSession } from 'next-auth'
import Link from 'next/link'

import { Header } from '@/src/components/header'
import { authOptions } from '@/src/lib/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card'
import { getStudentAllocatedProject } from '@/src/server/student'
import { AddMilestoneForm } from '@/src/components/form/AddMilestoneForm' // Ensure this path is correct

const MilestonePage = async () => {
  const session = await getServerSession(authOptions)
  const user = session?.user

  if (!user || !user.studentId) {
    return <NoAccessToThePage message='You must be logged in as a student to view this page.' />
  }

  const data = await getStudentAllocatedProject(user.studentId)

  return (
    <section className='space-y-6 py-6'>
      <div className='flex flex-col gap-4'>
        <Header title='Milestone Page!' description='Create and plan your objective here!' />
        {data == null ? (
          <div className='grid gap-2'>
            <p className='text-md text-secondary-foreground md:text-lg'>You have not been allocated to any project</p>
            <div>
              <Link className='text-primary hover:underline' href='/student'>
                Back to dashboard
              </Link>
            </div>
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>{data.title}</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <AddMilestoneForm projectId={data.id} statusOptions={['Pending', 'In Progress', 'Completed']} />
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  )
}

export default MilestonePage

const NoAccessToThePage = ({ message }: { message: string }) => {
  return (
    <section className='py-6'>
      <div className='space-y-4'>
        <Header title='Access Denied' description={message} />
        <div>
          <Link className='text-primary hover:underline' href='/student'>
            Back to dashboard
          </Link>
        </div>
      </div>
    </section>
  )
}
