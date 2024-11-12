import { getServerSession } from 'next-auth'
import { Header } from '@/src/components/header'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/src/components/ui/table'
import { authOptions } from '@/src/lib/auth'
import { getStudentProjectRegistration } from '@/src/server/student'

const StudentRegistrationPage = async () => {
  const session = await getServerSession(authOptions)
  const user = session?.user
  if (!user) return null
  if (!user.studentId) return null

  const data = await getStudentProjectRegistration(user.studentId)

  return (
    <section className='space-y-6 py-6'>
      <div className='flex flex-col gap-4'>
        <Header title='Project Registration Page!' description='See your project registration here' />
        {data.length === 0 ? (
          <p className='text-md text-muted-foreground md:text-lg'>You have not registered any project</p>
        ) : (
          <Table>
            <TableCaption>A list of your project applications.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Faculty</TableHead>
                <TableHead>Programme</TableHead>
                <TableHead>Priority</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((project) => (
                <TableRow key={project.id}>
                  <TableCell className='font-medium'>{project.title}</TableCell>
                  <TableCell>{project.faculty}</TableCell>
                  <TableCell>{project.programme}</TableCell>
                  <TableCell>{project.priority}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </section>
  )
}

export default StudentRegistrationPage
