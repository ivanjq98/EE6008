import { AdminConfig, FacultyConfig, StudentConfig } from '@/types'

export const studentConfig: StudentConfig = {
  homeUrl: '/student',
  mainNav: [
    {
      title: 'Plan',
      href: '/student/plan'
    },
    {
      title: 'Registration',
      href: '/student/registration'
    },
    {
      title: 'My Project',
      href: '/student/my-project'
    },
    {
      title: 'Peer Review',
      href: '/student/peer-review'
    }
  ]
}

export const facultyConfig: FacultyConfig = {
  homeUrl: '/faculty',
  mainNav: [
    {
      title: 'Dashboard',
      href: '/faculty'
    },
    {
      title: 'Add project',
      href: '/faculty/add-project'
    },
    {
      title: 'Your proposed project',
      href: '/faculty/my-proposal'
    },
    {
      title: 'View all projects',
      href: '/faculty/view-all-projects'
    },
    {
      title: 'Project Member',
      href: '/faculty/group'
    },
    {
      title: 'Mark Students',
      href: '/faculty/mark'
    }
  ],
  sideNav: [
    {
      title: 'Dashboard',
      href: '/faculty',
      icon: 'home',
      type: 'link'
    },
    {
      title: 'Proposal',
      type: 'header'
    },
    {
      title: 'Add project',
      href: '/faculty/add-project',
      icon: 'addProject',
      type: 'link'
    },
    {
      title: 'Proposed project',
      href: '/faculty/my-proposal',
      icon: 'viewProject',
      type: 'link'
    },
    {
      title: 'View all projects',
      href: '/faculty/view-all-projects',
      icon: 'viewAllProjects',
      type: 'link'
    },
    {
      title: 'Active project',
      type: 'header'
    },
    {
      title: 'Group',
      href: '/faculty/group',
      icon: 'student',
      type: 'link'
    },
    {
      title: 'Assessment',
      href: '/faculty/mark',
      icon: 'mark',
      type: 'link'
    },
    {
      title: 'Summary',
      type: 'header'
    },
    {
      title: 'Marks Overview',
      href: '/faculty/student-marks-overview',
      icon: 'reviewProjects',
      type: 'link'
    },
    {
      title: 'Statistics',
      href: '/faculty/statistics',
      icon: 'statistics',
      type: 'link'
    }
  ]
}

export const adminConfig: AdminConfig = {
  homeUrl: '/admin',
  mainNav: [
    {
      title: 'Manage Faculty',
      href: '/admin/users/manage-faculty'
    },
    {
      title: 'Manage Student',
      href: '/admin/users/manage-student'
    },

    {
      title: 'Semester Setting',
      href: '/admin/semester'
    },
    {
      title: 'Semester Venue',
      href: '/admin/venue'
    },
    {
      title: 'View Registration',
      href: '/admin/registration/view'
    },
    {
      title: 'Generate Registration',
      href: '/admin/registration/generate'
    },
    {
      title: 'Upload Registration',
      href: '/admin/registration/upload'
    },

    {
      title: 'View Projects',
      href: '/admin/project/view'
    }
  ],
  sideNav: [
    {
      title: 'Users',
      type: 'header'
    },
    {
      title: 'Faculty',
      href: '/admin/users/manage-faculty',
      icon: 'user',
      type: 'link'
    },
    {
      title: 'Student',
      href: '/admin/users/manage-student',
      icon: 'student',
      type: 'link'
    },
    {
      title: 'Semester',
      type: 'header'
    },
    {
      title: 'Setting',
      href: '/admin/semester',
      icon: 'calendar',
      type: 'link'
    },
    {
      title: 'Venue',
      href: '/admin/venue',
      icon: 'venue',
      type: 'link'
    },
    {
      title: 'Registration',
      type: 'header'
    },
    {
      title: 'View',
      href: '/admin/registration/view',
      icon: 'registration',
      type: 'link'
    },
    {
      title: 'Generate',
      href: '/admin/registration/generate',
      icon: 'generate',
      type: 'link'
    },
    {
      title: 'Upload',
      href: '/admin/registration/upload',
      icon: 'upload',
      type: 'link'
    },
    {
      title: 'Project',
      type: 'header'
    },
    {
      title: 'View',
      href: '/admin/project/view',
      icon: 'viewProject',
      type: 'link'
    }
  ]
}
