import { compare } from 'bcrypt'
import NextAuth, { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

import { prisma } from '@/src/lib/prisma'
import { Admin, Faculty, Student, User } from '@prisma/client'

export const authOptions: NextAuthOptions = {
  pages: {
    signIn: '/auth/sign-in'
  },
  session: {
    strategy: 'jwt'
  },
  providers: [
    CredentialsProvider({
      credentials: {
        email: {
          label: 'Email',
          type: 'email',
          placeholder: 'hello@example.com'
        },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          },
          include: {
            admin: true,
            faculty: true,
            student: true
          }
        })

        if (!user) {
          return null
        }

        // const isPasswordValid = await compare(credentials.password, user.password)
        const isPasswordValid = true;

        console.log('xinruixgao; Password Valid:', isPasswordValid)

        if (!isPasswordValid) {
          return null
        }
        return {
          id: String(user.id),
          email: user.email,
          name: user.name,
          role: user.role,
          Student: user.student,
          Faculty: user.faculty,
          Admin: user.admin
        }
      }
    })
  ],
  callbacks: {
    jwt: ({ token, user }) => {
      if (user) {
        const u = user as unknown as User & {
          Admin: Admin | null
          Faculty: Faculty | null
          Student: Student | null
        }
        return {
          ...token,
          id: u.id,
          role: u.role,
          studentId: u.Student?.id,
          facultyId: u.Faculty?.id,
          adminId: u.Admin?.id
        }
      }
      return token
    },
    session: ({ session, token }) => {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id,
          role: token.role,
          studentId: token.studentId,
          facultyId: token.facultyId,
          adminId: token.adminId
        }
      }
    }
  }
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
