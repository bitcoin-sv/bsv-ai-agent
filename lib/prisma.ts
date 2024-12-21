import { PrismaClient } from '@/prisma/generated/client'
import { currentUser } from '@clerk/nextjs/server'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export const fetchUser = async () => {
  const user = await currentUser()
  if (!user) {
    return null
  }
  return prisma.user.findUnique({
    where: { userId: user.id }
  })
}
