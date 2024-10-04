import { getServerSession } from 'next-auth'

import { MainNav } from '@/src/components/main-nav'
import { ModeToggle } from '@/src/components/mode-toggle'
import { Shell } from '@/src/components/shell'
import { SideNav } from '@/src/components/sidebar-nav'
import { UserNav } from '@/src/components/user-nav'
import { facultyConfig } from '@/src/config/nav-config'
import { authOptions } from '@/src/lib/auth'
import { prisma } from '@/src/lib/prisma'
import { SidebarNavItem } from '@/types'

interface FacultyLayoutProps {
  children: React.ReactNode
}

export default async function FacultyLayout({ children }: FacultyLayoutProps) {
  // check if the user is programme leader
  const session = await getServerSession(authOptions)
  const facultyId = session?.user?.facultyId

  if (!facultyId) return null

  // get active semester for faculty member
  const semesterData = await prisma.semester.findFirst({
    where: { active: true }
  })
  const semesterId = semesterData?.id

  const response = await prisma.programme.findMany({
    where: {
      leaderId: facultyId,
      semesterId
    }
  })

  const isProgrammeLeader = response.length > 0

  let newItems: SidebarNavItem[] = []

  if (isProgrammeLeader) {
    newItems = [
      ...facultyConfig.sideNav,
      { title: 'Programme Leader', type: 'header' },
      {
        title: 'Review Projects',
        href: '/faculty/review-projects',
        icon: 'reviewProjects',
        type: 'link'
      },
      {
        title: 'Project Moderator',
        href: '/faculty/project-moderator',
        icon: 'user',
        type: 'link'
      },
      {
        title: 'Module Marks',
        href: '/faculty/module-marks-overview',
        icon: 'student',
        type: 'link'
      }
    ]
  }

  return (
    <div className='container relative mx-auto flex min-h-screen w-full flex-col items-center justify-center gap-6 p-4'>
      <header className='sticky top-4 z-50 w-full border-border'>
        <Shell className='flex w-full items-center justify-between bg-background/70 px-3 py-3 backdrop-blur-lg md:px-6 md:py-3'>
          <MainNav items={facultyConfig.mainNav} homeUrl={facultyConfig.homeUrl} showDesktopNav={false} />
          <nav className='flex items-center justify-end gap-4'>
            <UserNav />
            <ModeToggle />
          </nav>
        </Shell>
      </header>
      <div className='flex w-full flex-1 gap-6 lg:gap-8'>
        <Shell className='hidden max-h-[calc(100vh-7rem)] max-w-min shrink-0 bg-background/70 md:p-4 lg:sticky lg:top-[106px] lg:block'>
          <SideNav items={isProgrammeLeader ? newItems : facultyConfig.sideNav} />
        </Shell>
        <Shell className='bg-background/70'>
          <main className='flex w-full flex-1 flex-col overflow-hidden p-1'>{children}</main>
        </Shell>
      </div>
    </div>
  )
}
