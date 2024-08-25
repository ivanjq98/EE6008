import { Icons } from '@/src/components/icons'

export type NavItem = {
  title: string
  href: string
  disabled?: boolean
}

export type MainNavItem = NavItem

export type SiteConfig = {
  name: string
  description: string
}

export type StudentConfig = {
  homeUrl: string
  mainNav: MainNavItem[]
}

export type FacultyConfig = {
  homeUrl: string
  mainNav: MainNavItem[]
  sideNav: SidebarNavItem[]
}

export type AdminConfig = {
  homeUrl: string
  mainNav: MainNavItem[]
  sideNav: SidebarNavItem[]
}

export type SidebarNavItem =
  | {
      title: string
      type: 'link'
      disabled?: boolean
      external?: boolean
      href: string
      icon?: keyof typeof Icons
    }
  | {
      title: string
      type: 'header'
    }

export enum MilestoneStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED'
}
